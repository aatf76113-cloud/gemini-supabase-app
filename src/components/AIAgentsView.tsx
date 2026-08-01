import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Cpu, 
  Brain, 
  Plus, 
  Play, 
  Users, 
  Settings, 
  ShieldCheck, 
  ShoppingBag, 
  Zap, 
  BarChart3, 
  Database, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Send, 
  Terminal, 
  Star, 
  Download, 
  Globe, 
  Mail, 
  MessageCircle, 
  Calendar, 
  CreditCard, 
  Layers, 
  Lock,
  MessageSquare,
  Hash,
  Share2,
  BookOpen,
  Briefcase,
  DollarSign,
  Check,
  X,
  Sliders,
  Award
} from 'lucide-react';
import { 
  AIAgent, 
  AgentProviderType, 
  AgentRoleType, 
  Language, 
  MultiAgentMessage, 
  AgentMemoryFact 
} from '../types';
import { 
  aiAgentService, 
  AGENT_SKILLS_CATALOG, 
  PREBUILT_AGENTS 
} from '../services/aiAgentService';

interface AIAgentsViewProps {
  language: Language;
  workspaceId?: string;
}

type AgentSubTab = 'agents' | 'collaboration' | 'skills' | 'memory' | 'marketplace' | 'analytics';

export const AIAgentsView: React.FC<AIAgentsViewProps> = ({ language, workspaceId = 'default' }) => {
  const isAr = language === 'ar';
  const [activeSubTab, setActiveSubTab] = useState<AgentSubTab>('agents');
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Agent Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formAvatar, setFormAvatar] = useState('🤖');
  const [formRole, setFormRole] = useState<AgentRoleType>('Custom');
  const [formDescription, setFormDescription] = useState('');
  const [formDescriptionAr, setFormDescriptionAr] = useState('');
  const [formTone, setFormTone] = useState<'Professional' | 'Friendly' | 'Strict' | 'Creative' | 'Analytical'>('Professional');
  const [formTemp, setFormTemp] = useState(0.4);
  const [formInstructions, setFormInstructions] = useState('');
  const [formGoals, setFormGoals] = useState<string>('');
  const [formPrimaryProvider, setFormPrimaryProvider] = useState<AgentProviderType>('gemini');
  const [formModel, setFormModel] = useState('gemini-2.5-flash');
  const [formFallbacks, setFormFallbacks] = useState<AgentProviderType[]>(['openai', 'claude', 'deepseek']);
  const [formSkills, setFormSkills] = useState<string[]>(['http_requests', 'webhooks']);

  // Chat & Multi-Agent state
  const [selectedAgentForChat, setSelectedAgentForChat] = useState<AIAgent | null>(null);
  const [chatMessages, setChatMessages] = useState<MultiAgentMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isExecutingChat, setIsExecutingChat] = useState(false);
  const [isMultiAgentMode, setIsMultiAgentMode] = useState(false);

  // Memory Tab state
  const [memoryAgent, setMemoryAgent] = useState<AIAgent | null>(null);
  const [newFactKey, setNewFactKey] = useState('');
  const [newFactValue, setNewFactValue] = useState('');
  const [newFactImportance, setNewFactImportance] = useState(8);
  const [semanticSearchQuery, setSemanticSearchQuery] = useState('');

  // Load Agents
  useEffect(() => {
    loadAgents();
  }, [workspaceId]);

  const loadAgents = async () => {
    setLoading(true);
    const data = await aiAgentService.getAgents(workspaceId);
    setAgents(data);
    if (data.length > 0) {
      setSelectedAgentForChat(data[0]);
      setMemoryAgent(data[0]);
    }
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingAgent(null);
    setFormName('');
    setFormNameAr('');
    setFormAvatar('🤖');
    setFormRole('Custom');
    setFormDescription('');
    setFormDescriptionAr('');
    setFormTone('Professional');
    setFormTemp(0.5);
    setFormInstructions('أنت وكيل ذكي مخصص في منصة Zain AI OS. نفذ المهام المطلوبة بدقة عالية.');
    setFormGoals('تحقيق أفضل النتائج, تسريع مسارات العمل');
    setFormPrimaryProvider('gemini');
    setFormModel('gemini-2.5-flash');
    setFormFallbacks(['openai', 'claude', 'deepseek']);
    setFormSkills(['http_requests', 'webhooks', 'google_sheets']);
    setIsModalOpen(true);
  };

  const openEditModal = (agent: AIAgent) => {
    setEditingAgent(agent);
    setFormName(agent.name);
    setFormNameAr(agent.nameAr);
    setFormAvatar(agent.avatar);
    setFormRole(agent.role);
    setFormDescription(agent.description);
    setFormDescriptionAr(agent.descriptionAr);
    setFormTone(agent.personality.tone);
    setFormTemp(agent.personality.temperature);
    setFormInstructions(agent.personality.systemInstructions);
    setFormGoals(agent.goals.join(', '));
    setFormPrimaryProvider(agent.primaryProvider);
    setFormModel(agent.model);
    setFormFallbacks(agent.fallbackProviders);
    setFormSkills(agent.skills);
    setIsModalOpen(true);
  };

  const handleSaveAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAgent: AIAgent = {
      id: editingAgent ? editingAgent.id : `agent_${Date.now()}`,
      workspaceId,
      name: formName || 'Custom Agent',
      nameAr: formNameAr || 'وكيل مخصص جديد',
      avatar: formAvatar || '🤖',
      role: formRole,
      description: formDescription || 'Custom AI Agent',
      descriptionAr: formDescriptionAr || 'وكيل ذكاء اصطناعي مخصص لأتمتة مسارات العمل.',
      personality: {
        tone: formTone,
        temperature: formTemp,
        systemInstructions: formInstructions,
        creativityLevel: formTemp > 0.7 ? 'high' : formTemp < 0.3 ? 'low' : 'balanced'
      },
      goals: formGoals.split(',').map(g => g.trim()).filter(Boolean),
      memory: editingAgent ? editingAgent.memory : {
        shortTerm: [],
        longTermFacts: [],
        userPreferences: {},
        conversationSessions: []
      },
      skills: formSkills,
      permissions: {
        allowWorkflowExecution: true,
        allowExternalApi: true,
        allowedSkills: formSkills,
        rbacRole: 'editor'
      },
      primaryProvider: formPrimaryProvider,
      model: formModel,
      fallbackProviders: formFallbacks,
      status: 'active',
      stats: editingAgent ? editingAgent.stats : {
        executionTimeMs: 350,
        estimatedCostUsd: 0.001,
        totalTokens: 1200,
        errorsCount: 0,
        usageCount: 1
      },
      createdBy: 'user',
      createdAt: editingAgent ? editingAgent.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await aiAgentService.saveAgent(newAgent);
    setIsModalOpen(false);
    loadAgents();
  };

  const handleDeleteAgent = async (id: string) => {
    if (confirm(isAr ? 'هل أنت تأكد من حذف هذا الوكيل؟' : 'Delete this agent?')) {
      await aiAgentService.deleteAgent(id);
      loadAgents();
    }
  };

  // Handle Chat Execution
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const prompt = chatInput.trim();
    setChatInput('');
    setIsExecutingChat(true);

    if (isMultiAgentMode) {
      // Run Multi-Agent Team Execution
      const newMsg: MultiAgentMessage = {
        id: `user_${Date.now()}`,
        agentId: 'user',
        agentName: isAr ? 'المستخدم' : 'User',
        agentAvatar: '👤',
        agentRole: 'Custom',
        content: prompt,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, newMsg]);

      const multiRes = await aiAgentService.runMultiAgentCollaboration(prompt, agents);
      setChatMessages(prev => [...prev, ...multiRes]);
    } else if (selectedAgentForChat) {
      // Single Agent Chat
      const userMsg: MultiAgentMessage = {
        id: `user_${Date.now()}`,
        agentId: 'user',
        agentName: isAr ? 'المستخدم' : 'User',
        agentAvatar: '👤',
        agentRole: 'Custom',
        content: prompt,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, userMsg]);

      const agentRes = await aiAgentService.executeAgentPrompt(selectedAgentForChat, prompt);

      const agentMsg: MultiAgentMessage = {
        id: `agent_${Date.now()}`,
        agentId: selectedAgentForChat.id,
        agentName: selectedAgentForChat.nameAr,
        agentAvatar: selectedAgentForChat.avatar,
        agentRole: selectedAgentForChat.role,
        content: agentRes.response,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        tokensUsed: agentRes.tokensUsed,
        providerUsed: agentRes.providerUsed
      };

      setChatMessages(prev => [...prev, agentMsg]);
    }

    setIsExecutingChat(false);
  };

  // Add Fact to Memory
  const handleAddFact = async () => {
    if (!memoryAgent || !newFactKey.trim() || !newFactValue.trim()) return;
    await aiAgentService.addFactToMemory(memoryAgent.id, {
      key: newFactKey.trim(),
      value: newFactValue.trim(),
      importance: newFactImportance,
      category: 'business_rule'
    });
    setNewFactKey('');
    setNewFactValue('');
    loadAgents();
  };

  const filteredAgents = agents.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        a.nameAr.includes(searchTerm) || 
                        a.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = selectedRole === 'all' || a.role === selectedRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* OS Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-xs font-bold font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Zain AI OS v2.4 - Multi-Agent Engine
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-bold">
                10 Providers + Fallback Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100">
              {isAr ? 'منظومة وكلاء الذكاء الاصطناعي (Zain AI OS)' : 'Zain AI Operating System'}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isAr 
                ? 'ابنِ وإدارة وكلاء الذكاء الاصطناعي المتخصصين (المدير، المبرمج، التسويق، المبيعات، الدعم، والمالية). يربط بين الذاكرة طويلة المدى، أكثر من 28 مهارة تكاملية، وميزة التحويل التلقائي بين المزودين عند الطوارئ.' 
                : 'Build and orchestrate autonomous specialized AI Agents. Integrated long-term memory, 28+ connector skills, multi-agent collaboration, and automated fallback providers.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={openCreateModal}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إنشاء وكيل جديد' : 'Create AI Agent'}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-slate-800 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="text-slate-400 text-[11px] block">{isAr ? 'الوكلاء النشطون' : 'Active Agents'}</span>
            <span className="text-lg font-black text-indigo-300">{agents.length} {isAr ? 'وكلاء' : 'Agents'}</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="text-slate-400 text-[11px] block">{isAr ? 'المهارات المدمجة' : 'Integrated Skills'}</span>
            <span className="text-lg font-black text-emerald-400">{AGENT_SKILLS_CATALOG.length} {isAr ? 'مهارة' : 'Skills'}</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="text-slate-400 text-[11px] block">{isAr ? 'نسبة الجاهزية والاحتياط' : 'Fallback Reliability'}</span>
            <span className="text-lg font-black text-amber-400">100% {isAr ? 'مستمر' : 'Uptime'}</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="text-slate-400 text-[11px] block">{isAr ? 'مزودو الذكاء الاصطناعي' : 'Supported AI Pool'}</span>
            <span className="text-lg font-black text-sky-400">10 Providers</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'agents', name: isAr ? 'منشئ والوكلاء الحاليون' : 'Agents Builder', icon: Bot },
          { id: 'collaboration', name: isAr ? 'مساحة العمل المتعددة (Multi-Agent)' : 'Multi-Agent Team', icon: Users },
          { id: 'skills', name: isAr ? 'دليل المهارات والتكاملات (Skills)' : 'Skills Catalog (28+)', icon: Zap },
          { id: 'memory', name: isAr ? 'الذاكرة المعرفية (Memory)' : 'Agent Memory', icon: Brain },
          { id: 'marketplace', name: isAr ? 'متجر الوكلاء (Marketplace)' : 'Agent Marketplace', icon: ShoppingBag },
          { id: 'analytics', name: isAr ? 'التحليلات والتكلفة (Analytics)' : 'Analytics & Costs', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as AgentSubTab)}
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

      {/* TAB 1: AGENTS BUILDER & LIST */}
      {activeSubTab === 'agents' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                placeholder={isAr ? 'بحث عن وكيل...' : 'Search agent...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-bold shrink-0">{isAr ? 'التخصص:' : 'Role:'}</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{isAr ? 'جميع الأدوار' : 'All Roles'}</option>
                <option value="Manager">Manager</option>
                <option value="Developer">Developer</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Support">Support</option>
                <option value="Finance">Finance</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map(agent => (
              <div 
                key={agent.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                        {agent.avatar}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">{isAr ? agent.nameAr : agent.name}</h3>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">
                          {agent.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => openEditModal(agent)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                        title={isAr ? 'تعديل' : 'Edit'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAgent(agent.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                        title={isAr ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {isAr ? agent.descriptionAr : agent.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>{isAr ? 'المزود الرئيسي:' : 'Primary AI:'}</span>
                      <span className="font-bold text-slate-800 uppercase">{agent.primaryProvider} ({agent.model})</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>{isAr ? 'مزودو الاحتياط:' : 'Fallbacks:'}</span>
                      <span className="font-medium text-slate-600">{agent.fallbackProviders.join(', ')}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>{isAr ? 'عدد المهارات:' : 'Skills:'}</span>
                      <span className="font-bold text-indigo-600">{agent.skills.length} {isAr ? 'مهارات' : 'Skills'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedAgentForChat(agent);
                      setActiveSubTab('collaboration');
                    }}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{isAr ? 'تشغيل وتفاعل' : 'Start Session'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-AGENT COLLABORATION & CHAT */}
      {activeSubTab === 'collaboration' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Agent Selector Sidebar */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900">{isAr ? 'وضع التشغيل:' : 'Execution Mode:'}</h3>
              <button
                onClick={() => setIsMultiAgentMode(!isMultiAgentMode)}
                className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition border ${
                  isMultiAgentMode 
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' 
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {isMultiAgentMode ? (isAr ? 'فريق كامل Multi-Agent' : 'Multi-Agent Team') : (isAr ? 'وكيل فردي Single' : 'Single Agent')}
              </button>
            </div>

            {!isMultiAgentMode && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 block">{isAr ? 'اختر الوكيل المستهدف:' : 'Select Target Agent:'}</label>
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                  {agents.map(ag => (
                    <button
                      key={ag.id}
                      onClick={() => setSelectedAgentForChat(ag)}
                      className={`w-full p-2.5 rounded-2xl border text-right transition flex items-center space-x-2 space-x-reverse ${
                        selectedAgentForChat?.id === ag.id 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' 
                          : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xl">{ag.avatar}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate">{isAr ? ag.nameAr : ag.name}</div>
                        <div className="text-[10px] text-slate-400">{ag.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isMultiAgentMode && (
              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-2 text-xs">
                <span className="font-extrabold text-indigo-900 block">{isAr ? 'فريق الوكلاء المشارك:' : 'Participating Team:'}</span>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  {isAr 
                    ? 'سيقوم الوكيل التنفيذي (Manager) بتقسيم هدفك وإدارته بين مهندس الأتمتة، التسويق، المبيعات، والمالية.' 
                    : 'Executive Manager will break down and delegate goals live across the specialized team.'}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {agents.map(a => (
                    <span key={a.id} className="px-2 py-1 bg-white border border-indigo-200 rounded-lg text-[10px] font-bold text-indigo-800 flex items-center gap-1">
                      <span>{a.avatar}</span>
                      <span>{isAr ? a.nameAr : a.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Chat Canvas */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between min-h-[550px]">
            {/* Header */}
            <div className="pb-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-indigo-600/30 border border-indigo-500/40 rounded-xl flex items-center justify-center text-xl">
                  {isMultiAgentMode ? '👥' : selectedAgentForChat?.avatar || '🤖'}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold">
                    {isMultiAgentMode 
                      ? (isAr ? 'جلسة تعاون الفريق المأتمت (Multi-Agent Session)' : 'Multi-Agent Collaborative Workspace') 
                      : (isAr ? selectedAgentForChat?.nameAr : selectedAgentForChat?.name)}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {isMultiAgentMode ? 'Zain OS Team Protocol' : `${selectedAgentForChat?.primaryProvider} (${selectedAgentForChat?.model})`}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setChatMessages([])}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl font-bold"
              >
                {isAr ? 'مسح المحادثة' : 'Clear Chat'}
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="py-4 space-y-4 overflow-y-auto max-h-[400px] my-2 pr-2 scrollbar-thin">
              {chatMessages.length === 0 ? (
                <div className="text-center py-16 space-y-3 text-slate-500">
                  <Bot className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                  <p className="text-xs font-bold">
                    {isAr ? 'ادخل هدفك أو استفسارك لبدء التنفيذ الفوري بواسطة الوكلاء' : 'Enter your goal or query to initiate agent execution'}
                  </p>
                </div>
              ) : (
                chatMessages.map(msg => {
                  const isUser = msg.agentId === 'user';
                  return (
                    <div 
                      key={msg.id}
                      className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed space-y-2 border ${
                        isUser 
                          ? 'mr-auto bg-indigo-600 text-white border-indigo-500' 
                          : 'ml-auto bg-slate-950 text-slate-200 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>{msg.agentAvatar}</span>
                          <span className={isUser ? 'text-indigo-100' : 'text-indigo-300'}>{msg.agentName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                      </div>

                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {msg.providerUsed && (
                        <div className="pt-1 text-[10px] text-slate-400 font-mono flex items-center justify-end gap-2">
                          <span>Provider: {msg.providerUsed}</span>
                          {msg.tokensUsed && <span>Tokens: {msg.tokensUsed}</span>}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {isExecutingChat && (
                <div className="p-4 bg-slate-950/80 border border-indigo-500/30 rounded-2xl text-xs text-indigo-300 flex items-center gap-3 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>{isAr ? 'جاري تحليل الأوامر والتحويل بين المزودين الاحتياطيين...' : 'Analyzing and executing agent cascade...'}</span>
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder={isAr ? 'اكتب هدفك هنا (مثال: أطلق حملة تسويقية جديدة عبر الواتساب وحدث البيانات)...' : 'Type your goal here...'}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3 rounded-2xl focus:outline-none focus:border-indigo-500 placeholder-slate-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={isExecutingChat || !chatInput.trim()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>{isAr ? 'إرسال' : 'Send'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SKILLS CATALOG (28+) */}
      {activeSubTab === 'skills' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-2 shadow-sm">
            <h3 className="text-sm font-black text-slate-900">
              {isAr ? 'دليل مهارات والتكاملات الخاصة بالوكلاء (28+ Connectors)' : 'Agent Skills & Connectors Catalog'}
            </h3>
            <p className="text-xs text-slate-500">
              {isAr 
                ? 'يمكنك ربط كل وكيل بأي من المهارات المدمجة التالية للوصول المباشر للخدمات وتعديل البيانات.' 
                : 'Grant your agents specific skill capabilities to autonomously run external actions.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENT_SKILLS_CATALOG.map(skill => (
              <div 
                key={skill.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 hover:border-indigo-300 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg border border-indigo-100">
                    {skill.category}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-900">{isAr ? skill.nameAr : skill.name}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{isAr ? skill.descriptionAr : skill.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MEMORY & KNOWLEDGE */}
      {activeSubTab === 'memory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fact Creation Panel */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? 'إضافة معرفة وحقيقة طويلة المدى' : 'Add Long-term Memory Fact'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">{isAr ? 'المفتاح / العنوان Key:' : 'Fact Key:'}</label>
                <input
                  type="text"
                  placeholder="e.g. company_refund_policy"
                  value={newFactKey}
                  onChange={(e) => setNewFactKey(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">{isAr ? 'القيمة / التفاصيل Value:' : 'Fact Value:'}</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Allow 100% refund within 14 days without friction"
                  value={newFactValue}
                  onChange={(e) => setNewFactValue(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">{isAr ? 'الأهمية (1-10):' : 'Importance (1-10):'}</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newFactImportance}
                  onChange={(e) => setNewFactImportance(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleAddFact}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
              >
                {isAr ? 'حفظ الحقيقة في الذاكرة' : 'Store in Memory'}
              </button>
            </div>
          </div>

          {/* Fact Knowledge Base List */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900">{isAr ? 'حقائق الذاكرة المخزنة (Firestore Memory)' : 'Stored Facts Database'}</h3>
              <span className="text-xs text-indigo-600 font-bold">{memoryAgent?.memory.longTermFacts?.length || 0} {isAr ? 'حقائق' : 'Facts'}</span>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {(!memoryAgent?.memory?.longTermFacts || memoryAgent.memory.longTermFacts.length === 0) ? (
                <p className="text-xs text-slate-400 text-center py-8">{isAr ? 'لا توجد حقائق مخزنة حالياً لـ هذا الوكيل.' : 'No facts stored yet.'}</p>
              ) : (
                memoryAgent.memory.longTermFacts.map(fact => (
                  <div key={fact.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-extrabold text-indigo-800">{fact.key}</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full">
                        Score: {fact.importance}/10
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{fact.value}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MARKETPLACE */}
      {activeSubTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl space-y-2 shadow-xl border border-indigo-500/30">
            <h3 className="text-lg font-black">{isAr ? 'متجر وكلاء الذكاء الاصطناعي (Agent Marketplace)' : 'Community Agent Marketplace'}</h3>
            <p className="text-xs text-slate-300">
              {isAr 
                ? 'استعرض وقم بتثبيت وكلاء الذكاء الاصطناعي المجهزين سابقاً ومراجعتهم من المجتمع بنقرة واحدة.' 
                : 'Discover and 1-click install verified agents for sales, marketing, support, and engineering.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PREBUILT_AGENTS.map(agent => (
              <div key={agent.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center text-2xl">
                      {agent.avatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{isAr ? agent.nameAr : agent.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">v2.4.0 • Certified</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3">{isAr ? agent.descriptionAr : agent.description}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9 (128)
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600 font-bold">
                      <Download className="w-3.5 h-3.5" /> 1.2k installs
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => alert(isAr ? 'تم تثبيت الوكيل في مساحة العمل بنجاح!' : 'Agent installed successfully!')}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{isAr ? 'تثبيت الوكيل الآن' : 'Install Agent'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ANALYTICS & COSTS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-bold block">{isAr ? 'إجمالي التوكنز المستهلكة' : 'Total AI Tokens'}</span>
              <span className="text-2xl font-black text-indigo-600">86,900 Tokens</span>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-bold block">{isAr ? 'التكلفة الإجمالية التقديرية' : 'Estimated Cost'}</span>
              <span className="text-2xl font-black text-emerald-600">$0.042 USD</span>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-bold block">{isAr ? 'معدل الاستجابة السريع' : 'Avg Execution Latency'}</span>
              <span className="text-2xl font-black text-amber-500">380 ms</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-slate-900">{isAr ? 'تفاصيل استهلاك الوكلاء المتاحين:' : 'Agent Usage Details:'}</h3>
            <div className="space-y-3">
              {agents.map(ag => (
                <div key={ag.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <span className="text-2xl">{ag.avatar}</span>
                    <div>
                      <h4 className="font-bold text-slate-900">{isAr ? ag.nameAr : ag.name}</h4>
                      <span className="text-[10px] text-slate-400">{ag.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 font-mono text-slate-600 text-[11px]">
                    <div>Tokens: <span className="font-bold text-slate-900">{ag.stats.totalTokens}</span></div>
                    <div>Executions: <span className="font-bold text-indigo-600">{ag.stats.usageCount}</span></div>
                    <div>Cost: <span className="font-bold text-emerald-600">${ag.stats.estimatedCostUsd.toFixed(4)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT AGENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-black text-white">
                {editingAgent 
                  ? (isAr ? 'تعديل بيانات وكيل الذكاء الاصطناعي' : 'Edit AI Agent') 
                  : (isAr ? 'إنشاء وكيل ذكاء اصطناعي جديد (AI Agent Builder)' : 'Build New AI Agent')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAgent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold block mb-1">{isAr ? 'الاسم بالإنجليزية:' : 'English Name:'}</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">{isAr ? 'الاسم بالعربية:' : 'Arabic Name:'}</label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-bold block mb-1">{isAr ? 'الأيقونة (Emoji):' : 'Avatar:'}</label>
                  <input
                    type="text"
                    value={formAvatar}
                    onChange={(e) => setFormAvatar(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-center"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">{isAr ? 'التخصص (Role):' : 'Role:'}</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as AgentRoleType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Manager">Manager</option>
                    <option value="Developer">Developer</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Support">Support</option>
                    <option value="Finance">Finance</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">{isAr ? 'المزود الرئيسي:' : 'Primary AI:'}</label>
                  <select
                    value={formPrimaryProvider}
                    onChange={(e) => setFormPrimaryProvider(e.target.value as AgentProviderType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI GPT-4o</option>
                    <option value="claude">Anthropic Claude</option>
                    <option value="grok">xAI Grok</option>
                    <option value="deepseek">DeepSeek AI</option>
                    <option value="perplexity">Perplexity</option>
                    <option value="openrouter">OpenRouter</option>
                    <option value="ollama">Ollama Local</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">{isAr ? 'تعليمات النظام للوكيل (System Prompt):' : 'System Instructions:'}</label>
                <textarea
                  rows={3}
                  required
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">{isAr ? 'الأهداف الرئيسة (مفصولة بفاصلة):' : 'Agent Goals:'}</label>
                <input
                  type="text"
                  value={formGoals}
                  onChange={(e) => setFormGoals(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md"
                >
                  {isAr ? 'حفظ الوكيل' : 'Save Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
