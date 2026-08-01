import React, { useState } from 'react';
import { Bell, BellOff, CheckCircle2, ShieldAlert, Send } from 'lucide-react';
import { pwaService } from '../../services/pwaService';

interface PushNotificationManagerProps {
  isRtl?: boolean;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ isRtl = true }) => {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [testSent, setTestSent] = useState(false);

  const handleRequestPermission = async () => {
    const perm = await pwaService.requestNotificationPermission();
    setPermission(perm);
  };

  const handleSendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Zain Automation - اختبار التنبيهات الفورية', {
        body: 'تم استلام هذا الإشعار التجريبي من منصة Zain Automation بنجاح.',
        icon: '/icons/icon.svg',
        dir: 'rtl',
        lang: 'ar'
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
            <Bell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100">
              {isRtl ? 'إشعارات مسارات العمل الفورية (Push Notifications)' : 'Push Notifications Center'}
            </h3>
            <p className="text-xs text-slate-400">
              {isRtl ? 'استلام تنبيهات حية ومباشرة عند تنشيط أو توقف مسارات العمل المأتمتة' : 'Receive instant live alerts when workflows trigger or fail'}
            </p>
          </div>
        </div>

        <div>
          {permission === 'granted' ? (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {isRtl ? 'مفعّلة' : 'Granted'}
            </span>
          ) : permission === 'denied' ? (
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <BellOff className="w-3.5 h-3.5 text-rose-400" />
              {isRtl ? 'محظورة' : 'Blocked'}
            </span>
          ) : (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              {isRtl ? 'بحاجة لتفعيل' : 'Prompt Required'}
            </span>
          )}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
        <p className="text-slate-400 text-[11px]">
          {permission === 'granted' 
            ? (isRtl ? 'يمكنك إرسال إشعار تجريبي لاختبار التنبيهات الفورية على متصفحك.' : 'Test sending a push notification to your browser.') 
            : (isRtl ? 'اضغط تفعيل لمنح المنصة إذن إرسال التنبيهات الفورية.' : 'Enable notification permissions to receive live workflow alerts.')}
        </p>

        {permission !== 'granted' ? (
          <button
            onClick={handleRequestPermission}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition text-xs"
          >
            {isRtl ? 'تفعيل الإشعارات الان' : 'Enable Notifications'}
          </button>
        ) : (
          <button
            onClick={handleSendTestNotification}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold rounded-xl transition text-xs flex items-center gap-1.5 border border-slate-700"
          >
            <Send className="w-3.5 h-3.5 text-indigo-400" />
            <span>{testSent ? (isRtl ? 'تم إرسال الإشعار!' : 'Notification Sent!') : (isRtl ? 'إرسال إشعار تجريبي' : 'Send Test Alert')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
