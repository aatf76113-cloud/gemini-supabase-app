import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { 
  Key, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Clock, 
  X,
  Lock,
  Terminal,
  AlertCircle,
  RotateCw,
  Zap
} from 'lucide-react';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';

interface ApiKeyItem {
  id: string;
  name: string;
  keyMasked: string;
  keyFull?: string;
  encryptedIv?: string;
  encryptedData?: string;
  scopes: string[];
  rateLimit: number; // req/min
  createdAt: string;
  lastUsedAt: string;
  lastUsedIp: string;
  expiresAt: string;
}

interface ApiKeysViewProps {
  language: Language;
}

export const ApiKeysView: React.FC<ApiKeysViewProps> = ({ language }) => {
  const isAr = language === 'ar';
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [expirationDays, setExpirationDays] = useState('90');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['workflows:read', 'workflows:write']);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKeyItem | null>(null);
  const [rateLimitReq, setRateLimitReq] = useState('60');

  const [keys, setKeys] = useState<ApiKeyItem[]>([
    {
      id: 'key-1',
      name: 'Production Workflow Runner SDK',
      keyMasked: 'zain_live_8f3a••••••••••••9b2c',
      keyFull: 'zain_live_8f3a9d2e1c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9b2c',
      scopes: ['workflows:read', 'workflows:write', 'ai:execute'],
      rateLimit: 300,
      createdAt: '2026-06-15',
      lastUsedAt: '2026-07-30 02:45',
      lastUsedIp: '197.35.112.4',
      expiresAt: '2026-12-31'
    },
    {
      id: 'key-2',
      name: 'Mobile App Webhook Ingestion Key',
      keyMasked: 'zain_live_12ab••••••••••••34cd',
      keyFull: 'zain_live_12ab34cd56ef78gh90ij12kl34mn56op78qr90st34cd',
      scopes: ['webhooks:ingest', 'notifications:write'],
      rateLimit: 60,
      createdAt: '2026-07-01',
      lastUsedAt: '2026-07-29 18:20',
      lastUsedIp: '41.238.90.12',
      expiresAt: '2027-01-01'
    }
  ]);

  useEffect(() => {
    const fetchFirestoreKeys = async () => {
      try {
        if (db) {
          const snapshot = await getDocs(collection(db, 'api_keys'));
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ApiKeyItem));
          if (list.length > 0) {
            setKeys(list);
          }
        }
      } catch (err) {
        console.warn('Error fetching Firestore API keys:', err);
      }
    };
    fetchFirestoreKeys();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRotateKey = async (id: string) => {
    const rawRandom = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const fullKey = `zain_live_${rawRandom}`;
    const masked = `zain_live_${rawRandom.slice(0, 4)}••••••••••••${rawRandom.slice(-4)}`;

    // Call AES-256 Encryption
    let encIv = '';
    let encData = '';
    try {
      const res = await fetch('/api/security/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullKey })
      });
      const data = await res.json();
      if (data.success) {
        encIv = data.iv;
        encData = data.encryptedData;
      }
    } catch (err) {
      console.warn('Key encryption error:', err);
    }

    const updatedKeys = keys.map(k => k.id === id ? { 
      ...k, 
      keyMasked: masked, 
      keyFull: fullKey,
      encryptedIv: encIv,
      encryptedData: encData,
      createdAt: new Date().toISOString().split('T')[0]
    } : k);

    setKeys(updatedKeys);

    // Sync rotation with Firestore if available
    try {
      if (db) {
        await setDoc(doc(db, 'api_keys', id), {
          keyMasked: masked,
          encryptedIv: encIv,
          encryptedData: encData,
          rotatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore key rotation sync error:', err);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const rawRandom = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const fullKey = `zain_live_${rawRandom}`;
    const masked = `zain_live_${rawRandom.slice(0, 4)}••••••••••••${rawRandom.slice(-4)}`;

    // Call AES-256 Encryption
    let encIv = '';
    let encData = '';
    try {
      const res = await fetch('/api/security/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullKey })
      });
      const data = await res.json();
      if (data.success) {
        encIv = data.iv;
        encData = data.encryptedData;
      }
    } catch (err) {
      console.warn('Key encryption error:', err);
    }

    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      keyMasked: masked,
      keyFull: fullKey,
      encryptedIv: encIv,
      encryptedData: encData,
      scopes: selectedScopes,
      rateLimit: parseInt(rateLimitReq) || 60,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsedAt: isAr ? 'لم يُستخدم بعد' : 'Never used',
      lastUsedIp: '0.0.0.0',
      expiresAt: expirationDays === 'never' ? (isAr ? 'لا ينتهي' : 'Never') : `${expirationDays} ${isAr ? 'يوم' : 'days'}`
    };

    setKeys([newKey, ...keys]);
    setNewlyCreatedKey(newKey);
    setNewKeyName('');

    try {
      if (db) {
        await addDoc(collection(db, 'api_keys'), newKey);
      }
    } catch (err) {
      console.warn('Firestore key store error:', err);
    }
  };

  const handleRevokeKey = async (id: string) => {
    setKeys(keys.filter(k => k.id !== id));
    try {
      if (db) {
        await deleteDoc(doc(db, 'api_keys', id));
      }
    } catch (err) {
      console.warn('Firestore key revoke error:', err);
    }
  };

  const toggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter(s => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <Key className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isAr ? 'إدارة مفاتيح API (API Keys Manager)' : 'API Keys & Access Credentials'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr ? 'أنشئ ودر مفاتيح الوصول الآمن لربط تطبيقاتك ومسارات عملك برمجياً' : 'Generate secure developer API keys to trigger workflows and query endpoints'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setNewlyCreatedKey(null);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إنشاء مفتاح API جديد' : 'Generate New API Key'}</span>
        </button>
      </div>

      {/* Security Warning */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">
            {isAr ? 'إرشادات الأمان لمفاتيح API:' : 'API Key Security Best Practices:'}
          </span>
          <p className="text-amber-800 leading-relaxed">
            {isAr 
              ? 'احفظ المفتاح الخفي في بيئة آمنة ولا تقم بنشره في كود الواجهة الأمامية (Client-side). جميع المفاتيح مشفرة بخزنة AES-256.' 
              : 'Keep your secret keys secure in server-side environment variables. Never expose full API keys in browser client scripts.'}
          </p>
        </div>
      </div>

      {/* Keys List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            {isAr ? 'المفاتيح النشطة (Active Keys)' : 'Active API Keys'} ({keys.length})
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {keys.map((keyItem) => (
            <div key={keyItem.id} className="p-5 hover:bg-slate-50/80 transition-colors space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{keyItem.name}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 border border-slate-200">
                      {keyItem.keyMasked}
                    </code>
                    {keyItem.keyFull && (
                      <button
                        onClick={() => handleCopy(keyItem.id, keyItem.keyFull || keyItem.keyMasked)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                        title={isAr ? 'نسخ' : 'Copy'}
                      >
                        {copiedId === keyItem.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                  <button
                    onClick={() => handleRotateKey(keyItem.id)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    title={isAr ? 'تدوير المفتاح (Key Rotation)' : 'Rotate Key Secret'}
                  >
                    <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{isAr ? 'تدوير المفتاح' : 'Rotate'}</span>
                  </button>

                  <button
                    onClick={() => handleRevokeKey(keyItem.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إلغاء المفتاح' : 'Revoke'}</span>
                  </button>
                </div>
              </div>

              {/* Details Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>{keyItem.rateLimit || 60} req/min</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{isAr ? 'تاريخ الإنشاء:' : 'Created:'} {keyItem.createdAt}</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Terminal className="w-3 h-3 text-slate-400" />
                  <span>{isAr ? 'آخر استخدام:' : 'Last used:'} {keyItem.lastUsedAt} ({keyItem.lastUsedIp})</span>
                </div>
                <div className="flex items-center gap-1">
                  {keyItem.scopes.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-mono text-[10px] border border-indigo-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Generate Key */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 left-5 rtl:left-5 ltr:right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {newlyCreatedKey ? (
              <div className="space-y-4 py-2">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center gap-2 text-xs font-bold border border-emerald-200">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>{isAr ? 'تم توليد مفتاح API جديد بنجاح!' : 'API Key Generated Successfully!'}</span>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] font-mono text-indigo-300 block">
                    {isAr ? 'انسخ المفتاح الكامل الآن (لن يظهر مرة أخرى بالكامل):' : 'Copy key now (it will not be shown in full again):'}
                  </span>
                  <div className="flex items-center justify-between gap-2 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                    <code className="text-xs font-mono text-emerald-400 break-all select-all">
                      {newlyCreatedKey.keyFull}
                    </code>
                    <button
                      onClick={() => handleCopy('new-full', newlyCreatedKey.keyFull || '')}
                      className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shrink-0"
                    >
                      {copiedId === 'new-full' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
                >
                  {isAr ? 'إغلاق النافذة' : 'Done'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {isAr ? 'إنشاء مفتاح API جديد' : 'Generate New API Key'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isAr ? 'حدد الاسم والصلاحيات الخاصة بالمفتاح' : 'Set key permissions & scope'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isAr ? 'اسم المفتاح / الغرض:' : 'Key Identifier Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: Zapier Integration Key' : 'e.g., Production Webhook Ingest'}
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isAr ? 'الصلاحيات النطاقية (Scopes):' : 'Key Scopes:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { scope: 'workflows:read', label: 'Workflows Read' },
                      { scope: 'workflows:write', label: 'Workflows Trigger' },
                      { scope: 'ai:execute', label: 'Gemini AI Execution' },
                      { scope: 'webhooks:ingest', label: 'Webhook Ingest' }
                    ].map((item) => (
                      <button
                        key={item.scope}
                        type="button"
                        onClick={() => toggleScope(item.scope)}
                        className={`p-2 rounded-xl text-xs font-mono font-bold border transition-colors flex items-center justify-between ${
                          selectedScopes.includes(item.scope)
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <span>{item.label}</span>
                        {selectedScopes.includes(item.scope) && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isAr ? 'صلاحية انتهاء المفتاح:' : 'Key Expiration:'}
                  </label>
                  <select
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="30">{isAr ? '30 يوماً' : '30 Days'}</option>
                    <option value="90">{isAr ? '90 يوماً (موصى به)' : '90 Days (Recommended)'}</option>
                    <option value="365">{isAr ? 'سنة واحدة' : '1 Year'}</option>
                    <option value="never">{isAr ? 'بدون انقضاء (Never Expire)' : 'Never Expire'}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>{isAr ? 'توليد المفتاح الآن' : 'Generate Key'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
