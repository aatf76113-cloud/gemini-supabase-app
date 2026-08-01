import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { pwaService } from '../../services/pwaService';

interface OfflineBannerProps {
  isRtl?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isRtl = true }) => {
  const [isOnline, setIsOnline] = useState(pwaService.isOnline());
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);

  useEffect(() => {
    return pwaService.onOnlineChange((onlineStatus) => {
      if (!onlineStatus) {
        setIsOnline(false);
      } else {
        if (!isOnline) {
          setShowReconnectedToast(true);
          setTimeout(() => setShowReconnectedToast(false), 4000);
        }
        setIsOnline(true);
      }
    });
  }, [isOnline]);

  if (isOnline && !showReconnectedToast) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[100] transition-all duration-300">
      {!isOnline ? (
        <div className="bg-amber-600 text-white px-4 py-2 flex items-center justify-between text-xs font-medium shadow-md border-b border-amber-500">
          <div className="flex items-center space-x-2 space-x-reverse">
            <WifiOff className="w-4 h-4 animate-pulse text-amber-200" />
            <span>
              {isRtl 
                ? 'أنت تعمل حالياً بالوضع غير المتصل (Offline Mode). يتم حفظ التغييرات محلياً وسيتّم المزامنة فور عودة الاتصال.' 
                : 'You are currently offline. Changes are saved locally and will sync when back online.'}
            </span>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-amber-700 hover:bg-amber-800 text-amber-100 px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isRtl ? 'إعادة المحاولة' : 'Retry'}</span>
          </button>
        </div>
      ) : (
        <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-between text-xs font-medium shadow-md border-b border-emerald-500 animate-bounce">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Wifi className="w-4 h-4 text-emerald-200" />
            <span>
              {isRtl 
                ? 'تم استعادة الاتصال بالإنترنت بنجاح! جاري مزامنة مسارات العمل...' 
                : 'Connection restored! Syncing workflows...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
