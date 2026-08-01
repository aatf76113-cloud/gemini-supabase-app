import React, { useState } from 'react';
import { Mail, Check, X, Building2, Clock, ShieldCheck, Sparkles, Inbox } from 'lucide-react';
import { Language, Invitation, UserProfile } from '../types';

interface InvitationsViewProps {
  language: Language;
  user: UserProfile | null;
  invitations: Invitation[];
  onAcceptInvitation: (id: string) => Promise<void>;
  onDeclineInvitation: (id: string) => Promise<void>;
}

export const InvitationsView: React.FC<InvitationsViewProps> = ({
  language,
  user,
  invitations,
  onAcceptInvitation,
  onDeclineInvitation
}) => {
  const isAr = language === 'ar';
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    try {
      await onAcceptInvitation(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (id: string) => {
    setProcessingId(id);
    try {
      await onDeclineInvitation(id);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {isAr ? 'الدعوات الواردة (Invitations)' : 'Incoming Workspace Invitations'}
            </h1>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {invitations.length} {isAr ? 'دعوات' : 'Pending'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isAr 
              ? 'عرض وقبول دعوات الانضمام الواردة لحسابك من مساحات عمل المؤسسات والفرق الأخرى.' 
              : 'Review and respond to pending workspace invitations sent to your account.'}
          </p>
        </div>
      </div>

      {/* Invitations List */}
      {invitations.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-base text-slate-800">
            {isAr ? 'لا توجد دعوات معلقة حالياً' : 'No Pending Invitations'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isAr 
              ? 'عندما يقوم أحد مدرامي مساحات العمل بدعوتك، ستظهر الدعوة هنا مع تفاصيل الصلاحيات فوراً.' 
              : 'When team administrators invite you to join their workspace, new invites will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((inv) => (
            <div 
              key={inv.id}
              className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-md hover:shadow-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="flex items-start space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-indigo-600 text-white font-extrabold rounded-2xl flex items-center justify-center text-lg shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <h3 className="font-extrabold text-base text-slate-900">{inv.workspaceName}</h3>
                    <span className="bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {inv.role} ROLE
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {isAr ? 'مرسل الدعوة:' : 'Invited by:'} <span className="font-bold text-slate-800">{inv.invitedByEmail}</span>
                  </p>

                  <div className="flex items-center space-x-3 space-x-reverse text-[11px] text-slate-400 font-medium pt-1">
                    <span className="flex items-center space-x-1 space-x-reverse">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(inv.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</span>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold">
                      {isAr ? 'عزل كامل للبيانات بـ Cloud Firestore' : 'Firestore Tenant Isolation'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 space-x-reverse self-end sm:self-auto shrink-0">
                <button
                  onClick={() => handleDecline(inv.id)}
                  disabled={processingId === inv.id}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 space-x-reverse"
                >
                  <X className="w-4 h-4 text-slate-500" />
                  <span>{isAr ? 'رفض' : 'Decline'}</span>
                </button>

                <button
                  onClick={() => handleAccept(inv.id)}
                  disabled={processingId === inv.id}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center space-x-1.5 space-x-reverse"
                >
                  <Check className="w-4 h-4" />
                  <span>{processingId === inv.id ? (isAr ? 'جاري الانضمام...' : 'Joining...') : (isAr ? 'قبول وانضمام' : 'Accept & Join')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
