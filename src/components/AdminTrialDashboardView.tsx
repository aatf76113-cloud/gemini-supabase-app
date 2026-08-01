import React, { useState, useEffect } from 'react';
import { Language, TrialAdminOverview, WorkspaceTrial } from '../types';
import { trialService } from '../services/trialService';
import { 
  Users, 
  Clock, 
  Gift, 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  UserCheck,
  Zap,
  ArrowUpRight,
  Filter
} from 'lucide-react';

interface AdminTrialDashboardViewProps {
  language: Language;
}

export const AdminTrialDashboardView: React.FC<AdminTrialDashboardViewProps> = ({ language }) => {
  const isAr = language === 'ar';
  const [data, setData] = useState<TrialAdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [extendingWorkspaceId, setExtendingWorkspaceId] = useState<string | null>(null);
  const [daysToAdd, setDaysToAdd] = useState<number>(7);

  const loadAdminOverview = async () => {
    setLoading(true);
    try {
      const overview = await trialService.getAdminTrialOverview();
      setData(overview);
    } catch (err) {
      console.warn("Failed to load admin trial overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminOverview();
  }, []);

  const handleAdminExtend = async (workspaceId: string, days: number) => {
    setExtendingWorkspaceId(workspaceId);
    await trialService.adminExtendTrial(workspaceId, days, 'Admin Manual Extension');
    await loadAdminOverview();
    setExtendingWorkspaceId(null);
  };

  const handleAdminConvert = async (workspaceId: string, plan: 'starter' | 'pro' | 'business' | 'enterprise') => {
    setExtendingWorkspaceId(workspaceId);
    await trialService.convertTrialPlan(workspaceId, plan);
    await loadAdminOverview();
    setExtendingWorkspaceId(null);
  };

  if (loading || !data) {
    return (
      <div className="p-8 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">
          {isAr ? 'جاري تحميل لوحة تحكم الاشتراكات والتجارب...' : 'Loading SaaS Trial & Referral Analytics...'}
        </p>
      </div>
    );
  }

  // Filtered trials
  const filteredTrials = data.trials.filter(t => {
    const matchesSearch = t.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.workspaceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.referralCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') return matchesSearch && t.status === 'active';
    if (statusFilter === 'expired') return matchesSearch && t.status === 'expired';
    if (statusFilter === 'converted') return matchesSearch && t.status.startsWith('converted_');
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Gift className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black">
              {isAr ? 'إدارة التجارب والدعوات (SaaS Trial & Referral Admin)' : 'SaaS Trial & Referral Management'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isAr ? 'مراقبة فترة التجربة (15 يوماً / 500k رمز)، تتبع الإحالات، ومنع الاحتيال' : 'Monitor 15-day 500k token trials, referral conversion rates, & fraud detection'}
            </p>
          </div>
        </div>

        <button
          onClick={loadAdminOverview}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isAr ? 'تحديث البيانات' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Active Trials */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">{isAr ? 'التجارب النشطة' : 'Active Trials'}</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono block">
            {data.activeTrialsCount}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">15-Day Free Quotas</span>
        </div>

        {/* Expired Trials */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">{isAr ? 'التجارب المنتهية' : 'Expired Trials'}</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono block">
            {data.expiredTrialsCount}
          </span>
          <span className="text-[10px] text-rose-500 font-semibold">Ready to Convert</span>
        </div>

        {/* Total Referrals */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">{isAr ? 'إجمالي الإحالات' : 'Referrals Sent'}</span>
            <Gift className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono block">
            {data.totalReferralsCount}
          </span>
          <span className="text-[10px] text-amber-600 font-semibold">+{data.totalBonusDaysGranted} Bonus Days</span>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">{isAr ? 'معدل التحويل' : 'Conversion Rate'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-600 font-mono block">
            {data.conversionRatePercent}%
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">Trial to Paid</span>
        </div>

        {/* MRR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">{isAr ? 'الإيراد الشهري (MRR)' : 'Monthly MRR'}</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono block">
            ${data.monthlyRecurringRevenueUsd}
          </span>
          <span className="text-[10px] text-indigo-600 font-semibold">ARR: ${data.annualRecurringRevenueUsd}</span>
        </div>

        {/* Flagged Fraud */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">{isAr ? 'إحالات مشبوهة' : 'Flagged Abuse'}</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-600 font-mono block">
            {data.flaggedReferrals.length}
          </span>
          <span className="text-[10px] text-amber-600 font-semibold">Blocked Attempts</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              {isAr ? 'سجل كافة الحسابات والتجارب النشطة' : 'Active & Expired SaaS Workspace Trials'}
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full">
              {filteredTrials.length} {isAr ? 'حساب' : 'accounts'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                {isAr ? 'الكل' : 'All'}
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${statusFilter === 'active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                {isAr ? 'نشط' : 'Active'}
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${statusFilter === 'expired' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
              >
                {isAr ? 'منتهي' : 'Expired'}
              </button>
            </div>

            {/* Search Box */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 rtl:right-3 rtl:left-auto" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isAr ? 'بحث بالبريد أو الكود...' : 'Search email or code...'}
                className="w-full pl-8 rtl:pr-8 rtl:pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3.5">{isAr ? 'المستخدم ومساحة العمل' : 'User & Workspace'}</th>
                <th className="p-3.5">{isAr ? 'كود الدعوة' : 'Referral Code'}</th>
                <th className="p-3.5">{isAr ? 'استهلاك الرموز (500k)' : 'Token Usage'}</th>
                <th className="p-3.5">{isAr ? 'الأيام المتبقية' : 'Days Left'}</th>
                <th className="p-3.5">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="p-3.5 text-right rtl:text-left">{isAr ? 'إجراءات الأدمن' : 'Admin Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTrials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    {isAr ? 'لا توجد نتائج مطابقة للبحث' : 'No trial accounts matching your query.'}
                  </td>
                </tr>
              ) : (
                filteredTrials.map((t) => {
                  const nowMs = Date.now();
                  const startMs = new Date(t.startDate).getTime();
                  const daysPassed = Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24));
                  const remainingDays = Math.max(0, t.totalTrialDays - daysPassed);
                  const isExhausted = t.status === 'expired' || remainingDays <= 0 || t.tokensUsed >= t.tokensLimit;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{t.userEmail}</span>
                        <span className="text-[10px] text-slate-400 block">{t.workspaceName || t.workspaceId}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-mono text-[11px] font-bold">
                          {t.referralCode}
                        </span>
                        {t.trialDaysBonus > 0 && (
                          <span className="text-[10px] text-emerald-600 block mt-0.5 font-bold">
                            +{t.trialDaysBonus} bonus days
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-1 w-32">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-mono">{t.tokensUsed.toLocaleString()}</span>
                            <span className="text-slate-400">/ 500k</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${t.tokensUsed >= 450000 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${Math.min(100, (t.tokensUsed / t.tokensLimit) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono font-bold">
                        {isExhausted ? (
                          <span className="text-rose-600">0 {isAr ? 'يوم' : 'Days'}</span>
                        ) : (
                          <span className="text-indigo-600">{remainingDays} / {t.totalTrialDays} {isAr ? 'يوم' : 'Days'}</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {t.status === 'active' && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                            Active Trial
                          </span>
                        )}
                        {t.status === 'expired' && (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">
                            Expired
                          </span>
                        )}
                        {t.status.startsWith('converted_') && (
                          <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-bold uppercase">
                            {t.status.replace('converted_', '')}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right rtl:text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Add Days */}
                          <button
                            disabled={extendingWorkspaceId === t.workspaceId}
                            onClick={() => handleAdminExtend(t.workspaceId, 7)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>+7 {isAr ? 'أيام' : 'Days'}</span>
                          </button>

                          {/* Convert to Pro */}
                          <button
                            disabled={extendingWorkspaceId === t.workspaceId}
                            onClick={() => handleAdminConvert(t.workspaceId, 'pro')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Pro Plan</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
