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
  Building2,
  Cpu,
  CreditCard,
  Bell,
  Palette,
  ShieldCheck,
  Zap,
  Lock
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

type SettingsTab = 'general' | 'workspace' | 'ai_providers' | 'security' | 'billing' | 'api_keys' | 'notifications' | 'appearance';

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  onLanguageChange,
  user
}) => {
  const t = translations[language];
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [saved, setSaved] = useState(false);

  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyD-gemini-key-active');
  const [firebaseProjectId, setFirebaseProjectId] = useState('zain-auto-prod-921');
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('https://hooks.slack.com/services/T00/B00/XXXX');
  const [whatsappToken, setWhatsappToken] = useState('EAAG...whatsapp-access-token');

  const [showKeys, setShowKeys] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('light');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: isAr ? 'العامة' : 'General', icon: <Sliders className="w-4 h-4" /> },
    { id: 'workspace', label: isAr ? 'مساحة العمل' : 'Workspace', icon: <Building2 className="w-4 h-4" /> },
    { id: 'ai_providers', label: isAr ? 'مزودو الذكاء الاصطناعي' : 'AI Providers', icon: <Cpu className="w-4 h-4" /> },
    { id: 'security', label: isAr ? 'الأمان والحماية' : 'Security', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'billing', label: isAr ? 'الاشتراكات والفلترة' : 'Billing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'api_keys', label: isAr ? 'مفاتيح API' : 'API Keys', icon: <Key className="w-4 h-4" /> },
    { id: 'notifications', label: isAr ? 'الإشعارات' : 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance', label: isAr ? 'المظهر والواجهة' : 'Appearance', icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{t.nav.settings}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr 
              ? 'إدارة إعدادات النظام، مفاتيح الـ API، خوادم الذكاء الاصطناعي، والأمان المتقدم.'
              : 'Configure platform preferences, API credentials, AI providers, and security rules.'}
          </p>
        </div>

        {saved && (
          <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center space-x-1.5 space-x-reverse">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully'}</span>
          </span>
        )}
      </div>

      {/* Tabs Menu Bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Tab 1: General Settings */}
        {activeTab === 'general' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse text-slate-900 font-extrabold text-sm pb-3 border-b border-slate-100">
              <Globe className="w-5 h-5 text-indigo-600" />
              <h3>{isAr ? 'لغة الواجهة وتفضيلات العرض' : 'Language & Regional Settings'}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {isAr ? 'اختر لغة المنصة الأساسية:' : 'Primary Language:'}
                </label>
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
                <label className="block font-bold text-slate-700 mb-1.5">
                  {isAr ? 'صلاحية المستخدم الحالية:' : 'Current Role:'}
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.role?.toUpperCase() || 'ADMINISTRATOR'}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600 font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Workspace Settings */}
        {activeTab === 'workspace' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse text-slate-900 font-extrabold text-sm pb-3 border-b border-slate-100">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h3>{isAr ? 'بيانات مساحة العمل المعتمدة' : 'Active Workspace Details'}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? 'اسم مساحة العمل:' : 'Workspace Name:'}
                </label>
                <input
                  type="text"
                  defaultValue="Zain Production Workspace"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? 'معرف مساحة العمل (ID):' : 'Workspace ID:'}
                </label>
                <input
                  type="text"
                  disabled
                  value="ws-zain-prod-992"
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500 font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AI Providers */}
        {activeTab === 'ai_providers' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 space-x-reverse text-slate-900 font-extrabold text-sm">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <h3>{isAr ? 'إعدادات مزودي الذكاء الاصطناعي والتنقل التلقائي' : 'AI Providers & Auto-Fallback'}</h3>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                10 Providers Online
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-indigo-950 block">Google Gemini 2.5</span>
                  <span className="text-[10px] text-indigo-600 font-medium">Primary Active</span>
                </div>
                <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 block">OpenAI GPT-4o</span>
                  <span className="text-[10px] text-slate-500 font-medium">Secondary Fallback</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 block">Anthropic Claude 3.5</span>
                  <span className="text-[10px] text-slate-500 font-medium">Tertiary Fallback</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Security */}
        {activeTab === 'security' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse text-slate-900 font-extrabold text-sm pb-3 border-b border-slate-100">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <h3>{isAr ? 'الأمان المتقدم وحماية الحساب (Advanced Security & MFA)' : 'Advanced Security & MFA Settings'}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {isAr ? 'التوثيق ثنائي العامل (2FA / MFA Authenticator):' : 'Two-Factor Authentication (2FA):'}
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                    {isAr ? 'مفعل برمجياً' : 'Enabled'}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {isAr 
                    ? 'يتطلب إدخال رمز التحقق المنشأ بواسطة تطبيق Google Authenticator عند تسجيل الدخول.' 
                    : 'Requires a 6-digit TOTP token generated by Google Authenticator during login.'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {isAr ? 'الجلسات النشطة (Active Sessions):' : 'Active Sessions:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => alert(isAr ? 'تم تسجيل الخروج من جميع الأجهزة الأخرى.' : 'Revoked all other active sessions.')}
                    className="text-[10px] font-bold text-rose-600 hover:underline"
                  >
                    {isAr ? 'إلغاء جميع الجلسات' : 'Revoke All'}
                  </button>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Chrome on macOS (Current)</span>
                    <span className="text-emerald-600 font-bold">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Billing */}
        {activeTab === 'billing' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 space-x-reverse text-slate-900 font-extrabold text-sm">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3>{isAr ? 'معلومات الاشتراك والتراخيص' : 'Subscription & Licenses'}</h3>
              </div>
              <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-black rounded-xl">
                PRO PLAN
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {isAr ? 'باقة الأتمتة الاحترافية - 20,000 مهمة شهرياً مع دعم فني أولوية.' : 'Pro Automation Plan - 20,000 tasks/month with priority support.'}
            </p>
          </div>
        )}

        {/* Tab 6: API Keys */}
        {activeTab === 'api_keys' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 space-x-reverse text-slate-900 font-extrabold text-sm">
                <Key className="w-5 h-5 text-indigo-600" />
                <h3>{isAr ? 'مفاتيح الخدمات والمكاملات (API Credentials)' : 'API Credentials & Webhooks'}</h3>
              </div>

              <button
                type="button"
                onClick={() => setShowKeys(!showKeys)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 space-x-reverse"
              >
                {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showKeys ? (isAr ? 'إخفاء المفاتيح' : 'Hide Keys') : (isAr ? 'إظهار المفاتيح' : 'Show Keys')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Google Gemini API Key:</label>
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
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Cloud API Token:</label>
                <input
                  type={showKeys ? 'text' : 'password'}
                  value={whatsappToken}
                  onChange={(e) => setWhatsappToken(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Notifications */}
        {activeTab === 'notifications' && (
          <PushNotificationManager isRtl={isAr} />
        )}

        {/* Tab 8: Appearance */}
        {activeTab === 'appearance' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse text-slate-900 font-extrabold text-sm pb-3 border-b border-slate-100">
              <Palette className="w-5 h-5 text-indigo-600" />
              <h3>{isAr ? 'تنسيق الألوان ومظهر الواجهة' : 'Theme & Interface Customization'}</h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`p-4 rounded-2xl border font-bold flex flex-col items-center gap-2 transition ${
                  themeMode === 'light' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white border border-slate-300 shadow-sm block" />
                <span>{isAr ? 'الوضع الفاتح (Light)' : 'Light Mode'}</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`p-4 rounded-2xl border font-bold flex flex-col items-center gap-2 transition ${
                  themeMode === 'dark' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-slate-900 block" />
                <span>{isAr ? 'الوضع الداكن (Dark)' : 'Dark Mode'}</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('system')}
                className={`p-4 rounded-2xl border font-bold flex flex-col items-center gap-2 transition ${
                  themeMode === 'system' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-slate-900 to-slate-100 block" />
                <span>{isAr ? 'تلقائي (System)' : 'System Default'}</span>
              </button>
            </div>
          </div>
        )}

        {/* PWA Version Card */}
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
                {isAr 
                  ? 'مستضافة على Firebase Hosting مع دعم PWA و Capacitor وتحديثات تلقائية حية.' 
                  : 'Hosted on Firebase Hosting with PWA & Capacitor cross-platform support.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => pwaService.checkVersionUpdate().then(info => {
                if (!info) alert(isAr ? 'أنت تستخدم أحدث إصدار متاح حالياً (v2.4.0-prod).' : 'You are running the latest production build.');
              })}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAr ? 'فحص التحديثات' : 'Check Updates'}</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center space-x-2 space-x-reverse"
        >
          <Save className="w-4 h-4" />
          <span>{isAr ? 'حفظ جميع إعدادات المنصة' : 'Save All Settings'}</span>
        </button>
      </form>
    </div>
  );
};
