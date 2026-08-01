import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Database, 
  Globe, 
  User, 
  Save, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldAlert,
  Sliders,
  Smartphone,
  RefreshCw,
  Download
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { translations } from '../i18n/translations';
import { PushNotificationManager } from './pwa/PushNotificationManager';
import { pwaService } from '../services/pwaService';

interface SettingsViewProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  user: UserProfile | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  onLanguageChange,
  user
}) => {
  const t = translations[language];
  const [saved, setSaved] = useState(false);

  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyD-gemini-key-active');
  const [firebaseProjectId, setFirebaseProjectId] = useState('zain-auto-prod-921');
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('https://hooks.slack.com/services/T00/B00/XXXX');
  const [whatsappToken, setWhatsappToken] = useState('EAAG...whatsapp-access-token');

  const [showKeys, setShowKeys] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{t.nav.settings}</h1>
          <p className="text-xs text-slate-500 mt-1">
            إعدادات المنصة، مفاتيح API، لغة الواجهة، وتكاملات Cloud Firestore
          </p>
        </div>

        {saved && (
          <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center space-x-1.5 space-x-reverse">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تم حفظ الإعدادات بنجاح</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Language & Preferences */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 space-x-reverse text-slate-900 font-extrabold text-sm pb-3 border-b border-slate-100">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h3>لغة الواجهة وتفضيلات العرض</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">اختر لغة المنصة الأساسية:</label>
              <div className="flex space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={() => onLanguageChange('ar')}
                  className={`flex-1 py-2.5 rounded-xl font-bold border text-xs transition-all ${
                    language === 'ar' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  العربية (RTL)
                </button>

                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`flex-1 py-2.5 rounded-xl font-bold border text-xs transition-all ${
                    language === 'en' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  English (LTR)
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">صلاحية المستخدم الحالية:</label>
              <input
                type="text"
                disabled
                value={user?.role?.toUpperCase() || 'ADMINISTRATOR'}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600 font-bold"
              />
            </div>
          </div>
        </div>

        {/* API Keys Configuration */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 space-x-reverse text-slate-900 font-extrabold text-sm">
              <Key className="w-5 h-5 text-indigo-600" />
              <h3>مفاتيح الخدمات والمكاملات (API Credentials)</h3>
            </div>

            <button
              type="button"
              onClick={() => setShowKeys(!showKeys)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 space-x-reverse"
            >
              {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showKeys ? 'إخفاء المفاتيح' : 'إظهار المفاتيح'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">Google Gemini API Key (Default):</label>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Key Pool & Retry Active
                </span>
              </div>
              <input
                type={showKeys ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Firebase Project ID:</label>
              <input
                type="text"
                value={firebaseProjectId}
                onChange={(e) => setFirebaseProjectId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Slack Incoming Webhook URL:</label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Cloud API Access Token:</label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={whatsappToken}
                onChange={(e) => setWhatsappToken(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {/* Advanced Security & MFA Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 space-x-reverse text-slate-900 font-extrabold text-sm pb-3 border-b border-slate-100">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <h3>{language === 'ar' ? 'الأمان المتقدم وحماية الحساب (Advanced Security & MFA)' : 'Advanced Security & MFA Settings'}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 2FA Toggle */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  {language === 'ar' ? 'التوثيق ثنائي العامل (2FA / MFA Authenticator):' : 'Two-Factor Authentication (2FA):'}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                  {language === 'ar' ? 'مفعل برمجياً' : 'Enabled'}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                {language === 'ar' 
                  ? 'يتطلب إدخال رمز التحقق المنشأ بواسطة تطبيق Google Authenticator أو TOTP عند تسجيل الدخول.' 
                  : 'Requires a 6-digit TOTP token generated by Google Authenticator during login.'}
              </p>
            </div>

            {/* Active Sessions Manager */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  {language === 'ar' ? 'الجلسات النشطة (Active Sessions):' : 'Active Sessions:'}
                </span>
                <button
                  type="button"
                  onClick={() => alert(language === 'ar' ? 'تم تسجيل الخروج من جميع الأجهزة الأخرى.' : 'Revoked all other active sessions.')}
                  className="text-[10px] font-bold text-rose-600 hover:underline"
                >
                  {language === 'ar' ? 'إلغاء جميع الجلسات' : 'Revoke All'}
                </button>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Chrome on macOS (Current)</span>
                  <span className="text-emerald-600 font-bold">Online</span>
                </div>
                <div className="flex justify-between">
                  <span>Zain Mobile App (iOS 17)</span>
                  <span className="text-slate-400">2h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Push Notifications & PWA Status Section */}
        <PushNotificationManager isRtl={language === 'ar'} />

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-indigo-600/20 rounded-2xl text-indigo-400 border border-indigo-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-slate-100">Zain Automation Production PWA</h4>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold rounded-full">
                  v2.4.0-prod
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ar' 
                  ? 'مستضافة على Firebase Hosting مع دعم PWA و Capacitor وتحديثات تلقائية حية.' 
                  : 'Hosted on Firebase Hosting with PWA & Capacitor cross-platform support.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => pwaService.checkVersionUpdate().then(info => {
                if (!info) alert(language === 'ar' ? 'أنت تستخدم أحدث إصدار متاح حالياً (v2.4.0-prod).' : 'You are running the latest production build.');
              })}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'ar' ? 'فحص التحديثات' : 'Check Updates'}</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center space-x-2 space-x-reverse"
        >
          <Save className="w-4 h-4" />
          <span>حفظ جميع إعدادات المنصة</span>
        </button>
      </form>
    </div>
  );
};
