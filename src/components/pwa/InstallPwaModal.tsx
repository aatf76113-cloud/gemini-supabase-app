import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Apple, 
  CheckCircle2, 
  X, 
  Globe, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { pwaService } from '../../services/pwaService';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRtl?: boolean;
}

type OSPlatform = 'android' | 'windows' | 'mac' | 'linux' | 'chromeos' | 'ios';

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose, isRtl = true }) => {
  const [canInstall, setCanInstall] = useState(pwaService.canInstall());
  const [selectedPlatform, setSelectedPlatform] = useState<OSPlatform>('android');
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    return pwaService.onInstallableChange((installable) => {
      setCanInstall(installable);
    });
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const installed = await pwaService.promptInstall();
    if (installed) {
      setInstalledSuccess(true);
      setTimeout(() => {
        onClose();
        setInstalledSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400">
              <Download className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-100">
                {isRtl ? 'تثبيت منصة Zain Automation كـ تطبيق مثبت' : 'Install Zain Automation App'}
              </h3>
              <p className="text-xs text-slate-400">
                {isRtl ? 'تطبيق ديسكتاوب وموبايل مستقل يعمل بدون متصفح ومتاح أوفلاين' : 'Standalone Desktop & Mobile app with offline capabilities'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Install Banner if browser prompt available */}
        {canInstall && (
          <div className="p-4 bg-gradient-to-r from-indigo-900/50 to-slate-900 rounded-2xl border border-indigo-500/40 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {isRtl ? 'تثبيت بنقرة واحدة (Direct PWA Install)' : 'One-Click Direct PWA Install'}
              </span>
              <p className="text-[11px] text-slate-300">
                {isRtl ? 'متصفحك يدعم التثبيت المباشر الفوري على الجهاز.' : 'Your browser supports instant native app installation.'}
              </p>
            </div>
            <button
              onClick={handleInstallClick}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isRtl ? 'تثبيت الآن' : 'Install Now'}</span>
            </button>
          </div>
        )}

        {installedSuccess && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{isRtl ? 'تم تثبيت التطبيق بنجاح! يمكنك فتحه الآن من قائمة التطبيقات.' : 'App installed successfully!'}</span>
          </div>
        )}

        {/* OS Platform Selector Tabs */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 block">
            {isRtl ? 'اختر نظام التشغيل لاستعراض تعليمات التثبيت:' : 'Select Target Operating System:'}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { id: 'android', name: 'Android', icon: Smartphone },
              { id: 'windows', name: 'Windows', icon: Monitor },
              { id: 'mac', name: 'macOS', icon: Apple },
              { id: 'linux', name: 'Linux', icon: Globe },
              { id: 'chromeos', name: 'ChromeOS', icon: Monitor },
              { id: 'ios', name: 'iOS', icon: Apple }
            ].map((plat) => {
              const Icon = plat.icon;
              const isActive = selectedPlatform === plat.id;
              return (
                <button
                  key={plat.id}
                  onClick={() => setSelectedPlatform(plat.id as OSPlatform)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{plat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions Content */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
          {selectedPlatform === 'android' && (
            <div className="space-y-2">
              <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <span>{isRtl ? 'طريقة التثبيت على نظام Android (WebAPK & PWA)' : 'Android Installation Guide'}</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li>{isRtl ? 'افتح المنصة في متصفح Google Chrome على الهاتف.' : 'Open Zain Automation in Google Chrome on Android.'}</li>
                <li>{isRtl ? 'اضغط على زر القائمة (⋮) في أعلى يسار الشاشة.' : 'Tap the menu button (⋮) in Chrome.'}</li>
                <li>{isRtl ? 'اختر "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق" (Install App).' : 'Select "Install App" or "Add to Home screen".'}</li>
                <li>{isRtl ? 'سيتم إنشاء تطبيق WebAPK مستقل بأيقونة Zain Automation على هاتفك.' : 'A WebAPK app icon will appear on your phone drawer.'}</li>
              </ol>
            </div>
          )}

          {selectedPlatform === 'windows' && (
            <div className="space-y-2">
              <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-indigo-400" />
                <span>{isRtl ? 'طريقة التثبيت على Windows (Edge & Chrome)' : 'Windows Installation Guide'}</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li>{isRtl ? 'افتح موقع المنصة في متصفح Microsoft Edge أو Google Chrome.' : 'Open Zain Automation in Microsoft Edge or Google Chrome.'}</li>
                <li>{isRtl ? 'انقر على أيقونة التثبيت (⤓) الموجودة في شريط العنوان أعلى المتصفح.' : 'Click the install icon in the address bar.'}</li>
                <li>{isRtl ? 'اضغط "تثبيت" (Install) لإضافة اختصار في قائمة ابدأ وشريط المهام.' : 'Click "Install" to create Start Menu and Taskbar shortcuts.'}</li>
              </ol>
            </div>
          )}

          {selectedPlatform === 'mac' && (
            <div className="space-y-2">
              <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Apple className="w-4 h-4 text-indigo-400" />
                <span>{isRtl ? 'طريقة التثبيت على macOS (Safari & Chrome Web App)' : 'macOS Installation Guide'}</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li>{isRtl ? 'في متصفح Safari: انقر على زر المشاركة (Share) ثم اختر "Add to Dock".' : 'In Safari: Click Share button and select "Add to Dock".'}</li>
                <li>{isRtl ? 'في متصفح Chrome: افتح القائمة اختر Save & Share ثم "Install Zain Automation".' : 'In Chrome: Select Save & Share -> "Install Zain Automation".'}</li>
                <li>{isRtl ? 'سيصبح التطبيق متاحاً في Launchpad ومجلد Applications.' : 'The app will launch natively from your Dock and Launchpad.'}</li>
              </ol>
            </div>
          )}

          {selectedPlatform === 'linux' && (
            <div className="space-y-2">
              <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>{isRtl ? 'طريقة التثبيت على Linux (Chromium PWA)' : 'Linux Installation Guide'}</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li>{isRtl ? 'افتح المنصة في Chrome أو Chromium.' : 'Open Zain Automation in Chrome or Chromium.'}</li>
                <li>{isRtl ? 'من القائمة الرئيسية، اختر "More Tools" ثم "Create Shortcut".' : 'Go to Menu -> More Tools -> Create Shortcut.'}</li>
                <li>{isRtl ? 'فعّل خيار "Open as window" واضغط Create.' : 'Check "Open as window" and click Create.'}</li>
              </ol>
            </div>
          )}

          {selectedPlatform === 'chromeos' && (
            <div className="space-y-2">
              <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-indigo-400" />
                <span>{isRtl ? 'طريقة التثبيت على ChromeOS' : 'ChromeOS Installation Guide'}</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li>{isRtl ? 'اضغط على زر التثبيت في شريط عنوان المتصفح.' : 'Click the install button in the Chrome browser address bar.'}</li>
                <li>{isRtl ? 'سيتم إضافة التطبيق إلى App Launcher وشريط Shelf تلقائياً.' : 'The app will be pinned to your Shelf and Launcher.'}</li>
              </ol>
            </div>
          )}

          {selectedPlatform === 'ios' && (
            <div className="space-y-2">
              <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Apple className="w-4 h-4 text-indigo-400" />
                <span>{isRtl ? 'طريقة التثبيت على iPhone / iPad (Safari PWA)' : 'iOS Installation Guide'}</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li>{isRtl ? 'افتح المنصة باستخدام متصفح Safari.' : 'Open Zain Automation in Safari.'}</li>
                <li>{isRtl ? 'اضغط على زر المشاركة (Share icon) في أسفل الشاشة.' : 'Tap the Share icon at the bottom of the screen.'}</li>
                <li>{isRtl ? 'اسحب للأسفل واضغط على "Add to Home Screen" (إضافة إلى الشاشة الرئيسية).' : 'Scroll down and tap "Add to Home Screen".'}</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
          <span className="flex items-center gap-1 text-slate-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {isRtl ? 'إصدار آمن ومعتمد V2.4.0 (HTTPS Enforced)' : 'Production Ready v2.4.0'}
          </span>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl"
          >
            {isRtl ? 'إغلاق النافذة' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
