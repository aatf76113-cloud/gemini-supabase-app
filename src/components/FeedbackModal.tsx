import React, { useState } from 'react';
import { Language, UserFeedback } from '../types';
import { feedbackService } from '../services/firebase';
import { MessageSquarePlus, Star, X, Check, Send, AlertCircle, Heart } from 'lucide-react';

interface FeedbackModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
  currentPage?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  language,
  isOpen,
  onClose,
  workspaceId,
  currentPage = 'Dashboard'
}) => {
  const isAr = language === 'ar';
  const [rating, setRating] = useState(5);
  const [type, setType] = useState<'bug' | 'feature' | 'improvement' | 'general'>('general');
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    try {
      await feedbackService.submitFeedback({
        rating,
        type,
        comment,
        userName: userName.trim() || (isAr ? 'مستخدم تجريبي' : 'Beta User'),
        userEmail: userEmail.trim() || 'user@zainauto.io',
        page: currentPage,
        workspaceId
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setComment('');
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-5 left-5 rtl:left-5 ltr:right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
              <Heart className="w-7 h-7 fill-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {isAr ? 'شكراً لك! تم إرسال ملاحظتك بنجاح' : 'Thank You! Feedback Received'}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {isAr ? 'تساهم ملاحظاتك المباشرة في تحسين جودة وتجربة Zain Automation قبل الإطلاق النهائي.' : 'Your valuable input shapes the official production release of Zain Automation.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <MessageSquarePlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isAr ? 'ملاحظات النسخة التجريبية (Beta Feedback)' : 'Beta Feedback & Suggestions'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr ? 'شاركونا آراءكم، بلاغ عن أخطاء، أو اقتراح ميزات جديدة' : 'Help us perfect the platform before public deployment'}
                </p>
              </div>
            </div>

            {/* Rating Stars */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-center space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                {isAr ? 'تقييم تجربة الاستخدام:' : 'How would you rate your experience?'}
              </label>
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {isAr ? 'نوع الملاحظة:' : 'Feedback Category:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'general', ar: 'عامة', en: 'General' },
                  { key: 'bug', ar: 'خطأ / بلاغ (Bug)', en: 'Bug Report' },
                  { key: 'feature', ar: 'اقتراح ميزة', en: 'Feature Request' },
                  { key: 'improvement', ar: 'تحسين أداء', en: 'Improvement' }
                ].map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setType(cat.key as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      type === cat.key
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isAr ? cat.ar : cat.en}
                  </button>
                ))}
              </div>
            </div>

            {/* User Info Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  {isAr ? 'الاسم (اختياري):' : 'Name (Optional):'}
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={isAr ? 'أحمد علي' : 'John Doe'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  {isAr ? 'البريد (اختياري):' : 'Email (Optional):'}
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="user@zainauto.io"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {isAr ? 'تفاصيل الملاحظة:' : 'Your Feedback / Details:'}
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isAr ? 'اكتب ملاحظتك أو اقتراحك بالتفصيل هنا...' : 'Describe your experience or feature request...'}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isAr ? 'إرسال الملاحظة الآن' : 'Submit Feedback'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
