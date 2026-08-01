import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, Key, Cpu, ShieldAlert, Check, X } from 'lucide-react';
import { FormattedAIError, aiProviderService, AIKeyEntry } from '../services/aiProviderService';

interface AIErrorBannerProps {
  error: FormattedAIError;
  onRetry?: () => void;
  onKeyChanged?: () => void;
  onProviderSwitched?: () => void;
}

export const AIErrorBanner: React.FC<AIErrorBannerProps> = ({
  error,
  onRetry,
  onKeyChanged,
  onProviderSwitched
}) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [keyPool, setKeyPool] = useState<AIKeyEntry[]>(() => aiProviderService.getKeyPool());
  const [newKeyInput, setNewKeyInput] = useState('');
  const [newKeyName, setNewKeyName] = useState('');

  const handleSelectKey = (keyId: string) => {
    aiProviderService.resetKeyStatus(keyId);
    setShowKeyModal(false);
    if (onKeyChanged) onKeyChanged();
    else if (onRetry) onRetry();
  };

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyInput.trim()) return;
    aiProviderService.addKey({
      provider: 'gemini',
      name: newKeyName.trim() || `Gemini Custom Key (${newKeyInput.slice(-4)})`,
      key: newKeyInput.trim()
    });
    setKeyPool(aiProviderService.getKeyPool());
    setNewKeyInput('');
    setNewKeyName('');
    setShowKeyModal(false);
    if (onKeyChanged) onKeyChanged();
    else if (onRetry) onRetry();
  };

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 shadow-sm space-y-4 my-3 text-right">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-rose-100 rounded-2xl text-rose-600 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-rose-950">
              {error.userTitleAr}
            </h4>
            <span className="font-mono text-[10px] bg-rose-200/60 text-rose-900 font-bold px-2 py-0.5 rounded-full">
              HTTP {error.httpCode}
            </span>
          </div>

          <p className="text-xs text-rose-800 leading-relaxed font-medium">
            {error.userMessageAr}
          </p>

          {/* Internal details for debugging notice */}
          {error.technicalDetails && (
            <p className="text-[10px] text-rose-600 font-mono pt-1">
              {error.technicalDetails}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-200/60">
        <button
          onClick={() => {
            aiProviderService.resetKeyStatus('key-primary-gemini');
            if (onRetry) onRetry();
          }}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة المحاولة والمتابعة بـ Gemini API</span>
        </button>
      </div>

      {/* Change Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Key className="w-4 h-4 text-amber-500" />
                <span>تغيير مفتاح Gemini API من المجمع (Key Pool)</span>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              اختر مفتاحاً نشطاً آخر من مجمع المفاتيح أو قم بإضافة مفتاح جديد لتجاوز القيد واستكمال التشغيل:
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {keyPool.map(k => (
                <div
                  key={k.id}
                  onClick={() => handleSelectKey(k.id)}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    k.status === 'active' 
                      ? 'bg-slate-50 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30' 
                      : 'bg-rose-50/50 border-rose-200 opacity-75'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">{k.name}</p>
                    <p className="font-mono text-[10px] text-slate-400">
                      {k.key.slice(0, 10)}... | {k.requestsCount} طلبات
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    k.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {k.status === 'active' ? 'نشط' : 'استُهلكت الحصة'}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddKey} className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">إضافة مفتاح Gemini جديد:</label>
              <input
                type="text"
                placeholder="اسم المفتاح (اختياري)"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                required
                placeholder="AIzaSy..."
                value={newKeyInput}
                onChange={e => setNewKeyInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                حفظ المفتاح والتنفيذ به فوراً
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Switch Provider Modal */}
      {showProviderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span>التحويل لمزود ذكاء اصطناعي احتياطي</span>
              </div>
              <button onClick={() => setShowProviderModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              اختر أحد المزودين المتاحين للتحويل التلقائي واستئناف تنفيذ عملياتك دون توقف:
            </p>

            <div className="space-y-2">
              {[
                { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', provider: 'Google', desc: 'نموذج التفكير المعمق والتحليل المتقدم' },
                { id: 'gpt-4o', name: 'OpenAI GPT-4o', provider: 'OpenAI', desc: 'مزود السرعة والدقة العالية للشركات' },
                { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', desc: 'الأفضل للبرمجة وكتابة المحتوى العالي' },
                { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', desc: 'نموذج الاقتصاد السريع والأداء المباشر' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    aiProviderService.updateConfig({ autoFailover: true });
                    setShowProviderModal(false);
                    if (onProviderSwitched) onProviderSwitched();
                    else if (onRetry) onRetry();
                  }}
                  className="w-full p-3 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-400 border border-slate-200 rounded-2xl text-right transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-xs text-slate-900">{p.name}</p>
                    <p className="text-[10px] text-slate-500">{p.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full">
                    تفعيل وتحويل
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
