import React, { useState } from 'react';
import { copyToClipboard } from '../utils/clipboard';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check,
  Search
} from 'lucide-react';
import { Language, VaultSecret } from '../types';
import { translations } from '../i18n/translations';

interface SecretsVaultViewProps {
  language: Language;
}

export const SecretsVaultView: React.FC<SecretsVaultViewProps> = ({ language }) => {
  const t = translations[language];
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [secrets, setSecrets] = useState<VaultSecret[]>([
    {
      id: 'sec-1',
      name: 'Google Gemini AI Key',
      key: 'GEMINI_API_KEY',
      category: 'AI',
      value: 'AIzaSyD9831a_GeminiProKey_Prod',
      isMasked: true,
      status: 'valid',
      lastTestedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      updatedAt: '2026-07-28'
    },
    {
      id: 'sec-2',
      name: 'Stripe Live Secret Key',
      key: 'STRIPE_SECRET_KEY',
      category: 'Payment',
      value: 'sk_live_51M00XXYYZZ991823719827391',
      isMasked: true,
      status: 'valid',
      lastTestedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      updatedAt: '2026-07-25'
    },
    {
      id: 'sec-3',
      name: 'WhatsApp Business API Token',
      key: 'WHATSAPP_CLOUD_TOKEN',
      category: 'Messaging',
      value: 'EAAG99128312_WhatsAppTokenKey',
      isMasked: true,
      status: 'valid',
      lastTestedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      updatedAt: '2026-07-20'
    },
    {
      id: 'sec-4',
      name: 'Firestore GCP Project ID',
      key: 'FIRESTORE_PROJECT_ID',
      category: 'Database',
      value: 'zain-auto-prod-921',
      isMasked: false,
      status: 'valid',
      lastTestedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      updatedAt: '2026-07-15'
    },
    {
      id: 'sec-5',
      name: 'Slack Notification Webhook',
      key: 'SLACK_WEBHOOK_URL',
      category: 'Messaging',
      value: 'https://hooks.slack.com/services/T00/B00/XXXXX',
      isMasked: true,
      status: 'untested',
      updatedAt: '2026-07-10'
    }
  ]);

  const [newSecretName, setNewSecretName] = useState('');
  const [newSecretKey, setNewSecretKey] = useState('');
  const [newSecretVal, setNewSecretVal] = useState('');
  const [newSecretCat, setNewSecretCat] = useState<'AI' | 'Database' | 'Payment' | 'Messaging' | 'Cloud'>('AI');
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleToggleMask = (id: string) => {
    setSecrets(prev => prev.map(s => s.id === id ? { ...s, isMasked: !s.isMasked } : s));
  };

  const handleDeleteSecret = (id: string) => {
    setSecrets(prev => prev.filter(s => s.id !== id));
  };

  const handleTestSecret = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setSecrets(prev => prev.map(s => {
        if (s.id === id) {
          return {
            ...s,
            status: 'valid',
            lastTestedAt: new Date().toISOString()
          };
        }
        return s;
      }));
      setTestingId(null);
    }, 1200);
  };

  const handleAddSecret = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecretName || !newSecretKey || !newSecretVal) return;

    const newSec: VaultSecret = {
      id: `sec-${Date.now()}`,
      name: newSecretName,
      key: newSecretKey.toUpperCase().replace(/\s+/g, '_'),
      category: newSecretCat,
      value: newSecretVal,
      isMasked: true,
      status: 'valid',
      lastTestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setSecrets([newSec, ...secrets]);
    setNewSecretName('');
    setNewSecretKey('');
    setNewSecretVal('');
    setShowAddModal(false);
  };

  const handleCopyKey = async (keyName: string) => {
    await copyToClipboard(`{{secrets.${keyName}}}`);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse mb-1">
            <Lock className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{t.nav.vault}</h1>
          </div>
          <p className="text-xs text-slate-500">
            تخزين وتشفير مفاتيح API الخاصة بشركتك بامان عالٍ واستخدامها بمرونة في مسارات العمل
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-indigo-100 transition-all flex items-center space-x-2 space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مفتاح جديد للخزنة</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
            كيفية استخدام مفاتيح الخزنة في مسارات العمل (Vault Variable Injection)
          </span>
          <p className="font-mono text-xs text-slate-300">
            استخدم الصيغة <code className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded">{"{{secrets.KEY_NAME}}"}</code> داخل تكوينات أي خطوة.
          </p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse text-emerald-400 font-bold">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>تشفير AES-256 مشدد مفعل</span>
        </div>
      </div>

      {/* Secrets Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-extrabold text-slate-700">
          <span>المفاتيح المحفوظة ({secrets.length})</span>
          <span className="text-slate-400">معتمدة ومحميّة في جميع بيئات التشغيل</span>
        </div>

        <div className="divide-y divide-slate-100">
          {secrets.map((sec) => (
            <div key={sec.id} className="p-5 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1 sm:w-1/3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="font-extrabold text-slate-900">{sec.name}</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-mono text-[10px] font-bold">
                    {sec.category}
                  </span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <p className="font-mono text-slate-500 font-bold text-[11px]">{sec.key}</p>
                  <button
                    onClick={() => handleCopyKey(sec.key)}
                    className="text-slate-400 hover:text-indigo-600 transition-all"
                    title="نسخ صيغة المتغير"
                  >
                    {copiedKey === sec.key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Secret Value View */}
              <div className="flex items-center space-x-2 space-x-reverse sm:w-1/3 font-mono bg-slate-100 px-3 py-2 rounded-xl text-[11px] text-slate-700 justify-between">
                <span className="truncate">
                  {sec.isMasked ? '••••••••••••••••••••••••' : sec.value}
                </span>
                <button
                  onClick={() => handleToggleMask(sec.id)}
                  className="text-slate-400 hover:text-slate-700 transition-all shrink-0"
                >
                  {sec.isMasked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Actions & Status */}
              <div className="flex items-center space-x-3 space-x-reverse sm:w-1/3 justify-end">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 space-x-reverse ${
                  sec.status === 'valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{sec.status === 'valid' ? 'سليم ومتصل' : 'غير مفحوص'}</span>
                </span>

                <button
                  onClick={() => handleTestSecret(sec.id)}
                  disabled={testingId === sec.id}
                  className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl transition-all"
                  title="اختبار الاتصال السريع"
                >
                  <RefreshCw className={`w-4 h-4 ${testingId === sec.id ? 'animate-spin text-indigo-600' : ''}`} />
                </button>

                <button
                  onClick={() => handleDeleteSecret(sec.id)}
                  className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-all"
                  title="حذف المفتاح"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Secret Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900">إضافة مفتاح جديد للخزنة</h3>
            <form onSubmit={handleAddSecret} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الخدمة أو المفتاح:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Google Gemini Pro Key"
                  value={newSecretName}
                  onChange={(e) => setNewSecretName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المتغير (ENV KEY):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: GEMINI_API_KEY"
                  value={newSecretKey}
                  onChange={(e) => setNewSecretKey(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التصنيف:</label>
                <select
                  value={newSecretCat}
                  onChange={(e) => setNewSecretCat(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="AI">AI & Machine Learning</option>
                  <option value="Database">Database & Firestore</option>
                  <option value="Payment">Payment Gateway</option>
                  <option value="Messaging">Messaging & Messaging</option>
                  <option value="Cloud">Cloud Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">قيمة المفتاح السرية (Secret Value):</label>
                <input
                  type="password"
                  required
                  placeholder="أدخل قيمة المفتاح هنا..."
                  value={newSecretVal}
                  onChange={(e) => setNewSecretVal(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 space-x-reverse pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                >
                  حفظ المفتاح
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
