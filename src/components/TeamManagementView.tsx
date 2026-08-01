import React, { useState } from 'react';
import { Users, Plus, Shield, Mail, CheckCircle2, Clock, X, Trash2, Edit2, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { Language, TeamMember, WorkspaceRole, Workspace, UserProfile } from '../types';
import { translations } from '../i18n/translations';

interface TeamManagementViewProps {
  language: Language;
  user: UserProfile | null;
  activeWorkspace: Workspace | null;
  teamMembers: TeamMember[];
  onInviteMember: (email: string, role: WorkspaceRole) => Promise<void>;
  onUpdateRole: (id: string, newRole: WorkspaceRole) => Promise<void>;
  onRemoveMember: (id: string) => Promise<void>;
}

export const TeamManagementView: React.FC<TeamManagementViewProps> = ({
  language,
  user,
  activeWorkspace,
  teamMembers,
  onInviteMember,
  onUpdateRole,
  onRemoveMember
}) => {
  const isAr = language === 'ar';
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('Editor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role Edit modal state
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<WorkspaceRole>('Editor');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      await onInviteMember(email.trim(), role);
      setEmail('');
      setIsInviteModalOpen(false);
    } catch (err) {
      console.error("Invite error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRole = async () => {
    if (editingMember) {
      await onUpdateRole(editingMember.id, selectedRole);
      setEditingMember(null);
    }
  };

  const getRoleBadge = (r: WorkspaceRole) => {
    switch (r) {
      case 'Owner':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-extrabold px-2.5 py-1 rounded-lg text-[10px] uppercase">👑 Owner</span>;
      case 'Admin':
        return <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 font-extrabold px-2.5 py-1 rounded-lg text-[10px] uppercase">🛡️ Admin</span>;
      case 'Editor':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 font-extrabold px-2.5 py-1 rounded-lg text-[10px] uppercase">✏️ Editor</span>;
      case 'Viewer':
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 font-extrabold px-2.5 py-1 rounded-lg text-[10px] uppercase">👁️ Viewer</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {isAr ? 'إدارة أعضاء الفريق والصلاحيات' : 'Team Governance & Permissions'}
            </h1>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
              {activeWorkspace?.name || 'Zain Production'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isAr 
              ? 'دعوة الأعضاء عبر البريد الإلكتروني، وتعيين الأدوار (Owner, Admin, Editor, Viewer) مع التحكم الكامل بالأذونات.' 
              : 'Invite team members via email and assign role permissions with full RBAC protection.'}
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center space-x-2 space-x-reverse shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'دعوة عضو جديد' : 'Invite Member'}</span>
        </button>
      </div>

      {/* Role Explanation Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-amber-900">Owner</span>
            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">المالك</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            {isAr ? 'صلاحية مطلقة لإدارة مساحة العمل، الاشتراكات، وحذف المساحة.' : 'Full authority over workspace settings, billing, and workspace deletion.'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-indigo-900">Admin</span>
            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">مدير</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            {isAr ? 'إدارة الأعضاء، الدعوات، وإنشاء وتعديل وحذف كل مسارات العمل.' : 'Manage members, invite users, and build/delete all workflows.'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-blue-900">Editor</span>
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">محرر</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            {isAr ? 'إنشاء وتعديل وتشغيل مسارات العمل بدون صلاحية إدارة الأعضاء.' : 'Create, edit, and test workflows without access to team administration.'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-800">Viewer</span>
            <span className="text-[10px] font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded">مراقب</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            {isAr ? 'مشاهدة المسارات والسجلات فقط دون إمكانية التعديل والتغيير.' : 'View-only access to workflows, executions, and operational logs.'}
          </p>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">
              {isAr ? 'أعضاء مساحة العمل الحالية' : 'Current Workspace Members'}
            </h3>
          </div>
          <span className="bg-slate-100 text-slate-700 text-xs font-mono font-bold px-2.5 py-1 rounded-full">
            {teamMembers.length} {isAr ? 'أعضاء' : 'Members'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider">
              <tr>
                <th className="p-4 pr-6">{isAr ? 'العضو' : 'Member'}</th>
                <th className="p-4">{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                <th className="p-4">{isAr ? 'الصلاحية (Role)' : 'Role'}</th>
                <th className="p-4 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="p-4 text-center pl-6">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {teamMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pr-6 flex items-center space-x-3 space-x-reverse">
                    <div className="w-9 h-9 bg-indigo-100 text-indigo-700 font-extrabold rounded-2xl flex items-center justify-center text-xs">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{m.name}</span>
                      <span className="text-[10px] text-slate-400">انضم: {m.invitedAt}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 font-mono text-[11px]">{m.email}</td>
                  <td className="p-4">{getRoleBadge(m.role)}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center space-x-1 space-x-reverse px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      m.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {m.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{m.status === 'Active' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'دعوة معلقة' : 'Pending')}</span>
                    </span>
                  </td>
                  <td className="p-4 text-center pl-6">
                    <div className="flex items-center justify-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => {
                          setEditingMember(m);
                          setSelectedRole(m.role);
                        }}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title={isAr ? 'تعديل الصلاحية' : 'Edit Role'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {m.role !== 'Owner' && (
                        <button
                          onClick={() => onRemoveMember(m.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title={isAr ? 'إزالة العضو' : 'Remove Member'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {isAr ? 'دعوة عضو جديد عبر البريد' : 'Invite Team Member'}
                </h3>
              </div>
              <button onClick={() => setIsInviteModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@zainauto.io"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? 'الصلاحية (Role)' : 'Role Permission'}
                </label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value as WorkspaceRole)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Admin">Admin (مدير عالمي)</option>
                  <option value="Editor">Editor (محرر مسارات)</option>
                  <option value="Viewer">Viewer (مراقب فقط)</option>
                </select>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 leading-relaxed">
                {isAr 
                  ? 'سيتم تسجيل الدعوة في سجل التدقيق (Audit Log) وإرسالها لصندوق دعوات العضو فوراً.' 
                  : 'An invitation record will be logged in Cloud Firestore and delivered instantly.'}
              </div>

              <div className="flex items-center justify-end space-x-3 space-x-reverse pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال الدعوة الآن' : 'Send Invite')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">
                {isAr ? 'تعديل صلاحية العضو' : 'Update Member Role'}
              </h3>
              <button onClick={() => setEditingMember(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 font-medium">
                {isAr ? 'تعديل دور العضو:' : 'Updating role for:'} <strong className="text-slate-900">{editingMember.name} ({editingMember.email})</strong>
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isAr ? 'اختر الصلاحية الجديدة' : 'Select New Role'}</label>
                <select
                  value={selectedRole}
                  onChange={(e: any) => setSelectedRole(e.target.value as WorkspaceRole)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Admin">Admin (مدير كامل)</option>
                  <option value="Editor">Editor (محرر)</option>
                  <option value="Viewer">Viewer (مراقب)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 space-x-reverse pt-2">
                <button
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleSaveRole}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  {isAr ? 'حفظ التغييرات' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
