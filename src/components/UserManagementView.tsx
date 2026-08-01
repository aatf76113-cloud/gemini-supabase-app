import React, { useState } from 'react';
import { Users, Plus, Shield, Mail, CheckCircle2, Clock, X } from 'lucide-react';
import { Language, TeamMember } from '../types';
import { translations } from '../i18n/translations';

interface UserManagementViewProps {
  language: Language;
  teamMembers: TeamMember[];
  onAddMember: (member: Omit<TeamMember, 'id' | 'invitedAt'>) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  language,
  teamMembers,
  onAddMember
}) => {
  const t = translations[language];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Admin' | 'Editor' | 'Viewer'>('Editor');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) {
      onAddMember({ name, email, role, status: 'Active' });
      setName('');
      setEmail('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{t.users.title}</h1>
          <p className="text-xs text-slate-500 mt-1">{t.users.subtitle}</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center space-x-2 space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>{t.users.inviteBtn}</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider">
              <tr>
                <th className="p-4 pr-6">{t.users.colName}</th>
                <th className="p-4">{t.users.colEmail}</th>
                <th className="p-4">{t.users.colRole}</th>
                <th className="p-4 pl-6 text-center">{t.users.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {teamMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pr-6 flex items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center justify-center text-xs">
                      {m.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900">{m.name}</span>
                  </td>
                  <td className="p-4 text-slate-600">{m.email}</td>
                  <td className="p-4 font-bold text-slate-800">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px]">
                      {m.role}
                    </span>
                  </td>
                  <td className="p-4 pl-6 text-center">
                    <span className={`inline-flex items-center space-x-1 space-x-reverse px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      m.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {m.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{m.status === 'Active' ? t.users.statusActive : t.users.statusPending}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">{t.users.inviteBtn}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.users.colName}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="سعيد القحطاني"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.users.colEmail}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="saeed@zainauto.io"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.users.colRole}</label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Admin">{t.users.roleAdmin}</option>
                  <option value="Developer">{t.users.roleDeveloper}</option>
                  <option value="Viewer">{t.users.roleViewer}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
              >
                إرسال الدعوة الان
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
