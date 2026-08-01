import React, { useState } from 'react';
import { Building2, Plus, ShieldCheck, Users, GitFork, Check, ArrowRight, ExternalLink, Sparkles, Layers } from 'lucide-react';
import { Language, Workspace, UserProfile } from '../types';
import { translations } from '../i18n/translations';

interface WorkspacesViewProps {
  language: Language;
  user: UserProfile | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  onSelectWorkspace: (ws: Workspace) => void;
  onCreateWorkspace: (name: string) => Promise<void>;
  onNavigateToTeam: () => void;
}

export const WorkspacesView: React.FC<WorkspacesViewProps> = ({
  language,
  user,
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onCreateWorkspace,
  onNavigateToTeam
}) => {
  const isAr = language === 'ar';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateWorkspace(newWsName.trim());
      setNewWsName('');
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create workspace:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 space-x-reverse bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'نظام متعدد المستأجرين (Multi-tenant Architecture)' : 'Multi-tenant Enterprise System'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isAr ? 'مساحات العمل (Workspaces)' : 'Workspaces Management'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr 
                ? 'إدارة وتنظيم بيئات العمل المنفصلة مع عزل تام للبيانات، ومسارات العمل، والأعضاء والسجلات في Cloud Firestore.' 
                : 'Manage isolated multi-tenant workspaces with complete Firestore data separation, team governance, and audit logs.'}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 space-x-reverse self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إنشاء مساحة عمل جديدة' : 'Create New Workspace'}</span>
          </button>
        </div>
      </div>

      {/* Isolation Info Card */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="font-extrabold">
              {isAr ? 'عزل كامل لبيانات Firestore مفعل' : 'Complete Firestore Multi-Tenant Isolation Active'}
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              {isAr 
                ? 'يتم فصل سير العمل والتكاملات والتنفيذ وسجلات التدقيق تلقائياً لكل مساحة عمل.' 
                : 'Workflows, triggers, API connections, and audit logs are securely isolated per workspace ID.'}
            </p>
          </div>
        </div>

        <div className="hidden sm:block">
          <span className="bg-emerald-600 text-white text-[10px] font-mono px-2.5 py-1 rounded-full font-bold">
            SECURE-ISOLATION-OK
          </span>
        </div>
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {workspaces.map((ws) => {
          const isActive = activeWorkspace?.id === ws.id;
          return (
            <div 
              key={ws.id}
              className={`bg-white rounded-3xl p-6 border transition-all ${
                isActive 
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-xl' 
                  : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                    isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <h3 className="font-extrabold text-base text-slate-900">{ws.name}</h3>
                      {isActive && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1 space-x-reverse">
                          <Check className="w-3 h-3" />
                          <span>{isAr ? 'النشطة حالياً' : 'Current Active'}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">slug: {ws.slug}</p>
                  </div>
                </div>

                <span className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] px-2.5 py-1 rounded-lg border border-slate-200">
                  {ws.plan} PLAN
                </span>
              </div>

              {/* Workspace Details */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs my-4">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">{isAr ? 'المالك' : 'Owner'}</span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5">
                    {ws.ownerEmail || 'admin@zainauto.io'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">{isAr ? 'تاريخ الإنشاء' : 'Created At'}</span>
                  <span className="font-bold text-slate-800 block mt-0.5">
                    {new Date(ws.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                <button
                  onClick={() => onNavigateToTeam()}
                  className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center space-x-1.5 space-x-reverse"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إدارة أعضاء الفريق' : 'Manage Team'}</span>
                </button>

                {isActive ? (
                  <span className="text-xs font-bold text-slate-400 flex items-center space-x-1 space-x-reverse px-3 py-1.5 bg-slate-100 rounded-xl">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isAr ? 'محددة كبيئة عمل' : 'Selected Workspace'}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectWorkspace(ws)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5 space-x-reverse"
                  >
                    <span>{isAr ? 'الانتقال إلى هذه المساحة' : 'Switch Workspace'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {isAr ? 'إنشاء مساحة عمل جديدة' : 'Create New Workspace'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {isAr ? 'اسم مساحة العمل (Workspace Name)' : 'Workspace Name'}
                </label>
                <input
                  type="text"
                  required
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder={isAr ? 'مثال: مساحة التسويق الرقمي' : 'e.g. Marketing & Analytics Hub'}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 leading-relaxed">
                {isAr 
                  ? 'سيتم إنشاء مساحة عمل معزولة في Firestore وإضافة حسابك كمالك رئيسي (Owner).' 
                  : 'A dedicated multi-tenant record will be initialized in Cloud Firestore with full owner credentials.'}
              </div>

              <div className="flex items-center justify-end space-x-3 space-x-reverse pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !newWsName.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (isAr ? 'جاري الإنشاء...' : 'Creating...') : (isAr ? 'إنشاء مساحة العمل' : 'Create Workspace')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
