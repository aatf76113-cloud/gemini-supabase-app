import React, { useState, useEffect } from 'react';
import { Language, WorkspaceUsage, Workspace } from '../types';
import { usageService } from '../services/firebase';
import { 
  BarChart3, 
  Cpu, 
  Zap, 
  Users, 
  Database, 
  Globe, 
  ArrowUpRight, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface UsageViewProps {
  language: Language;
  activeWorkspace: Workspace | null;
}

export const UsageView: React.FC<UsageViewProps> = ({ language, activeWorkspace }) => {
  const isAr = language === 'ar';
  const [usage, setUsage] = useState<WorkspaceUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUsage = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const data = await usageService.getWorkspaceUsage(activeWorkspace.id);
      setUsage(data);
    } catch (err) {
      console.error("Error loading usage:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsage();
  }, [activeWorkspace]);

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'bg-rose-500';
    if (percent >= 75) return 'bg-amber-500';
    return 'bg-indigo-600';
  };

  const getPercent = (used: number, limit: number) => {
    if (!limit) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  // Calculate estimated USD cost based on Gemini Tokens ($0.15 per 1M tokens) + Execution compute ($0.0001 per run)
  const calculateEstimatedCostUSD = (tokens: number = 0, executions: number = 0) => {
    const tokenCost = (tokens / 1000000) * 0.15;
    const execCost = executions * 0.0001;
    return (tokenCost + execCost).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {isAr ? 'مراقبة الاستهلاك واستغلال الموارد (Usage & Metering)' : 'Workspace Resource Metering & Usage'}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">
                {activeWorkspace?.name || 'Zain Production'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr ? 'متابعة حية لاستهلاك الموارد، حد التشغيل، والذكاء الاصطناعي لمساحة العمل المحددة' : 'Live tracking of workflow runs, Gemini AI tokens, and API requests'}
            </p>
          </div>
        </div>

        <button
          onClick={loadUsage}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'تحديث المقاييس' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* Meter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Executions Meter */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'حد تنفيذ سير العمل' : 'Workflow Executions'}</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">
              {getPercent(usage?.workflowExecutions || 0, usage?.executionsLimit || 1)}%
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xl font-black text-slate-900">
                {(usage?.workflowExecutions || 0).toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">
                / {(usage?.executionsLimit || 25000).toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${getProgressColor(getPercent(usage?.workflowExecutions || 0, usage?.executionsLimit || 1))}`}
                style={{ width: `${getPercent(usage?.workflowExecutions || 0, usage?.executionsLimit || 1)}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            {isAr ? 'يتجدد الحساب شهرياً تلقائياً' : 'Resets monthly on billing cycle'}
          </p>
        </div>

        {/* Gemini AI Tokens Meter */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>{isAr ? 'استهلاك توكنز Gemini' : 'Gemini AI Tokens'}</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">
              {getPercent(usage?.geminiTokensUsed || 0, usage?.geminiTokensLimit || 1)}%
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xl font-black text-slate-900">
                {((usage?.geminiTokensUsed || 0) / 1000000).toFixed(2)}M
              </span>
              <span className="text-xs text-slate-400">
                / {((usage?.geminiTokensLimit || 3000000) / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${getProgressColor(getPercent(usage?.geminiTokensUsed || 0, usage?.geminiTokensLimit || 1))}`}
                style={{ width: `${getPercent(usage?.geminiTokensUsed || 0, usage?.geminiTokensLimit || 1)}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            {isAr ? 'معالجة النصوص وتوليد التحليلات' : 'Generative reasoning & scoring'}
          </p>
        </div>

        {/* API & Webhooks Requests */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? 'طلبات API و Webhooks' : 'API & Webhooks'}</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">
              {getPercent(usage?.apiRequests || 0, usage?.apiRequestsLimit || 1)}%
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xl font-black text-slate-900">
                {(usage?.apiRequests || 0).toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">
                / {(usage?.apiRequestsLimit || 100000).toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${getProgressColor(getPercent(usage?.apiRequests || 0, usage?.apiRequestsLimit || 1))}`}
                style={{ width: `${getPercent(usage?.apiRequests || 0, usage?.apiRequestsLimit || 1)}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            {isAr ? 'الطلبات الواردة والصادرة' : 'Inbound payloads & REST calls'}
          </p>
        </div>

        {/* Financial USD Cost Meter */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-indigo-900 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'التكلفة المالية التقديرية' : 'Estimated Cost (USD)'}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Live Rate
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white font-mono">
                ${calculateEstimatedCostUSD(usage?.geminiTokensUsed || 0, usage?.workflowExecutions || 0)}
              </span>
              <span className="text-xs text-indigo-300">/mo</span>
            </div>
            <p className="text-[11px] text-indigo-200/80 mt-1">
              {isAr ? 'حساب مبني على $0.15 لكل 1M توكنز + قدرة المعالجة' : 'Calculated at $0.15 / 1M tokens + execution compute'}
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown Table: Top Consuming Workflows */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isAr ? 'أعلى مسارات العمل استهلاكاً للموارد' : 'Top Resource Consuming Workflows'}</span>
          </h2>
          <span className="text-xs text-slate-500">{isAr ? 'ترتيب حسب استهلاك الذكاء الاصطناعي' : 'Sorted by AI tokens'}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <th className="p-3.5">{isAr ? 'اسم مسار العمل' : 'Workflow Name'}</th>
                <th className="p-3.5">{isAr ? 'عدد التنفيذات' : 'Executions'}</th>
                <th className="p-3.5">{isAr ? 'استهلاك توكنز Gemini' : 'Gemini Tokens'}</th>
                <th className="p-3.5 text-center">{isAr ? 'نسبة الاستهلاك' : 'Share'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {usage?.topWorkflows.map((wf, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{wf.name}</td>
                  <td className="p-3.5 text-slate-600 font-mono">{wf.executions.toLocaleString()}</td>
                  <td className="p-3.5 text-slate-600 font-mono">{(wf.tokens / 1000).toFixed(0)}k tokens</td>
                  <td className="p-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      {Math.round((wf.tokens / (usage.geminiTokensUsed || 1)) * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
