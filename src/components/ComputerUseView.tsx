import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Globe, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  Download, 
  Upload, 
  FileText, 
  Table, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Smartphone, 
  Layers, 
  Terminal, 
  MousePointer, 
  Lock, 
  ChevronRight, 
  RefreshCw, 
  Check, 
  X, 
  Maximize2,
  ListFilter,
  BarChart2,
  FileCode
} from 'lucide-react';
import { 
  Language, 
  ComputerUseSession, 
  ComputerUsePlan, 
  ComputerUseStep, 
  HumanApprovalRequest, 
  DetectedElement, 
  BrowserTab 
} from '../types';
import { computerUseService, SENSITIVE_ACTION_TYPES } from '../services/computerUseService';

interface ComputerUseViewProps {
  language: Language;
  workspaceId?: string;
}

type SubTab = 'automation' | 'visual_ai' | 'planner' | 'recorder' | 'vault_security' | 'audit_log';

export const ComputerUseView: React.FC<ComputerUseViewProps> = ({ language, workspaceId = 'default' }) => {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<SubTab>('automation');
  const [sessions, setSessions] = useState<ComputerUseSession[]>([]);
  const [activeSession, setActiveSession] = useState<ComputerUseSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Automation Bar state
  const [targetUrl, setTargetUrl] = useState('https://store.zain.ai/products');
  const [userGoal, setUserGoal] = useState(isAr ? 'استخراج أسعار المنتجات وتنزيل ملف Excel تلقائياً' : 'Extract product catalog and export Excel automatically');
  const [isExecuting, setIsExecuting] = useState(false);

  // Visual AI state
  const [detectedElements, setDetectedElements] = useState<DetectedElement[]>([]);
  const [highlightedElement, setHighlightedElement] = useState<DetectedElement | null>(null);

  // Human Approval Modal state
  const [pendingApproval, setPendingApproval] = useState<HumanApprovalRequest | null>(null);

  // Vault state
  const [selectedVaultCred, setSelectedVaultCred] = useState('cred_admin_secret');

  // Load Sessions
  useEffect(() => {
    loadSessions();
  }, [workspaceId]);

  const loadSessions = async () => {
    setLoading(true);
    const data = await computerUseService.getSessions(workspaceId);
    setSessions(data);
    if (data.length > 0) {
      setActiveSession(data[0]);
      setTargetUrl(data[0].activeUrl);
      setDetectedElements(computerUseService.detectVisualElements(data[0].activeUrl));
    }
    setLoading(false);
  };

  // Start New Automation Session
  const handleCreateAndStartSession = async () => {
    if (!targetUrl || !userGoal) return;
    setLoading(true);
    const session = await computerUseService.createSession(workspaceId, userGoal, targetUrl, userGoal);
    setActiveSession(session);
    setSessions(prev => [session, ...prev]);
    setDetectedElements(computerUseService.detectVisualElements(targetUrl));
    setLoading(false);
    
    // Auto execute plan
    executeSessionSteps(session, 0);
  };

  // Execute Step Sequence
  const executeSessionSteps = async (session: ComputerUseSession, startStepIdx: number) => {
    setIsExecuting(true);
    let currentSession = { ...session };

    for (let i = startStepIdx; i < currentSession.plan.steps.length; i++) {
      const res = await computerUseService.executeStep(currentSession, i);
      currentSession = res.updatedSession;
      setActiveSession({ ...currentSession });

      if (res.requiresApproval) {
        setPendingApproval(res.requiresApproval);
        setIsExecuting(false);
        return; // Pause execution until user approves
      }

      // Small delay between steps for visual feedback
      await new Promise(r => setTimeout(r, 800));
    }

    setIsExecuting(false);
  };

  // Respond to Approval
  const handleApprovalResponse = async (approved: boolean) => {
    if (!pendingApproval || !activeSession) return;
    
    if (approved) {
      const stepIdx = activeSession.currentStepIndex;
      setPendingApproval(null);
      // Resume execution
      executeSessionSteps(activeSession, stepIdx);
    } else {
      setPendingApproval(null);
      setActiveSession(prev => prev ? { ...prev, status: 'failed' } : null);
      setIsExecuting(false);
    }
  };

  // Switch Browser Tab
  const handleSwitchTab = (tabId: string) => {
    if (!activeSession) return;
    const updatedTabs = activeSession.tabs.map(t => ({
      ...t,
      active: t.id === tabId
    }));
    const targetTab = updatedTabs.find(t => t.id === tabId);
    if (targetTab) {
      setTargetUrl(targetTab.url);
      setDetectedElements(computerUseService.detectVisualElements(targetTab.url));
    }
    setActiveSession({
      ...activeSession,
      tabs: updatedTabs,
      activeTabId: tabId,
      activeUrl: targetTab?.url || activeSession.activeUrl
    });
  };

  // Add New Browser Tab
  const handleNewTab = () => {
    if (!activeSession) return;
    const newTab: BrowserTab = {
      id: `tab_${Date.now()}`,
      title: 'New Automation Window',
      url: 'https://admin.zain.ai/dashboard',
      active: true
    };
    const updatedTabs = activeSession.tabs.map(t => ({ ...t, active: false })).concat(newTab);
    setActiveSession({
      ...activeSession,
      tabs: updatedTabs,
      activeTabId: newTab.id,
      activeUrl: newTab.url
    });
    setTargetUrl(newTab.url);
  };

  // Edit Step in Planner
  const handleUpdatePlanStep = (stepId: string, newDesc: string) => {
    if (!activeSession) return;
    const updatedSteps = activeSession.plan.steps.map(s => 
      s.id === stepId ? { ...s, description: newDesc } : s
    );
    setActiveSession({
      ...activeSession,
      plan: {
        ...activeSession.plan,
        steps: updatedSteps
      }
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-xs font-bold font-mono flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-sky-400" />
                Computer Use Engine v2.5 • Visual AI & Autonomy
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-bold">
                Self-Healing Recovery Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100">
              {isAr ? 'محرك التحكم بالحاسوب والويب (Computer Use Engine)' : 'Computer Use Engine'}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isAr 
                ? 'تمكين وكلاء الذكاء الاصطناعي من تصفح الويب، النقر، ملء النماذج، استخراج البيانات، والرؤية البصرية مع حماية الخصوصية وموافقات الحوكمة البشرية عند العمليات الحساسة.' 
                : 'Empower AI agents to natively automate web browsers, interact with UI elements, extract tables, perform visual grounding, and execute safely under human approval guardrails.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center gap-3 text-xs">
              <Smartphone className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">{isAr ? 'التحكم عن بُعد' : 'Mobile Remote'}</span>
                <span className="font-bold text-emerald-400">{isAr ? 'متصل (Android & Web)' : 'Connected'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Goal / Address Bar Control */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:w-2/5">
            <Globe className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full text-xs font-mono pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          <div className="relative w-full md:w-3/5">
            <Sparkles className="w-4 h-4 text-indigo-500 absolute right-3.5 top-3.5" />
            <input
              type="text"
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              placeholder={isAr ? 'ادخل الهدف الذي تريد تنفيذه تلقائياً...' : 'Describe automation task...'}
              className="w-full text-xs pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          <button
            onClick={handleCreateAndStartSession}
            disabled={isExecuting}
            className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 shrink-0 transition"
          >
            {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isAr ? 'توليد الخطة والبدء' : 'Generate & Execute'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'automation', name: isAr ? 'المتصفح والأتمتة المباشرة' : 'Browser Automation', icon: Monitor },
          { id: 'visual_ai', name: isAr ? 'الرؤية البصرية (Visual AI)' : 'Visual AI Grounding', icon: Eye },
          { id: 'planner', name: isAr ? 'مخطط الخطوات الذكي' : 'AI Plan Generator', icon: Layers },
          { id: 'recorder', name: isAr ? 'مسجل وإعادة التشغيل' : 'Session Recorder & Replay', icon: RotateCcw },
          { id: 'vault_security', name: isAr ? 'الخزنة المشفرة (Vault)' : 'Secure Credentials', icon: Key },
          { id: 'audit_log', name: isAr ? 'سجل التدقيق والتتبع' : 'Audit Trail', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SubTab)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BROWSER AUTOMATION VIEW */}
      {activeTab === 'automation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Simulated Browser Canvas */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl space-y-4 text-white">
            {/* Multi-Tab Bar */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
              {activeSession?.tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleSwitchTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
                    tab.active 
                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">{tab.title}</span>
                </button>
              ))}
              <button
                onClick={handleNewTab}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300"
                title={isAr ? 'فتح تبويب جديد' : 'New Tab'}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Virtual Screen Viewport */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 min-h-[420px] relative flex flex-col justify-between overflow-hidden">
              {/* Top Status Overlay */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                  <span className="font-mono">{activeSession?.activeUrl}</span>
                </div>
                <span className="px-2.5 py-0.5 bg-slate-800 text-indigo-300 rounded-full text-[10px] font-mono">
                  DOM Self-Healing: Active
                </span>
              </div>

              {/* Simulated Page Content with Visual Elements */}
              <div className="my-6 space-y-6 relative">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                  <h3 className="text-sm font-bold text-slate-200">{isAr ? 'عناصر الصفحة المكتشفة بذكاء:' : 'Rendered Page & Interactive Elements:'}</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
                      <span>Search & Filters Input</span>
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-mono text-[10px]">#search-input</span>
                    </div>
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                      <span>Data Grid Export Table</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono text-[10px]">table.data-grid</span>
                    </div>
                  </div>
                </div>

                {isExecuting && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center space-y-3 z-20">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-xs font-bold text-indigo-200">
                      {isAr ? 'جاري تنفيذ خطوة المتصفح ورصد الاستجابة...' : 'Executing automation step...'}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Action Control Strip */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold flex items-center gap-1.5">
                    <MousePointer className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Click</span>
                  </button>
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Extract Table</span>
                  </button>
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload</span>
                  </button>
                </div>

                <span className="text-[10px] text-slate-500 font-mono">
                  Session ID: {activeSession?.id}
                </span>
              </div>
            </div>
          </div>

          {/* Execution Steps Sidebar */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-900">{isAr ? 'مسار الخطة التنفيذية:' : 'Execution Workflow Plan:'}</h3>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full">
                  {activeSession?.plan.steps.length || 0} Steps
                </span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {activeSession?.plan.steps.map((step, idx) => {
                  const isCurrent = activeSession.currentStepIndex === idx;
                  const isDone = step.status === 'completed';
                  return (
                    <div 
                      key={step.id}
                      className={`p-3 rounded-2xl border text-xs space-y-1.5 transition ${
                        isCurrent 
                          ? 'bg-indigo-50 border-indigo-300 shadow-sm' 
                          : isDone 
                            ? 'bg-slate-50 border-slate-200' 
                            : 'bg-white border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          #{step.stepNumber} {step.action.toUpperCase()}
                        </span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : isCurrent ? (
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-600">{step.description}</p>
                      {step.requiresHumanApproval && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold text-[9px] rounded-md inline-flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          Requires Approval
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => activeSession && executeSessionSteps(activeSession, activeSession.currentStepIndex)}
                disabled={isExecuting || !activeSession}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4" />
                <span>{isAr ? 'استكمال الخطوات' : 'Resume Plan Execution'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL AI GROUNDING */}
      {activeTab === 'visual_ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-black text-indigo-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-400" />
                <span>{isAr ? 'خريطة الرؤية البصرية للواجهة (Visual AI Overlay)' : 'Visual AI Element Grounding'}</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Gemini Vision Grounding Active</span>
            </div>

            {/* Bounding Boxes Screen Simulation */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[350px] relative space-y-4">
              <p className="text-xs text-slate-400">
                {isAr ? 'يتم تحليل لقطة الشاشة واستخراج جميع العناصر التفاعلية بدقة عالية مع رسم الأطر:' : 'Screenshot analyzed by Visual AI. Interactive elements mapped below:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {detectedElements.map(elem => (
                  <div
                    key={elem.id}
                    onMouseEnter={() => setHighlightedElement(elem)}
                    onMouseLeave={() => setHighlightedElement(null)}
                    className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                      highlightedElement?.id === elem.id 
                        ? 'bg-indigo-600/30 border-indigo-400' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-[10px] font-bold rounded-lg uppercase">
                        {elem.type}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {(elem.confidence * 100).toFixed(0)}% Match
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-100">{elem.label}</h4>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">{elem.selector}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-slate-900">{isAr ? 'تفاصيل العنصر المحدد:' : 'Selected Element Inspector:'}</h3>
            {highlightedElement ? (
              <div className="space-y-3 text-xs p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">{isAr ? 'عنوان العنصر:' : 'Label:'}</span>
                  <span className="font-bold text-slate-900">{highlightedElement.label}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{isAr ? 'المحدد CSS Selector:' : 'Selector:'}</span>
                  <span className="font-mono font-bold text-indigo-700">{highlightedElement.selector}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{isAr ? 'نسبة الثقة Vision Confidence:' : 'Confidence:'}</span>
                  <span className="font-bold text-emerald-600">{(highlightedElement.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-12">
                {isAr ? 'مرر الماوس فوق أي عنصر لرؤية تفاصيل الرؤية البصرية' : 'Hover over elements to inspect grounding details'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PLANNER */}
      {activeTab === 'planner' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">{isAr ? 'محرر خطة الأتمتة (AI Plan Studio)' : 'AI Execution Plan Studio'}</h3>
              <p className="text-xs text-slate-500">{isAr ? 'يمكنك التعديل الحقيقي على أي خطوة قبل البدء بالتنفيذ' : 'Review and edit generated step actions before execution.'}</p>
            </div>

            <button 
              onClick={() => activeSession && executeSessionSteps(activeSession, 0)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md"
            >
              {isAr ? 'تشغيل الخطة المعدلة' : 'Execute Custom Plan'}
            </button>
          </div>

          <div className="space-y-3">
            {activeSession?.plan.steps.map((step, idx) => (
              <div key={step.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="w-8 h-8 bg-indigo-100 text-indigo-800 font-extrabold rounded-xl flex items-center justify-center shrink-0">
                    #{step.stepNumber}
                  </span>
                  <div className="w-full">
                    <span className="font-bold text-slate-800 uppercase block">{step.action}</span>
                    <input
                      type="text"
                      value={step.description}
                      onChange={(e) => handleUpdatePlanStep(step.id, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500 mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[11px] text-slate-500">{step.targetSelector}</span>
                  {step.requiresHumanApproval && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-lg">
                      Approval Guard
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SESSION RECORDER & REPLAY */}
      {activeTab === 'recorder' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900">{isAr ? 'مسجل وإعادة تشغيل الجلسات (Session Replay & Export)' : 'Session Recorder & Replay'}</h3>
            <button
              onClick={() => {
                if (activeSession) {
                  const json = computerUseService.exportSessionJSON(activeSession);
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `computer_use_${activeSession.id}.json`;
                  a.click();
                }
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تصدير الجلسة JSON' : 'Export Session'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-600">{isAr ? 'الخطوات المسجلة بالكامل:' : 'Recorded Automation Logs:'}</h4>
            <div className="space-y-2">
              {activeSession?.recordedSteps.map((recStep, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-slate-900">Step {i + 1}: {recStep.description}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{recStep.executionTimeMs} ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: VAULT CREDENTIALS */}
      {activeTab === 'vault_security' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <Lock className="w-6 h-6 text-indigo-600" />
            <div>
              <h3 className="text-sm font-black text-slate-900">{isAr ? 'الخزنة المشفرة لبيانات الاعتماد (Vault Encryption)' : 'Encrypted Credentials Vault'}</h3>
              <p className="text-xs text-slate-500">{isAr ? 'تعبئة كلمات المرور تلقائياً دون إظهارها صراحة للوكيل أو في السجلات' : 'Auto-fill sensitive keys safely without exposing raw plain passwords.'}</p>
            </div>
          </div>

          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs space-y-2 text-indigo-900">
            <span className="font-bold block">{isAr ? 'بيانات الاعتماد النشطة للتعبئة التلقائية:' : 'Selected Active Credential:'}</span>
            <select
              value={selectedVaultCred}
              onChange={(e) => setSelectedVaultCred(e.target.value)}
              className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold"
            >
              <option value="cred_admin_secret">Zain Portal Admin Credential (vault:cred_admin_secret)</option>
              <option value="cred_payment_gateway">Stripe Live Gateway Credential (vault:cred_stripe_live)</option>
            </select>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {activeTab === 'audit_log' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-black text-slate-900">{isAr ? 'سجل التدقيق الشامل (Audit Log Trail):' : 'Full Computer Use Audit Log:'}</h3>
          <div className="space-y-2">
            {activeSession?.auditLogs.map(audit => (
              <div key={audit.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 block">{audit.action}</span>
                  <span className="text-slate-500 text-[11px]">{audit.details}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{audit.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HUMAN APPROVAL MODAL GUARD */}
      {pendingApproval && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-4">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
              <div>
                <h3 className="text-base font-black text-white">{isAr ? 'موافقة بشرية مطلوبة قبل التنفيذ' : 'Human Approval Required'}</h3>
                <span className="text-xs text-rose-300 font-mono">Sensitive Guardrail Action Detected</span>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-400 block">{isAr ? 'نوع العملية الحساسة:' : 'Sensitive Action Type:'}</span>
                <span className="font-bold text-rose-400 uppercase">{pendingApproval.actionType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{isAr ? 'وصف العملية:' : 'Description:'}</span>
                <p className="text-slate-200 font-medium">{pendingApproval.description}</p>
              </div>
              <div>
                <span className="text-slate-400 block">{isAr ? 'المستهدف:' : 'Target Selector:'}</span>
                <span className="font-mono text-indigo-400">{pendingApproval.target}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleApprovalResponse(true)}
                className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{isAr ? 'الموافقة والتنفيذ' : 'Approve & Run'}</span>
              </button>
              <button
                onClick={() => handleApprovalResponse(false)}
                className="w-1/2 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-2xl transition flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>{isAr ? 'رفض وإلغاء' : 'Reject Action'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
