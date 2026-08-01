import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { pwaService, VersionInfo } from '../../services/pwaService';

interface UpdateNotifierToastProps {
  isRtl?: boolean;
}

export const UpdateNotifierToast: React.FC<UpdateNotifierToastProps> = ({ isRtl = true }) => {
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    return pwaService.onUpdateAvailable((info) => {
      setUpdateInfo(info);
    });
  }, []);

  if (!updateInfo || dismissed) return null;

  return (
    <div className="fixed bottom-5 left-5 z-[90] max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-indigo-500/40 p-4 space-y-3 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="p-2 bg-indigo-600/30 rounded-xl text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-indigo-200">
              {isRtl ? 'تحديث جديد متاح للمنصة!' : 'New Version Available!'}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              {updateInfo.version}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setDismissed(true)} 
          className="text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] text-slate-300 leading-relaxed">
        {updateInfo.releaseNotes || (isRtl ? 'تم تحسين أداء المسارات، ودعم PWA والتطبيقات الهجينة.' : 'Performance & PWA enhancements available.')}
      </p>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
        <button
          onClick={() => setDismissed(true)}
          className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-200"
        >
          {isRtl ? 'لاحقاً' : 'Later'}
        </button>
        <button
          onClick={() => pwaService.reloadToUpdate()}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>{isRtl ? 'تحديث وتحديث الصفحة' : 'Update & Reload'}</span>
        </button>
      </div>
    </div>
  );
};
