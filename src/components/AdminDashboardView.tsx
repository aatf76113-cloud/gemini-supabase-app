import React, { useState, useEffect } from 'react';
import { Language, UserProfile, AdminSystemStats, Workspace, NavTab } from '../types';
import { adminService, workspaceService } from '../services/firebase';
import { AIDiagnosticsView } from './AIDiagnosticsView';
import { AdminTrialDashboardView } from './AdminTrialDashboardView';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Workflow, 
  Zap, 
  Cpu, 
  Activity, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  RefreshCw,
  MoreVertical,
  Key,
  Database,
  BarChart2,
  Lock,
  Globe,
  Stethoscope,
  Gift
} from 'lucide-react';

interface AdminDashboardViewProps {
  language: Language;
  onNavigate?: (tab: NavTab) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ language, onNavigate }) => {
  const isAr = language === 'ar';
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'overview' | 'ai_diagnostics' | 'trials_referrals'>('overview');
  const [stats, setStats] = useState<AdminSystemStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Admin Broadcast Modal
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, wsData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getAllPlatformUsers(),
        workspaceService.getWorkspaces('usr-demo-admin', 'ahmed@zainauto.io')
      ]);
      setStats(statsData);
      setUsers(usersData);
      setWorkspaces(wsData);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (uid: string, newRole: string) => {
    const updated = await adminService.updateUserRole(uid, newRole);
    setUsers(updated);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setIsBroadcastOpen(false);
      setBroadcastMessage('');
    }, 1500);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">
                {isAr ? 'لوحة تحكم إدارة المنصة الشاملة' : 'Global Platform Admin Dashboard'}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                Beta System Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isAr ? 'مراقبة حية لجميع المستخدمين، مساحات العمل المتعددة (Multi-Tenant)، واستهلاك محرك Gemini' : 'Comprehensive oversight of users, multi-tenant workspaces, and system performance'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveAdminSubTab('ai_diagnostics')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isAr ? 'صفحة AI Diagnostics' : 'AI Diagnostics'}</span>
          </button>
          <button
            onClick={loadAdminData}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isAr ? 'تحديث البيانات' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAr ? 'بث تنبيه عام' : 'Broadcast System Alert'}</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 flex-wrap">
        <button
          onClick={() => setActiveAdminSubTab('overview')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeAdminSubTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>{isAr ? 'نظرة عامة على لوحة الإدارة' : 'Platform Overview'}</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('trials_referrals')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeAdminSubTab === 'trials_referrals'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Gift className="w-4 h-4 text-amber-400" />
          <span>{isAr ? 'التجارب والإحالات (SaaS Trials & Referrals)' : 'SaaS Trials & Referrals'}</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('ai_diagnostics')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeAdminSubTab === 'ai_diagnostics'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? 'تشخيص الذكاء الاصطناعي (AI Diagnostics)' : 'AI Diagnostics'}</span>
        </button>
      </div>

      {activeAdminSubTab === 'trials_referrals' ? (
        <AdminTrialDashboardView language={language} />
      ) : activeAdminSubTab === 'ai_diagnostics' ? (
        <AIDiagnosticsView language={language} />
      ) : (
        <>

      {/* Global Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{isAr ? 'إجمالي المستخدمين' : 'Total System Users'}</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalUsers || 142}</div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
            <span>↑ {stats?.activeUsers24h || 38} {isAr ? 'نشط خلال 24 ساعة' : 'active last 24h'}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{isAr ? 'مساحات العمل النشطة' : 'Active Workspaces'}</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalWorkspaces || 24}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isAr ? 'مساحات معزولة بالكامل Multi-Tenant' : 'Isolated Multi-Tenant Organizations'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{isAr ? 'التنفيذات الشهرية' : 'Monthly Executions'}</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{(stats?.totalExecutionsMonth || 54380).toLocaleString()}</div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">
            {isAr ? 'نسبة نجاح 99.8%' : '99.8% Success Rate'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{isAr ? 'استهلاك توكنز Gemini' : 'Gemini Tokens Consumed'}</span>
            <Cpu className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {((stats?.geminiApiTokensMonth || 7820000) / 1000000).toFixed(2)}M
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isAr ? 'استدعاءات ذكية لمسارات AI' : 'Smart Workflow Inferences'}
          </p>
        </div>
      </div>

      {/* System Health & Operations Ribbon */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-indigo-900/50 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <span className="text-xs text-slate-300">{isAr ? 'مؤشر سلامة النظام الإجمالي (System Health Score):' : 'Overall System Health Score:'}</span>
            <span className="font-bold text-emerald-400 text-sm ml-2 mr-2">
              {stats?.systemHealthScore || 99.9}% Operational
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'Firestore Sync: مستقر' : 'Firestore Sync: Stable'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>{isAr ? 'Gemini 1.5 Flash: متصل' : 'Gemini 1.5 Flash: Online'}</span>
          </div>
        </div>
      </div>

      {/* Platform Users & Access Control Directory */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>{isAr ? 'دليل مستخدمي المنصة والصلاحيات Global Users Directory' : 'Platform Users Directory & Access Controls'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr ? 'إدارة جميع الحسابات، الأدوار الشاملة، ومساحات العمل المرتبطة' : 'Manage account permissions and roles'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
              <input
                type="text"
                placeholder={isAr ? 'بحث بالاسم أو البريد...' : 'Search name or email...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64"
              />
            </div>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">{isAr ? 'جميع الأدوار' : 'All Roles'}</option>
              <option value="admin">Admin</option>
              <option value="developer">Developer</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <th className="p-3.5">{isAr ? 'المستخدم' : 'User'}</th>
                <th className="p-3.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                <th className="p-3.5">{isAr ? 'الدور الشامل' : 'Global Role'}</th>
                <th className="p-3.5">{isAr ? 'تاريخ التسجيل' : 'Registered At'}</th>
                <th className="p-3.5 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="p-3.5 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {isAr ? 'لا يوجد مستخدمين يطابقون خيارات البحث' : 'No users matching search filters'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs shrink-0">
                        {u.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.displayName}</span>
                    </td>
                    <td className="p-3.5 text-slate-600 font-mono text-[11px]">{u.email}</td>
                    <td className="p-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-xs focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="admin">System Admin</option>
                        <option value="developer">Developer</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {isAr ? 'نشط' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button 
                        className="px-2 py-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors text-[11px] font-semibold"
                        onClick={() => alert(isAr ? `تعديل إعدادات الحساب لـ ${u.displayName}` : `Edit settings for ${u.displayName}`)}
                      >
                        {isAr ? 'إدارة' : 'Manage'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Broadcast Modal */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? 'بث تنبيه عام للمنصة' : 'Broadcast System Notice'}</span>
              </h3>
              <button 
                onClick={() => setIsBroadcastOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {broadcastSent ? (
              <div className="p-6 text-center text-emerald-600 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <p className="font-bold text-sm">{isAr ? 'تم إرسال التنبيه لجميع المستلمين بنجاح!' : 'Broadcast notification sent successfully!'}</p>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isAr ? 'نص التنبيه العام (سيظهر فوراً لكل المستخدمين):' : 'Message content (will trigger in-app alert):'}
                  </label>
                  <textarea
                    rows={4}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder={isAr ? 'مثال: سيتم إجراء صيانة مجدولة لمسارات العمل اليوم الساعة 12 منتصف الليل...' : 'E.g., Scheduled maintenance for workflow engines at midnight...'}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBroadcastOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200"
                  >
                    {isAr ? 'بث الآن' : 'Broadcast Now'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
