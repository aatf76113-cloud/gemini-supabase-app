import React, { useState } from 'react';
import { 
  GitFork, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Clock, 
  Database, 
  Slack, 
  Bot, 
  Plus,
  TrendingUp,
  Play
} from 'lucide-react';
import { Language, Workflow, ExecutionLog } from '../types';
import { translations } from '../i18n/translations';

interface DashboardViewProps {
  language: Language;
  workflows: Workflow[];
  executions: ExecutionLog[];
  userName: string;
  onOpenAIGeneratorWithPrompt: (prompt: string) => void;
  onNewWorkflow: () => void;
  onViewAllLogs: () => void;
  onViewWorkflows: () => void;
  onTestRunWorkflow: (workflow: Workflow) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  language,
  workflows,
  executions,
  userName,
  onOpenAIGeneratorWithPrompt,
  onNewWorkflow,
  onViewAllLogs,
  onViewWorkflows,
  onTestRunWorkflow
}) => {
  const t = translations[language];
  const isRtl = language === 'ar';
  const [quickPrompt, setQuickPrompt] = useState('');

  const activeWorkflowsCount = workflows.filter(w => w.active).length;
  const totalExecutions = workflows.reduce((acc, w) => acc + (w.executionsCount || 0), 0);
  const totalSuccess = workflows.reduce((acc, w) => acc + (w.successCount || 0), 0);
  const successPercentage = totalExecutions > 0 
    ? ((totalSuccess / totalExecutions) * 100).toFixed(1) 
    : '99.8';

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPrompt.trim()) {
      onOpenAIGeneratorWithPrompt(quickPrompt);
      setQuickPrompt('');
    }
  };

  const samplePrompts = [
    'عند استلام Webhook لعميل جديد، يحلل اهتمامه بـ Gemini ويحفظه بـ Firestore ويرسل Slack',
    'عند تأكيد الدفع عبر Stripe، يرسل إشعار واتساب للعميل وبريد إلكتروني مع الفاتورة',
    'جدولة يومية للنسخ الاحتياطي وإرسال تقرير بالبريد الإلكتروني'
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner & Quick AI Box */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-2 space-x-reverse mb-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Zain Automation AI Assistant</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 text-white">
            {t.dashboard.welcome} {userName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mb-6 font-medium leading-relaxed">
            {t.dashboard.subtitle}
          </p>

          {/* Quick AI Workflow Prompt */}
          <form onSubmit={handleQuickSubmit} className="relative">
            <div className="flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-lg">
              <input
                type="text"
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                placeholder={t.dashboard.aiPromptPlaceholder}
                className="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 space-x-reverse shrink-0"
              >
                <span>{t.dashboard.generateBtn}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* Prompt chips */}
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="text-slate-400 font-medium">أفكار مقترحة:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setQuickPrompt(p)}
                className="bg-white/5 hover:bg-white/15 text-slate-300 px-2.5 py-1 rounded-lg border border-white/10 transition-colors text-right"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Flows */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.dashboard.totalWorkflows}
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <GitFork className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{workflows.length}</p>
            <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center space-x-1 space-x-reverse">
              <TrendingUp className="w-3.5 h-3.5 inline" />
              <span>{activeWorkflowsCount} نشط حالياً</span>
            </p>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.dashboard.successRate}
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{successPercentage}%</p>
            <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${successPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Errors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.dashboard.errors}
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-rose-600">01</p>
            <p className="text-xs text-slate-400 font-medium mt-1">تتطلب مراجعة التوصيل</p>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.dashboard.activeTasks}
            </span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">1,248</p>
            <p className="text-xs text-slate-400 font-medium mt-1">{t.dashboard.activeNow}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Workflows Quick Action + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Workflows Quick List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">{t.workflows.title}</h3>
              <p className="text-xs text-slate-400">مسارات العمل النشطة وجاهزة للتجربة</p>
            </div>
            <button
              onClick={onViewWorkflows}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {t.dashboard.viewAll} ←
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {workflows.slice(0, 3).map((wf) => (
              <div
                key={wf.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 space-x-reverse min-w-0 pr-2">
                  <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                    ⚡
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {language === 'ar' ? wf.nameAr : wf.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {language === 'ar' ? wf.descriptionAr : wf.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse shrink-0">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    wf.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {wf.active ? t.workflows.published : t.workflows.draft}
                  </span>

                  <button
                    onClick={() => onTestRunWorkflow(wf)}
                    title="تشغيل تجريبي فوري"
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Executions Timeline */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">{t.dashboard.recentActivity}</h3>
              <p className="text-xs text-slate-400">سجل الأحداث الأخيرة</p>
            </div>
            <button
              onClick={onViewAllLogs}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {t.dashboard.viewAll} ←
            </button>
          </div>

          <div className="space-y-4 flex-1">
            {executions.slice(0, 4).map((exec) => (
              <div key={exec.id} className="flex items-start space-x-3 space-x-reverse">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                  exec.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}></div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {language === 'ar' ? (exec.workflowNameAr || exec.workflowName) : exec.workflowName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {exec.triggeredBy}
                  </p>
                  <div className="flex items-center space-x-2 space-x-reverse text-[10px] text-slate-400 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(exec.executedAt).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span className="font-mono">{exec.durationMs}ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
