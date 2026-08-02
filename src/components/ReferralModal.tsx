import React, { useState, useEffect } from 'react';
import { copyToClipboard } from '../utils/clipboard';
import { Language, ReferralStats, WorkspaceTrial } from '../types';
import { trialService } from '../services/trialService';
import { 
  Gift, 
  X, 
  Copy, 
  CheckCircle2, 
  Share2, 
  Users, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Send
} from 'lucide-react';

interface ReferralModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  userId: string;
  userEmail: string;
  onBonusEarned?: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  language,
  isOpen,
  onClose,
  workspaceId,
  userId,
  userEmail,
  onBonusEarned
}) => {
  const isAr = language === 'ar';
  const [trial, setTrial] = useState<WorkspaceTrial | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Form to claim code
  const [inputCode, setInputCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; msg?: string } | null>(null);

  const loadData = async () => {
    try {
      const trialData = await trialService.getOrCreateWorkspaceTrial(workspaceId, userId, userEmail);
      setTrial(trialData);
      const referralStats = await trialService.getReferralStats(userId, trialData.referralCode);
      setStats(referralStats);
    } catch (err) {
      console.warn("Error loading referral stats:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, workspaceId, userId, userEmail]);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    if (stats?.referralCode) {
      await copyToClipboard(stats.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyUrl = async () => {
    if (stats?.referralUrl) {
      await copyToClipboard(stats.referralUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const res = await trialService.applyReferralCode(userId, userEmail, workspaceId, inputCode.trim());

    setIsSubmitting(false);
    if (res.success) {
      setFeedback({
        success: true,
        msg: isAr ? res.messageAr : res.message
      });
      setInputCode('');
      await loadData();
      if (onBonusEarned) onBonusEarned();
    } else {
      setFeedback({
        success: false,
        msg: isAr ? res.messageAr : res.message
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Gift className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">
                  {isAr ? 'برنامج الدعوات والمكافآت (Referral Program)' : 'Referral & Reward Program'}
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Anti-Abuse Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {isAr ? 'احصل على +7 أيام تجربة إضافية عن كل صديق ينضم باستخدام كود الدعوة الخاص بك' : 'Earn +7 trial days for every friend who joins with your unique referral code'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Stats Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 text-center">
              <span className="text-2xl font-black text-amber-600 font-mono block">
                +{stats?.totalBonusDaysEarned || 0} / 30
              </span>
              <span className="text-xs font-bold text-amber-800">
                {isAr ? 'أيام تجربة مكتسبة' : 'Bonus Days Earned'}
              </span>
            </div>

            <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200/80 text-center">
              <span className="text-2xl font-black text-indigo-600 font-mono block">
                {stats?.totalConverted || 0}
              </span>
              <span className="text-xs font-bold text-indigo-800">
                {isAr ? 'دعوات ناجحة' : 'Successful Invites'}
              </span>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 text-center">
              <span className="text-2xl font-black text-emerald-600 font-mono block">
                30 {isAr ? 'يوماً' : 'Days'}
              </span>
              <span className="text-xs font-bold text-emerald-800">
                {isAr ? 'الحد الأقصى للتمديد' : 'Max Extension Limit'}
              </span>
            </div>
          </div>

          {/* User's Referral Code Section */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'كود الدعوة الرابط الخاص بك' : 'Your Personal Referral Link & Code'}</span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Code Box */}
              <div className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">{isAr ? 'كود الدعوة' : 'Referral Code'}</span>
                  <span className="text-lg font-black font-mono text-amber-400">{stats?.referralCode || 'ZAIN-LOADING'}</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? (isAr ? 'تم النسخ' : 'Copied!') : (isAr ? 'نسخ الكود' : 'Copy Code')}</span>
                </button>
              </div>

              {/* URL Box */}
              <div className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div className="truncate max-w-[180px]">
                  <span className="text-[10px] text-slate-400 block font-semibold">{isAr ? 'رابط التسجيل المباشر' : 'Direct Signup URL'}</span>
                  <span className="text-xs font-mono text-slate-300 truncate block">{stats?.referralUrl}</span>
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                >
                  {copiedUrl ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? (isAr ? 'تم النسخ' : 'Copied!') : (isAr ? 'نسخ الرابط' : 'Copy Link')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form to Apply an Inviter's Code */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Gift className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? 'هل لديك كود دعوة من صديق؟' : 'Have an Inviter Referral Code?'}</span>
            </h3>

            <form onSubmit={handleApplyCode} className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder={isAr ? 'أدخل كود الدعوة مثل ZAIN-A829BF' : 'Enter referral code e.g. ZAIN-A829BF'}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              />
              <button
                type="submit"
                disabled={isSubmitting || !inputCode.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{isAr ? 'استبدال الكود (+7 أيام)' : 'Claim (+7 Days)'}</span>
              </button>
            </form>

            {feedback && (
              <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                feedback.success 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                {feedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{feedback.msg}</span>
              </div>
            )}
          </div>

          {/* List of Invited Friends */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>{isAr ? 'سجل الأصدقاء المدعوين:' : 'Invited Friends Activity Log:'}</span>
              <span className="text-slate-400 text-[11px] font-normal">
                {stats?.rewards.length || 0} {isAr ? 'دعوات مسجلة' : 'Records'}
              </span>
            </h3>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {!stats?.rewards || stats.rewards.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  {isAr ? 'لم يقم أي صديق بالتسجيل بكودك بعد. شارك الرابط الآن!' : 'No friends have registered with your code yet. Share your link today!'}
                </div>
              ) : (
                stats.rewards.map((reward) => (
                  <div key={reward.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                    <div>
                      <span className="font-bold text-slate-800 block">{reward.invitedUserEmail}</span>
                      <span className="text-[10px] text-slate-400">{new Date(reward.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div>
                      {reward.status === 'active' ? (
                        <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          +{reward.bonusDaysGranted} {isAr ? 'أيام مضافة' : 'Days Added'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[11px] font-bold bg-rose-100 text-rose-700 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {isAr ? 'مرفوض - احتيال' : 'Flagged Abuse'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {isAr ? 'محمي بواسطة نظام منع إنشاء الحسابات الوهمية' : 'Protected by Anti-Abuse Duplicate Registration Detector'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
