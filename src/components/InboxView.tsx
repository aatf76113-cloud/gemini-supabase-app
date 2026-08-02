import React, { useState } from 'react';
import { copyToClipboard } from '../utils/clipboard';
import { 
  Inbox, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Copy, 
  Code, 
  Search, 
  RefreshCw,
  Terminal,
  Zap,
  Check
} from 'lucide-react';
import { Language, WebhookEvent } from '../types';
import { translations } from '../i18n/translations';

interface InboxViewProps {
  language: Language;
}

export const InboxView: React.FC<InboxViewProps> = ({ language }) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);

  // Mock initial incoming webhook events
  const [events, setEvents] = useState<WebhookEvent[]>([
    {
      id: 'evt_9281',
      source: 'Stripe Webhook',
      endpoint: '/api/v1/webhooks/stripe-payment',
      method: 'POST',
      receivedAt: new Date(Date.now() - 3 * 60000).toISOString(),
      status: 200,
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 't=16281,v1=9a8b7c6d5e4f'
      },
      payload: {
        event: 'checkout.session.completed',
        amount: 29900,
        currency: 'USD',
        customer: { email: 'saeed@zainauto.io', name: 'Saeed Al-Qahtani' }
      }
    },
    {
      id: 'evt_9280',
      source: 'Form Assembly',
      endpoint: '/api/v1/webhooks/lead-capture',
      method: 'POST',
      receivedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      status: 200,
      headers: {
        'content-type': 'application/json',
        'user-agent': 'FormAssembly-Hook/2.0'
      },
      payload: {
        form_id: 'lead-991',
        fields: {
          name: 'فهد الشمري',
          email: 'fahad@company.sa',
          company_size: '50-200',
          interest: 'AI & Workflow Automation'
        }
      }
    },
    {
      id: 'evt_9279',
      source: 'Firestore Trigger',
      endpoint: '/api/v1/events/firestore-onWrite',
      method: 'POST',
      receivedAt: new Date(Date.now() - 45 * 60000).toISOString(),
      status: 200,
      headers: {
        'content-type': 'application/json',
        'x-firebase-event': 'document.created'
      },
      payload: {
        collection: 'support_tickets',
        documentId: 'tck_881',
        data: {
          priority: 'high',
          status: 'open',
          subject: 'مشكلة في ربط مفتاح API'
        }
      }
    }
  ]);

  const webhookUrl = 'https://api.zainauto.io/v1/hooks/live-listener';

  const handleCopyUrl = async () => {
    await copyToClipboard(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateTrigger = () => {
    const newEvt: WebhookEvent = {
      id: `evt_${Date.now().toString().slice(-4)}`,
      source: 'Simulated Client Request',
      endpoint: '/api/v1/webhooks/live-listener',
      method: 'POST',
      receivedAt: new Date().toISOString(),
      status: 200,
      headers: {
        'content-type': 'application/json',
        'user-agent': 'ZainAuto-Simulator/1.0'
      },
      payload: {
        event: 'manual_test_payload',
        timestamp: new Date().toISOString(),
        message: 'تم إرسال حدث اختبار مباشر إلى صندوق استلام الأحداث'
      }
    };

    setEvents(prev => [newEvt, ...prev]);
    setSelectedEvent(newEvt);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{t.nav.inbox}</h1>
          <p className="text-xs text-slate-500 mt-1">
            سجل الاستقبال المباشر لجميع حمولات البيانات (Payloads) والأحداث الواردة عبر Webhooks
          </p>
        </div>

        <button
          onClick={handleSimulateTrigger}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center space-x-2 space-x-reverse"
        >
          <Send className="w-4 h-4" />
          <span>محاكاة إرسال حدث Webhook اختبار</span>
        </button>
      </div>

      {/* Webhook Endpoint Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
            رابط استقبال الـ Webhook الخاص بك (Production Webhook Endpoint)
          </span>
          <p className="font-mono text-xs text-slate-300 font-bold">{webhookUrl}</p>
        </div>

        <button
          onClick={handleCopyUrl}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all flex items-center space-x-2 space-x-reverse shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
          <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
        </button>
      </div>

      {/* Events List & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Events Table / List */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-extrabold text-slate-700">
            <span>الأحداث الأخيرة ({events.length})</span>
            <span className="text-emerald-600 flex items-center space-x-1 space-x-reverse">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>استماع حي</span>
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[500px]">
            {events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className={`p-4 hover:bg-indigo-50/50 transition-all cursor-pointer text-xs ${
                  selectedEvent?.id === evt.id ? 'bg-indigo-50/80 border-r-4 border-indigo-600' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="px-2 py-0.5 bg-slate-100 font-mono font-bold text-[10px] rounded text-slate-700">
                      {evt.method}
                    </span>
                    <span className="font-bold text-slate-900">{evt.source}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(evt.receivedAt).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-[11px] font-mono text-slate-500 truncate mb-1">
                  {evt.endpoint}
                </p>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">ID: {evt.id}</span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    HTTP {evt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* JSON Inspector View */}
        <div className="lg:col-span-6 bg-slate-950 text-slate-100 p-6 rounded-3xl border border-slate-800 shadow-xl font-mono text-xs flex flex-col justify-between min-h-[400px]">
          {selectedEvent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200">فاحص الحمولة ({selectedEvent.id})</span>
                </div>
                <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400">JSON Payload</span>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Request Headers:</p>
                <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] text-indigo-300 overflow-x-auto">
                  {JSON.stringify(selectedEvent.headers, null, 2)}
                </pre>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Request Body Payload:</p>
                <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] text-emerald-400 overflow-x-auto">
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
              <Code className="w-8 h-8 text-slate-700" />
              <p className="text-xs font-sans">حدد حدثاً من القائمة الجانبية لفحص حمولة الـ Payload بالكامل</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
