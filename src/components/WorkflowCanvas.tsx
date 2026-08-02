import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  ArrowRight,
  ArrowLeft,
  Play,
  Save,
  Plus,
  Trash2,
  Settings2,
  Webhook,
  Bot,
  Database,
  Slack,
  Mail,
  MessageSquare,
  Globe,
  CheckCircle2,
  X,
  Sparkles,
  Clock,
  Layers,
  Power,
  ChevronRight,
  Search,
  Key,
  Copy,
  Scissors,
  Clipboard,
  Maximize2,
  Minimize2,
  Zap,
  ShieldCheck,
  Check,
  Radio,
  FileCode,
  Terminal,
  Grid
} from 'lucide-react';

import { Language, Workflow, WorkflowStep, StepType, VaultSecret } from '../types';
import { runWorkflowTest, executeWorkflow } from '../services/workflowRunner';
import { translations } from '../i18n/translations';
import { CustomFlowNode, CustomNodeData } from './flow/CustomFlowNode';
import { CATALOG_NODES, CatalogNodeItem } from '../data/nodeCatalog';
import { getVaultSecrets, saveVaultSecret } from '../services/secretsService';
import { workflowService } from '../services/firebase';

interface WorkflowCanvasProps {
  language: Language;
  workflow: Workflow;
  onSaveWorkflow: (workflow: Workflow) => void;
  onBack: () => void;
}

const nodeTypes = {
  customNode: CustomFlowNode
};

export const WorkflowCanvasInner: React.FC<WorkflowCanvasProps> = ({
  language,
  workflow: initialWorkflow,
  onSaveWorkflow,
  onBack
}) => {
  const t = translations[language];
  const isRtl = language === 'ar';

  const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Sidebar states for 100+ catalog
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sidebarCategory, setSidebarCategory] = useState<string>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Runner & Save state
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);
  const [copiedNodeData, setCopiedNodeData] = useState<Node | null>(null);

  // Vault secrets
  const [vaultSecrets, setVaultSecrets] = useState<VaultSecret[]>(getVaultSecrets());
  const [newSecretValueInput, setNewSecretValueInput] = useState('');

  // 1. Convert Workflow Trigger & Steps into React Flow Nodes & Edges
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    
    // Trigger Node
    nodes.push({
      id: workflow.trigger.id,
      type: 'customNode',
      position: { x: 250, y: 80 },
      data: {
        title: workflow.trigger.title,
        titleAr: workflow.trigger.titleAr,
        subtitle: `Type: ${workflow.trigger.type}`,
        nodeType: 'trigger',
        icon: workflow.trigger.icon || 'Webhook',
        brandColor: '#6366F1',
        category: 'Trigger',
        config: workflow.trigger.config,
        language
      } as CustomNodeData
    });

    // Step Nodes
    workflow.steps.forEach((step, idx) => {
      // Lookup catalog info if available
      const catalogItem = CATALOG_NODES.find(c => c.key === step.type || c.id === step.id);

      nodes.push({
        id: step.id,
        type: 'customNode',
        position: { x: 250, y: 240 + idx * 160 },
        data: {
          title: step.title,
          titleAr: step.titleAr,
          subtitle: step.config?.prompt || step.config?.action || step.type,
          nodeType: (step.type === 'gemini_ai' ? 'ai' : step.type === 'condition' ? 'condition' : 'action'),
          icon: step.icon || catalogItem?.icon || 'Bot',
          brandColor: catalogItem?.brandColor || '#F59E0B',
          category: catalogItem?.category || 'Step',
          requiredSecretKey: catalogItem?.requiredSecretKey,
          secretConnected: !!vaultSecrets.find(s => s.key === catalogItem?.requiredSecretKey),
          config: step.config,
          language
        } as CustomNodeData
      });
    });

    return nodes;
  }, [workflow.id]);

  // Initial Edges
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    if (workflow.steps.length > 0) {
      edges.push({
        id: `e-${workflow.trigger.id}-${workflow.steps[0].id}`,
        source: workflow.trigger.id,
        target: workflow.steps[0].id,
        animated: true,
        style: { stroke: '#6366F1', strokeWidth: 2 }
      });

      for (let i = 0; i < workflow.steps.length - 1; i++) {
        edges.push({
          id: `e-${workflow.steps[i].id}-${workflow.steps[i + 1].id}`,
          source: workflow.steps[i].id,
          target: workflow.steps[i + 1].id,
          animated: true,
          style: { stroke: '#6366F1', strokeWidth: 2 }
        });
      }
    }
    return edges;
  }, [workflow.id]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // Edge connection callback
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true } as Edge, eds)),
    [setEdges]
  );

  // Handle Node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  // Filter Catalog Nodes (100+ nodes)
  const categoriesList = ['All', 'AI & LLM', 'Messaging & Chat', 'Email & Productivity', 'E-Commerce & Payments', 'Social Media', 'Databases & Storage', 'Developer Tools', 'Sales & CRM'];

  const filteredCatalogNodes = useMemo(() => {
    return CATALOG_NODES.filter(item => {
      const name = isRtl ? item.nameAr : item.name;
      const desc = isRtl ? item.descriptionAr : item.description;
      const matchesSearch = !sidebarSearch || name.toLowerCase().includes(sidebarSearch.toLowerCase()) || desc.toLowerCase().includes(sidebarSearch.toLowerCase()) || item.key.includes(sidebarSearch.toLowerCase());
      const matchesCat = sidebarCategory === 'All' || item.category === sidebarCategory;
      return matchesSearch && matchesCat;
    });
  }, [sidebarSearch, sidebarCategory, isRtl]);

  // Add node from catalog to Canvas
  const handleAddCatalogNode = (item: CatalogNodeItem) => {
    const newNodeId = `step-${item.key}-${Date.now().toString().slice(-4)}`;
    
    // Position below last node or default center
    const lastNodeY = nodes.length > 0 ? Math.max(...nodes.map(n => n.position.y)) + 160 : 200;

    const newNode: Node = {
      id: newNodeId,
      type: 'customNode',
      position: { x: 250, y: lastNodeY },
      data: {
        title: item.name,
        titleAr: item.nameAr,
        subtitle: item.description,
        nodeType: item.nodeType,
        icon: item.icon,
        brandColor: item.brandColor,
        category: item.category,
        requiredSecretKey: item.requiredSecretKey,
        secretConnected: !!vaultSecrets.find(s => s.key === item.requiredSecretKey),
        config: item.configFields.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue || '' }), {}),
        language
      } as CustomNodeData
    };

    setNodes((prev) => [...prev, newNode]);

    // Auto connect to last node if present
    if (nodes.length > 0) {
      const lastNodeId = nodes[nodes.length - 1].id;
      setEdges((prev) => [
        ...prev,
        {
          id: `e-${lastNodeId}-${newNodeId}`,
          source: lastNodeId,
          target: newNodeId,
          animated: true,
          style: { stroke: '#6366F1', strokeWidth: 2 }
        }
      ]);
    }

    setSelectedNodeId(newNodeId);
  };

  // Delete selected Node
  const handleDeleteSelected = () => {
    if (!selectedNodeId) return;
    if (selectedNodeId === workflow.trigger.id) {
      alert(isRtl ? 'لا يمكن حذف العقدة الرئيسية المـشغلة (Trigger)' : 'Cannot delete primary Trigger node');
      return;
    }
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setEdges((prev) => prev.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
  };

  // Copy / Paste node handlers
  const handleCopyNode = () => {
    if (!selectedNodeId) return;
    const target = nodes.find(n => n.id === selectedNodeId);
    if (target) setCopiedNodeData(target);
  };

  const handlePasteNode = () => {
    if (!copiedNodeData) return;
    const newId = `step-copy-${Date.now().toString().slice(-4)}`;
    const pastedNode: Node = {
      ...copiedNodeData,
      id: newId,
      position: { x: copiedNodeData.position.x + 40, y: copiedNodeData.position.y + 40 },
      data: { ...copiedNodeData.data }
    };
    setNodes((prev) => [...prev, pastedNode]);
    setSelectedNodeId(newId);
  };

  // Get currently selected Node
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedNodeData = selectedNode?.data as CustomNodeData | undefined;

  // Update selected Node Config
  const handleUpdateNodeConfig = (key: string, value: any) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNodeId) {
          const currentData = n.data as CustomNodeData;
          return {
            ...n,
            data: {
              ...currentData,
              config: { ...currentData.config, [key]: value }
            }
          };
        }
        return n;
      })
    );
  };

  // Update Node Title
  const handleUpdateNodeTitle = (title: string, titleAr: string) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNodeId) {
          const currentData = n.data as CustomNodeData;
          return {
            ...n,
            data: { ...currentData, title, titleAr }
          };
        }
        return n;
      })
    );
  };

  // Save new secret into Vault directly from Properties panel
  const handleSaveSecretFromNode = (secretKeyName: string) => {
    if (!newSecretValueInput) return;
    const newSecret: VaultSecret = {
      id: `sec-${Date.now()}`,
      name: `${secretKeyName} (Vault Secret)`,
      key: secretKeyName,
      category: 'API Key',
      value: newSecretValueInput,
      isMasked: true,
      status: 'valid',
      lastTestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedSecrets = saveVaultSecret(newSecret);
    setVaultSecrets(updatedSecrets);
    setNewSecretValueInput('');

    // Mark node as connected
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNodeId) {
          const currentData = n.data as CustomNodeData;
          return {
            ...n,
            data: { ...currentData, secretConnected: true }
          };
        }
        return n;
      })
    );
  };

  // Build reconstructed Workflow object from React Flow state for saving/executing
  const buildCurrentWorkflow = (): Workflow => {
    const triggerNode = nodes.find(n => n.id === workflow.trigger.id) || nodes[0];
    const triggerData = triggerNode?.data as CustomNodeData;

    const stepNodes = nodes.filter(n => n.id !== triggerNode.id);
    const steps: WorkflowStep[] = stepNodes.map(n => {
      const data = n.data as CustomNodeData;
      return {
        id: n.id,
        type: (data.category?.toLowerCase() || 'gemini_ai') as StepType,
        title: data.title,
        titleAr: data.titleAr || data.title,
        icon: data.icon,
        config: data.config || {}
      };
    });

    return {
      ...workflow,
      trigger: {
        ...workflow.trigger,
        title: triggerData?.title || workflow.trigger.title,
        titleAr: triggerData?.titleAr || workflow.trigger.titleAr,
        config: triggerData?.config || workflow.trigger.config
      },
      steps,
      updatedAt: new Date().toISOString()
    };
  };

  // Action: Save Workflow to Cloud Firestore
  const handleSaveToFirestore = async () => {
    const currentWf = buildCurrentWorkflow();
    try {
      await workflowService.saveWorkflow(currentWf);
      onSaveWorkflow(currentWf);
      setSaveSuccessToast(isRtl ? 'تم حفظ المسار بنجاح في Cloud Firestore' : 'Workflow saved to Cloud Firestore');
      setTimeout(() => setSaveSuccessToast(null), 3500);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  // Action: Publish Workflow
  const handlePublishWorkflow = async () => {
    const publishedWf: Workflow = {
      ...buildCurrentWorkflow(),
      status: 'Active',
      active: true
    };
    setWorkflow(publishedWf);
    await workflowService.saveWorkflow(publishedWf);
    onSaveWorkflow(publishedWf);
    setSaveSuccessToast(isRtl ? 'تم نشر المسار وهو جاهز للعمل التلقائي' : 'Workflow published and live!');
    setTimeout(() => setSaveSuccessToast(null), 3500);
  };

  // Action: Run Workflow via Automation Engine
  const handleRunExecution = async () => {
    setIsRunning(true);
    setExecutionResult(null);
    setShowLogModal(true);
    try {
      const currentWf = buildCurrentWorkflow();
      const result = await executeWorkflow(currentWf, { triggeredBy: 'Interactive Canvas' });
      setExecutionResult(result);
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative font-sans">
      {/* Toast Notification */}
      {saveSuccessToast && (
        <div className="absolute top-20 right-1/2 translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center space-x-2 space-x-reverse animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-extrabold text-xs">{saveSuccessToast}</span>
        </div>
      )}

      {/* Top Builder Control Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center space-x-3 space-x-reverse min-w-0">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
            title={isRtl ? 'رجوع' : 'Back'}
          >
            {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>

          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={isRtl ? workflow.nameAr : workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, nameAr: e.target.value, name: e.target.value })}
              className="font-extrabold text-sm sm:text-base text-slate-900 bg-transparent outline-none focus:bg-slate-50 px-2 py-0.5 rounded-lg border border-transparent focus:border-slate-200 truncate w-full"
            />
            <p className="text-[11px] text-slate-400 px-2 truncate">
              {isRtl ? workflow.descriptionAr : workflow.description}
            </p>
          </div>
        </div>

        {/* Action Buttons: Run, Save, Publish */}
        <div className="flex items-center space-x-2 space-x-reverse overflow-x-auto pb-1 sm:pb-0 shrink-0">
          {/* Status Badge */}
          <button
            onClick={() => setWorkflow({ ...workflow, active: !workflow.active })}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 space-x-reverse transition-all shrink-0 ${
              workflow.active ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{workflow.active ? (isRtl ? 'منشور (Live)' : 'Live') : (isRtl ? 'مسودة' : 'Draft')}</span>
          </button>

          {/* Quick Toolbar */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 shrink-0">
            <button
              onClick={handleCopyNode}
              disabled={!selectedNodeId}
              className="p-1.5 hover:bg-white text-slate-700 disabled:text-slate-300 rounded-lg transition-colors"
              title="نسخ (Copy Node)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handlePasteNode}
              disabled={!copiedNodeData}
              className="p-1.5 hover:bg-white text-slate-700 disabled:text-slate-300 rounded-lg transition-colors"
              title="لصق (Paste Node)"
            >
              <Clipboard className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={!selectedNodeId}
              className="p-1.5 hover:bg-rose-100 text-rose-600 disabled:text-slate-300 rounded-lg transition-colors"
              title="حذف (Delete Selected)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunExecution}
            disabled={isRunning}
            className="px-3 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5 space-x-reverse border border-slate-800 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-amber-300" />
            <span>{isRunning ? (isRtl ? 'جاري...' : 'Running...') : (isRtl ? 'تشغيل' : 'Run')}</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveToFirestore}
            className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center space-x-1.5 space-x-reverse shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isRtl ? 'حفظ' : 'Save'}</span>
          </button>

          {/* Publish Button */}
          <button
            onClick={handlePublishWorkflow}
            className="px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-100 transition-all flex items-center space-x-1.5 space-x-reverse shrink-0"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{isRtl ? 'نشر' : 'Publish'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Body: Sidebar 100+ Catalog | React Flow Canvas | Properties Side Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar 100+ Nodes Catalog */}
        <div className={`${isSidebarOpen ? 'w-72 sm:w-80 absolute inset-y-0 right-0 z-30 shadow-2xl md:relative md:inset-auto md:z-10' : 'w-12'} bg-white border-l border-slate-200 flex flex-col transition-all duration-300 shrink-0 shadow-sm`}>
          <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            {isSidebarOpen && (
              <div className="flex items-center space-x-2 space-x-reverse min-w-0">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h3 className="font-black text-xs text-slate-900 truncate">
                  {isRtl ? 'مكتبة العُقد (100+ Nodes)' : 'Node Catalog'}
                </h3>
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>

          {isSidebarOpen && (
            <div className="p-3 space-y-3 flex-1 overflow-y-auto">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder={isRtl ? 'بحث في 100+ عقدة...' : 'Search 100+ nodes...'}
                  className="w-full pr-8 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category selector */}
              <div className="flex overflow-x-auto gap-1 pb-1 text-[10px] font-bold scrollbar-none">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSidebarCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                      sidebarCategory === cat ? 'bg-indigo-600 text-white font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Node List Items */}
              <div className="space-y-2 pt-1">
                {filteredCatalogNodes.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleAddCatalogNode(item)}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center space-x-2.5 space-x-reverse min-w-0">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0"
                        style={{ backgroundColor: item.brandColor }}
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-xs text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {isRtl ? item.nameAr : item.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {item.category}
                        </p>
                      </div>
                    </div>

                    <button
                      className="p-1 bg-white border border-slate-200 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white rounded-lg transition-colors shadow-2xs shrink-0"
                      title="إضافة للوحة"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center Canvas with ReactFlow */}
        <div className="flex-1 h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-left"
            className="bg-slate-100"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#CBD5E1" />
            <Controls className="!bg-white !border-slate-200 !shadow-lg !rounded-2xl !p-1" />
            <MiniMap
              style={{ height: 100, width: 140 }}
              className="!bg-white !border-slate-200 !shadow-lg !rounded-2xl"
              nodeColor={(n) => ((n.data as CustomNodeData)?.brandColor || '#6366F1')}
            />

            <Panel position="top-right" className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200 text-[10px] font-bold text-slate-600 shadow-sm flex items-center space-x-2 space-x-reverse">
              <Grid className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isRtl ? 'لوحة تفاعلية متقدمة (Drag & Drop Canvas)' : 'Interactive Drag & Drop Canvas'}</span>
            </Panel>
          </ReactFlow>
        </div>

        {/* Right Properties Panel */}
        <div className="w-80 sm:w-96 bg-white border-r border-slate-200 flex flex-col h-full shadow-xl z-10 shrink-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-extrabold text-xs text-slate-900 flex items-center space-x-2 space-x-reverse">
              <Settings2 className="w-4 h-4 text-indigo-600" />
              <span>{isRtl ? 'لوحة الخصائص والإعدادات' : 'Properties Panel'}</span>
            </h3>
            {selectedNodeId && (
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100">
                {selectedNodeId}
              </span>
            )}
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
            {selectedNode && selectedNodeData ? (
              <>
                {/* Title & Icon Header */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                      اسم العقدة (Title)
                    </label>
                    <input
                      type="text"
                      value={isRtl ? (selectedNodeData.titleAr || selectedNodeData.title) : selectedNodeData.title}
                      onChange={(e) => handleUpdateNodeTitle(e.target.value, e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold">التصنيف: {selectedNodeData.category}</span>
                  </div>
                </div>

                {/* Auto Connection Detection (OAuth -> API Key -> Prompt Connect) */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-100 flex items-center space-x-1.5 space-x-reverse text-xs">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      <span>{isRtl ? 'حساب الربط الفعال (Connection Status)' : 'Connection Status'}</span>
                    </span>
                    {selectedNodeData.secretConnected ? (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {isRtl ? 'متصل تلقائياً' : 'Auto Connected'}
                      </span>
                    ) : (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {isRtl ? 'بحاجة لربط' : 'Requires Connection'}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {selectedNodeData.secretConnected
                      ? (isRtl ? 'تم اكتشاف حساب ربط معتمد لمزود الخدمة وتفعيله تلقائياً في هذا المسار.' : 'Connected account detected and linked automatically.')
                      : (isRtl ? 'لم يتم العثور على حساب ربط لهذه الخدمة. يمكنك إعداد OAuth أو إضافة مفتاح API.' : 'No active connection found for this service. Connect via OAuth or API key.')}
                  </p>

                  <div className="pt-1 flex items-center justify-between border-t border-slate-800 text-[11px]">
                    <span className="text-slate-400">
                      {isRtl ? 'طريقة الربط:' : 'Auth Mode:'} <strong className="text-indigo-300">OAuth / API Key</strong>
                    </span>
                    <button
                      onClick={() => onBack()}
                      className="text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>{isRtl ? 'فتح مركز الربط' : 'Open Connections'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Secret Key Binding Section */}
                {selectedNodeData.requiredSecretKey && (
                  <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-900 flex items-center space-x-1.5 space-x-reverse text-[11px]">
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        <span>ربط مفتاح API (Secrets Vault)</span>
                      </span>
                      {selectedNodeData.secretConnected ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-md">
                          متصل
                        </span>
                      ) : (
                        <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-2 py-0.5 rounded-md">
                          مطلوب
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-amber-800 leading-relaxed">
                      هذه العقدة تتطلب المفتاح: <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">{selectedNodeData.requiredSecretKey}</code>
                    </p>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-700">إدخال/تحديث القيمة في الخزنة:</label>
                      <div className="flex gap-1.5">
                        <input
                          type="password"
                          value={newSecretValueInput}
                          onChange={(e) => setNewSecretValueInput(e.target.value)}
                          placeholder="أدخل مفتاح API هنا..."
                          className="flex-1 p-2 bg-white border border-amber-300 rounded-xl font-mono text-[11px]"
                        />
                        <button
                          onClick={() => handleSaveSecretFromNode(selectedNodeData.requiredSecretKey!)}
                          className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                          ربط
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuration Fields */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-xs text-slate-900 border-b border-slate-100 pb-2">
                    إعدادات المدخلات (Input Parameters)
                  </h4>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">التعليمات / الأمر (Prompt / Command)</label>
                    <textarea
                      rows={4}
                      value={selectedNodeData.config?.prompt || selectedNodeData.config?.action || ''}
                      onChange={(e) => handleUpdateNodeConfig('prompt', e.target.value)}
                      placeholder="أدخل قالب البيانات أو التعليمات البرمجية..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                    />
                  </div>

                  {selectedNodeData.nodeType === 'trigger' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">رابط Webhook المباشر</label>
                      <input
                        type="text"
                        readOnly
                        value={`https://api.zainauto.io/v1/hooks/${workflow.id}`}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] text-indigo-600"
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-16 space-y-3">
                <Settings2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-slate-400 text-xs font-medium">
                  {isRtl ? 'انقر على إحدى العُقد في اللوحة لعرض وتعديل خصائصها' : 'Click any node on the canvas to configure settings'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Execution Logs Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Terminal className="w-5 h-5 text-amber-300" />
                <h3 className="font-extrabold text-sm">
                  {isRtl ? 'سجل تشغيل Automation Engine المباشر' : 'Live Automation Engine Log'}
                </h3>
              </div>
              <button onClick={() => setShowLogModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto font-mono text-xs">
              {isRunning ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-600 font-bold font-sans">جاري تنفيذ خط السير وسلسلة العُقد...</p>
                </div>
              ) : executionResult ? (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 font-sans flex items-center justify-between">
                    <div>
                      <p className="font-black">تم تنفيذ المسار بنجاح (Execution Success)</p>
                      <p className="text-[11px] font-mono text-emerald-700">Duration: {executionResult.durationMs}ms</p>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>

                  <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl border border-slate-800 overflow-x-auto">
                    <pre>{JSON.stringify(executionResult, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-center">لا توجد نتائج</p>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowLogModal(false)}
                className="px-5 py-2 bg-slate-900 text-white font-black text-xs rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = (props) => (
  <ReactFlowProvider>
    <WorkflowCanvasInner {...props} />
  </ReactFlowProvider>
);
