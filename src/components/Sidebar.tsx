import React from 'react';
import { 
  LayoutDashboard, 
  GitFork, 
  Plug, 
  Activity, 
  Users, 
  Settings, 
  Zap, 
  Plus,
  Sparkles,
  Database,
  BarChart3,
  Inbox,
  CreditCard,
  Wand2,
  ShoppingBag,
  Lock,
  Building2,
  ShieldCheck,
  Mail,
  FileText,
  Bell,
  Server,
  Gauge,
  Crown,
  FlaskConical,
  Key,
  Webhook,
  Terminal,
  HelpCircle,
  Award,
  Cpu,
  Bot,
  Monitor
} from 'lucide-react';
import { NavTab, Language } from '../types';
import { translations } from '../i18n/translations';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  language: Language;
  onNewWorkflow: () => void;
  onOpenAIGenerator: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  language,
  onNewWorkflow,
  onOpenAIGenerator
}) => {
  const t = translations[language];

  const mainMenuItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'readiness_report', label: t.nav.readinessReport, icon: <Award className="w-4 h-4 text-emerald-500" /> },
    { id: 'admin_dashboard', label: t.nav.adminDashboard, icon: <Crown className="w-4 h-4 text-amber-500" /> },
    { id: 'notifications', label: t.nav.notifications, icon: <Bell className="w-4 h-4 text-indigo-500" /> },
    { id: 'status', label: t.nav.status, icon: <Server className="w-4 h-4 text-emerald-500" /> },
    { id: 'usage', label: t.nav.usage, icon: <Gauge className="w-4 h-4 text-sky-500" /> },
    { id: 'testing', label: t.nav.testing, icon: <FlaskConical className="w-4 h-4 text-emerald-600" /> },
    { id: 'pricing', label: t.nav.pricing, icon: <CreditCard className="w-4 h-4 text-purple-500" /> },
    { id: 'api_keys', label: t.nav.apiKeys, icon: <Key className="w-4 h-4 text-amber-500" /> },
    { id: 'webhooks', label: t.nav.webhooks, icon: <Webhook className="w-4 h-4 text-indigo-500" /> },
    { id: 'monitoring', label: t.nav.monitoring, icon: <Activity className="w-4 h-4 text-emerald-500" /> },
    { id: 'developers', label: t.nav.developers, icon: <Terminal className="w-4 h-4 text-sky-600" /> },
    { id: 'help_center', label: t.nav.helpCenter, icon: <HelpCircle className="w-4 h-4 text-indigo-500" /> },
    { id: 'ai_builder', label: t.nav.aiBuilder, icon: <Wand2 className="w-4 h-4 text-amber-500" /> },
    { id: 'ai_agents', label: t.nav.aiAgents, icon: <Bot className="w-4 h-4 text-indigo-500 animate-pulse" /> },
    { id: 'computer_use', label: t.nav.computerUse, icon: <Monitor className="w-4 h-4 text-sky-400 animate-pulse" /> },
    { id: 'ai_providers', label: t.nav.aiProviders, icon: <Cpu className="w-4 h-4 text-indigo-500" /> },
    { id: 'ai_diagnostics', label: t.nav.aiDiagnostics, icon: <Activity className="w-4 h-4 text-emerald-500" /> },
    { id: 'workflows', label: t.nav.workflows, icon: <GitFork className="w-4 h-4" /> },
    { id: 'workspaces', label: t.nav.workspaces, icon: <Building2 className="w-4 h-4 text-indigo-600" /> },
    { id: 'team', label: t.nav.team, icon: <Users className="w-4 h-4 text-sky-600" /> },
    { id: 'invitations', label: t.nav.invitations, icon: <Mail className="w-4 h-4 text-purple-600" /> },
    { id: 'audit_log', label: t.nav.auditLog, icon: <ShieldCheck className="w-4 h-4 text-emerald-600" /> },
    { id: 'marketplace', label: t.nav.marketplace, icon: <ShoppingBag className="w-4 h-4 text-indigo-600" /> },
    { id: 'vault', label: t.nav.vault, icon: <Lock className="w-4 h-4 text-emerald-600" /> },
    { id: 'connections', label: t.nav.connections, icon: <Plug className="w-4 h-4" /> },
    { id: 'analytics', label: t.nav.analytics, icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'inbox', label: t.nav.inbox, icon: <Inbox className="w-4 h-4" /> },
    { id: 'logs', label: t.nav.logs, icon: <Activity className="w-4 h-4" /> },
    { id: 'billing', label: t.nav.billing, icon: <CreditCard className="w-4 h-4" /> },
    { id: 'settings', label: t.nav.settings, icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-white border-l border-slate-200 flex flex-col h-full select-none shrink-0">
      {/* Action CTA Buttons */}
      <div className="p-4 space-y-2 border-b border-slate-100">
        <button
          onClick={onNewWorkflow}
          className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl font-bold text-xs shadow-md shadow-indigo-100 transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>{t.nav.newWorkflow}</span>
        </button>

        <button
          onClick={() => onTabChange('ai_builder')}
          className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-slate-900 hover:bg-slate-800 text-amber-300 p-2.5 rounded-xl font-bold text-xs border border-slate-800 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.nav.aiBuilder}</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          القائمة الرئيسية / Main Menu
        </p>

        {mainMenuItems.map((item) => {
          const isActive = activeTab === item.id || (activeTab === 'builder' && item.id === 'workflows');
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 space-x-reverse p-2.5 rounded-xl font-semibold text-xs transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/80 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Pro Plan Usage & Firebase Status */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div 
          onClick={() => onTabChange('billing')}
          className="bg-slate-900 hover:bg-slate-950 text-white p-3.5 rounded-2xl shadow-sm text-xs cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
              PRO PLAN ACTIVE
            </span>
            <span className="bg-indigo-500/30 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">
              62%
            </span>
          </div>

          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
            <div className="bg-gradient-to-r from-indigo-500 to-amber-400 h-full w-[62%] rounded-full"></div>
          </div>

          <p className="text-[11px] font-medium text-slate-300 flex justify-between items-center">
            <span>12,402 / 20,000 المهام</span>
            <span className="text-[10px] text-amber-400 font-bold">ترقية</span>
          </p>
        </div>

        <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center space-x-1.5 space-x-reverse">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span>Cloud Firestore DB</span>
          </span>
          <span className="text-emerald-600 font-bold">متصل</span>
        </div>
      </div>
    </aside>
  );
};
