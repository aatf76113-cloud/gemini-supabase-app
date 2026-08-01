import React, { useState } from 'react';
import { Language } from '../types';
import { 
  Code2, 
  Terminal, 
  Send, 
  Copy, 
  Check, 
  Globe, 
  Play, 
  Zap, 
  BookOpen, 
  CheckCircle2, 
  Layers,
  Sparkles,
  ShieldCheck,
  FileCode
} from 'lucide-react';

interface DevelopersViewProps {
  language: Language;
}

export const DevelopersView: React.FC<DevelopersViewProps> = ({ language }) => {
  const isAr = language === 'ar';
  const [activeLang, setActiveLang] = useState<'curl' | 'node' | 'python' | 'go'>('curl');
  const [activeApi, setActiveApi] = useState<'webhooks' | 'gemini' | 'health' | 'encrypt'>('webhooks');
  const [copiedCode, setCopiedCode] = useState(false);
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [isCallingApi, setIsCallingApi] = useState(false);

  // Sample payload for Webhook Playground
  const [samplePayload, setSamplePayload] = useState(
    JSON.stringify({
      event: "workflow.trigger",
      workspaceId: "ws-default-01",
      data: {
        customerEmail: "client@zainauto.io",
        amount: 250,
        currency: "USD"
      }
    }, null, 2)
  );

  const getEndpointPath = () => {
    switch (activeApi) {
      case 'webhooks': return '/api/webhooks/receive';
      case 'gemini': return '/api/run-gemini';
      case 'health': return '/api/health';
      case 'encrypt': return '/api/security/encrypt';
    }
  };

  const getCodeSnippet = () => {
    const endpoint = getEndpointPath();
    const fullUrl = `https://zainauto.io${endpoint}`;

    if (activeLang === 'curl') {
      return `curl -X POST "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-zain-signature: sha256=a8f3b2c1..." \\
  -d '${samplePayload.replace(/\n/g, '')}'`;
    }

    if (activeLang === 'node') {
      return `import axios from 'axios';

const payload = ${samplePayload};

const response = await axios.post('${fullUrl}', payload, {
  headers: {
    'Content-Type': 'application/json',
    'x-zain-signature': 'sha256=your_hmac_secret_hash'
  }
});

console.log(response.data);`;
    }

    if (activeLang === 'python') {
      return `import requests
import json

url = "${fullUrl}"
payload = ${samplePayload}
headers = {
    "Content-Type": "application/json",
    "x-zain-signature": "sha256=your_hmac_secret_hash"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
    }

    if (activeLang === 'go') {
      return `package main

import (
    "bytes"
    "fmt"
    "net/http"
)

func main() {
    url := "${fullUrl}"
    jsonStr := []byte(\`${samplePayload}\`)
    req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
    req.Header.Set("Content-Type", "application/json")
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err == nil {
        fmt.Println("Response Status:", resp.Status)
    }
}`;
    }

    return '';
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunInteractiveTest = async () => {
    setIsCallingApi(true);
    setApiResponse(null);

    try {
      let parsedBody = {};
      try { parsedBody = JSON.parse(samplePayload); } catch (e) {}

      const res = await fetch(getEndpointPath(), {
        method: activeApi === 'health' ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-zain-signature': 'sha256=mock_valid_hmac_signature'
        },
        body: activeApi === 'health' ? undefined : JSON.stringify(activeApi === 'encrypt' ? { text: 'my_secret_token_123' } : parsedBody)
      });

      const data = await res.json();
      setApiResponse(data);
    } catch (e: any) {
      setApiResponse({ error: e.message || 'API request error' });
    } finally {
      setIsCallingApi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl">
            <Terminal className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {isAr ? 'مركز المطورين وواجهات REST API' : 'Developers Hub & OpenAPI Sandbox'}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full font-mono">
                v1.0 RC
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr ? 'وثائق تفاعلية وأكواد جاهزة للربط مع Webhooks والذكاء الاصطناعي' : 'Interactive API playground, Webhook HMAC specs, and SDK code generation'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Left API Select & Playground, Right SDK Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive API Explorer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? 'مستكشف نقاط النهاية (API Endpoints Playground)' : 'API Endpoint Playground'}</span>
            </h2>

            {/* API Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'webhooks', label: 'Webhooks Ingest', method: 'POST' },
                { key: 'gemini', label: 'Gemini AI Run', method: 'POST' },
                { key: 'encrypt', label: 'AES-256 Vault', method: 'POST' },
                { key: 'health', label: 'System Health', method: 'GET' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveApi(item.key as any);
                    setApiResponse(null);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-colors text-right rtl:text-right ltr:text-left ${
                    activeApi === item.key
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-emerald-500/20 text-emerald-300 block w-fit mb-1">
                    {item.method}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Request Payload Editor */}
            {activeApi !== 'health' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {isAr ? 'حمولة الطلب (Request JSON Payload):' : 'Request Body (JSON):'}
                </label>
                <textarea
                  rows={6}
                  value={samplePayload}
                  onChange={(e) => setSamplePayload(e.target.value)}
                  className="w-full font-mono text-xs p-3.5 rounded-xl bg-slate-900 text-indigo-300 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={handleRunInteractiveTest}
              disabled={isCallingApi}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
            >
              {isCallingApi ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isAr ? 'إرسال طلب تجريبي حي للخدمة' : 'Execute Live API Request'}</span>
                </>
              )}
            </button>

            {/* API Response Output */}
            {apiResponse && (
              <div className="bg-slate-950 text-white p-4 rounded-2xl space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Response HTTP 200 OK</span>
                  <span className="text-emerald-400">{isAr ? 'استجابة سريعة' : 'Instant response'}</span>
                </div>
                <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-2 bg-slate-900 rounded-xl">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right: Code Snippets & SDK Generator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? 'توليد الكود البرمجي (SDK Generator)' : 'SDK Code Snippets'}</span>
              </h2>

              <button
                onClick={handleCopyCode}
                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الكود' : 'Copy')}</span>
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { key: 'curl', label: 'cURL' },
                { key: 'node', label: 'Node.js' },
                { key: 'python', label: 'Python' },
                { key: 'go', label: 'Go' }
              ].map((lang) => (
                <button
                  key={lang.key}
                  onClick={() => setActiveLang(lang.key as any)}
                  className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors ${
                    activeLang === lang.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Code Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <pre className="text-xs font-mono text-indigo-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {getCodeSnippet()}
              </pre>
            </div>
          </div>

          {/* HMAC Signature Doc */}
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl space-y-2 text-xs text-indigo-900">
            <div className="flex items-center gap-2 font-bold text-indigo-950">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? 'التحقق من توقيع Webhook HMAC SHA-256' : 'Webhook HMAC SHA-256 Guard'}</span>
            </div>
            <p className="text-indigo-800 leading-relaxed text-[11px]">
              {isAr 
                ? 'تتضمن كل حمولة Webhook منبثقة ترويسة x-zain-signature مشفرة بـ HMAC مفتاحك لمنع التلاعب.' 
                : 'Every incoming webhook payload carries a header x-zain-signature computed with HMAC-SHA256 for integrity verification.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
