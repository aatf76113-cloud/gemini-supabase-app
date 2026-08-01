import React, { useState, useEffect } from 'react';
import { Language, WorkspaceTrial } from '../types';
import { trialService } from '../services/trialService';
import { 
  Sparkles, 
  Gift, 
  Clock, 
  Zap, 
  Workflow, 
  Bot, 
  Cable, 
  AlertTriangle, 
  ChevronRight, 
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

interface TrialUsageBannerProps {
  language: Language;
  workspaceId: string;
  userId: string;
  userEmail: string;
  onOpenReferralModal: () => void;
  onOpenUpgradePage: () => void;
}

export const TrialUsageBanner: React.FC<TrialUsageBannerProps> = ({
  language,
  workspaceId,
  userId,
  userEmail,
  onOpenReferralModal,
  onOpenUpgradePage
}) => {
  const isAr = language === 'ar';
  const [trial, setTrial] = useState<WorkspaceTrial | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrial = async () => {
    try {
      const data = await trialService.getOrCreateWorkspaceTrial(workspaceId, userId, userEmail);
      setTrial(data);
    } catch (err) {
      console.warn("Failed to load trial banner status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrial();
    const interval = setInterval(fetchTrial, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [workspaceId, userId, userEmail]);

  if (loading || !trial) {
    return (
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800 animate-pulse flex items-center justify-between">
        <div className="h-4 w-48 bg-slate-800 rounded" />
        <div className="h-8 w-24 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  // Calculate days passed and remaining
  const nowMs = Date.now();
  const startMs = new Date(trial.startDate).getTime();
  const daysPassed = Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, trial.totalTrialDays - daysPassed);
  const isExpired = trial.status === 'expired' || remainingDays <= 0 || trial.tokensUsed >= trial.tokensLimit;
  const isConverted = trial.status.startsWith('converted_');

  // Percentages
  const daysPercent = Math.min(100, Math.round((daysPassed / trial.totalTrialDays) * 100));
  const tokensPercent = Math.min(100, Math.round((trial.tokensUsed / trial.tokensLimit) * 100));
  const remainingTokens = Math.max(0, trial.tokensLimit - trial.tokensUsed);

  if (isConverted) {
    return (
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                {trial.status.replace('converted_', '').toUpperCase()} PLAN ACTIVE
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                Verified Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isAr ? 'حسابك مفعل بخطة بريميوم. استمتع بكافة الحدود العالية والأولوية.' : 'Full Premium Plan Active. Unlimited automation scale enabled.'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenUpgradePage}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 shrink-0"
        >
          <span>{isAr ? 'إدارة الخطة' : 'Manage Subscription'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-4 shadow-md border transition-all ${
      isExpired 
        ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 border-rose-500/40 text-white' 
        : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-900/50 text-white'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Status Summary */}
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-xl border shrink-0 ${
            isExpired 
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-bounce' 
              : remainingDays <= 3 
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
              : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
          }`}>
            {isExpired ? <ShieldAlert className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 text-xs font-black rounded-full border uppercase ${
                isExpired 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                  : remainingDays <= 3 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}>
                {isExpired ? (isAr ? 'انتهت الفترة التجريبية' : 'TRIAL EXPIRED') : `${remainingDays} ${isAr ? 'أيام متبقية' : 'DAYS REMAINING'}`}
              </span>

              {trial.trialDaysBonus > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <Gift className="w-3 h-3 text-emerald-400" />
                  +{trial.trialDaysBonus} {isAr ? 'أيام مكافأة دعوات' : 'Bonus Days'}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-1 font-medium">
              {isExpired 
                ? (isAr ? 'انتهت فترة التجربة (15 يوماً أو 500 ألف رمز). يرجى الترقية لمتابعة التشغيل.' : 'Free 15-day trial or 500,000 token limit reached. Upgrade to keep workflows running.')
                : (isAr ? `تجربة مجانية لمدة 15 يوماً + 500,000 رمز ذكاء اصطناعي` : `Free 15-Day SaaS Trial | 500,000 AI Tokens Quota`)
              }
            </p>
          </div>
        </div>

        {/* Middle Resource Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
          {/* Days */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="w-3 h-3 text-indigo-400" />
                {isAr ? 'الأيام' : 'Days'}
              </span>
              <span className="font-mono font-bold text-white">{remainingDays}/{trial.totalTrialDays}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${remainingDays <= 3 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                style={{ width: `${Math.min(100, (remainingDays / trial.totalTrialDays) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Tokens */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1 font-semibold">
                <Zap className="w-3 h-3 text-emerald-400" />
                {isAr ? 'الرموز' : 'Tokens'}
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {(remainingTokens / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${tokensPercent}%` }} />
            </div>
          </div>

          {/* Workflows */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1 font-semibold">
                <Workflow className="w-3 h-3 text-blue-400" />
                {isAr ? 'المسارات' : 'Workflows'}
              </span>
              <span className="font-mono font-bold text-white">{trial.workflowsCount}/{trial.workflowsLimit}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${(trial.workflowsCount / trial.workflowsLimit) * 100}%` }} />
            </div>
          </div>

          {/* AI Agents */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1 font-semibold">
                <Bot className="w-3 h-3 text-purple-400" />
                {isAr ? 'الوكلاء' : 'Agents'}
              </span>
              <span className="font-mono font-bold text-white">{trial.aiAgentsCount}/{trial.aiAgentsLimit}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${(trial.aiAgentsCount / trial.aiAgentsLimit) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
          <button
            onClick={onOpenReferralModal}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Gift className="w-4 h-4 text-amber-400" />
            <span>{isAr ? '+7 أيام مجاناً' : 'Earn +7 Days'}</span>
          </button>

          <button
            onClick={onOpenUpgradePage}
            className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
              isExpired 
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30 animate-pulse' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? 'ترقية الخطة' : 'Upgrade Plan'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
