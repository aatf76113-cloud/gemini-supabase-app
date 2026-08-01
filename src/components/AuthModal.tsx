import React, { useState } from 'react';
import { X, Mail, Lock, User, ShieldCheck, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { authService } from '../services/firebase';
import { translations } from '../i18n/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onAuthSuccess
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const isRtl = language === 'ar';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userProfile: UserProfile;
      if (mode === 'login') {
        userProfile = await authService.loginWithEmail(email, password);
      } else {
        userProfile = await authService.registerWithEmail(email, password, name);
      }
      onAuthSuccess(userProfile);
      onClose();
    } catch (err: any) {
      setError(err?.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    const demoUser = authService.loginDemoUser();
    onAuthSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative">
        {/* Header Bar */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              Z
            </div>
            <span className="font-extrabold text-lg text-slate-800">
              Zain <span className="text-indigo-600">Auto</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">
              {mode === 'login' ? t.auth.welcomeBack : t.auth.createAccountTitle}
            </h2>
            <p className="text-xs text-slate-500">
              {mode === 'login'
                ? 'سجل دخولك لإدارة وتحديث مسارات العمل الأوتوماتيكية'
                : 'أنشئ حساباً جديداً للوصول الكامل إلى محرر المسارات الذكي'}
            </p>
          </div>

          {/* Direct Fast Demo Button */}
          <button
            type="button"
            onClick={handleDemoAccess}
            className="w-full mb-5 py-3 px-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 space-x-reverse transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{t.auth.demoLogin}</span>
          </button>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase">
              أو عبر البريد الإلكتروني
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.auth.fullName}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="أحمد الزين"
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.auth.email}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@zainauto.io"
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.auth.password}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-indigo-100 transition-all flex items-center justify-center space-x-2 space-x-reverse"
            >
              <span>{loading ? t.common.loading : (mode === 'login' ? t.auth.login : t.auth.register)}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="mt-6 text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                {t.auth.noAccount}{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  {t.auth.register}
                </button>
              </p>
            ) : (
              <p>
                {t.auth.hasAccount}{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  {t.auth.login}
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer info badge */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[10px] text-slate-400 flex items-center justify-center space-x-1.5 space-x-reverse">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t.auth.firebaseConnected}</span>
        </div>
      </div>
    </div>
  );
};
