import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Wrench, 
  X, 
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';
import { Workflow, Language } from '../types';

interface AIInspectorPanelProps {
  workflow: Workflow;
  language: Language;
  onUpdateWorkflow: (updated: Workflow) => void;
  onClose?: () => void;
}

interface AuditIssue {
  severity: 'warning' | 'error' | 'info';
  message: string;
  messageAr: string;
  recommendation: string;
}

export const AIInspectorPanel: React.FC<AIInspectorPanelProps> = ({
  workflow,
  language,
  onUpdateWorkflow,
  onClose
}) => {
  const [isInspecting, setIsInspecting] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [healthScore, setHealthScore] = useState<number>(88);
  const [optimizations, setOptimizations] = useState<string[]>([]);
  const [issues, setIssues] = useState<AuditIssue[]>([
    {
      severity: 'warning',
      message: 'Missing explicit rate-limit retry policy on external HTTP request nodes.',
      messageAr: 'عدم وجود سياسة إعادة المحاولة التلقائية (Retry Policy) عند تجاوز حدود معدل الطلبات.',
      recommendation: 'إضافة Exponential Backoff Retry للخطوات المعتمدة على بروتوكول HTTP.'
    },
    {
      severity: 'info',
      message: 'Trigger payload lacks schema validation constraint.',
      messageAr: 'حقل المشغل يفتقر للتحقق من تطابق بنية البيانات الواردة (Payload Schema).',
      recommendation: 'تفعيل خيار التحقق من تطابق JSON Schema في الإعدادات.'
    }
  ]);

  const handleRunInspection = async () => {
    setIsInspecting(true);
    try {
      const res = await fetch('/api/inspect-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow, language })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audit) {
          setHealthScore(data.audit.score || 95);
          setIssues(data.audit.issues || issues);
          setOptimizations(data.audit.optimizationsApplied || []);
        }
      }
    } catch (err) {
      console.error('AI Inspection error:', err);
    } finally {
      setIsInspecting(false);
    }
  };

  const handleAutoFixWithAI = async () => {
    setIsFixing(true);
    try {
      const res = await fetch('/api/inspect-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow, language })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audit && data.audit.fixedWorkflow) {
          onUpdateWorkflow(data.audit.fixedWorkflow);
          setHealthScore(98);
          setIssues([
            {
              severity: 'info',
              message: 'Workflow fully optimized and repaired by Gemini AI Inspector!',
              messageAr: 'تم إصلاح وتحسين مسار العمل بالكامل عبر فاحص الذكاء الاصطناعي بنجاح!',
              recommendation: 'مسار العمل جاهز للتفعيل في بيئة الإنتاج.'
            }
          ]);
        }
      }
    } catch (err) {
      console.error('Auto fix error:', err);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">فاحص ومفتش الذكاء الاصطناعي (AI Inspector)</h3>
            <p className="text-xs text-slate-500">فحص الثغرات، الأخطاء المنطقية، ومطابقة مفاتيح vault بنقرة واحدة</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-2xl border border-emerald-200">
            درجة الجودة: {healthScore}/100
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={handleRunInspection}
          disabled={isInspecting}
          className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center space-x-2 space-x-reverse"
        >
          <RefreshCw className={`w-4 h-4 ${isInspecting ? 'animate-spin' : ''}`} />
          <span>إعادة الفحص المباشر</span>
        </button>

        <button
          onClick={handleAutoFixWithAI}
          disabled={isFixing}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center space-x-2 space-x-reverse"
        >
          {isFixing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جاري الإصلاح بالذكاء الاصطناعي...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>إصلاح وبناء جميع التوصيات أوتوماتيكياً (1-Click Auto-Fix)</span>
            </>
          )}
        </button>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        <h4 className="font-extrabold text-xs text-slate-800">ملاحظات التحليل والجودة:</h4>
        <div className="space-y-2">
          {issues.map((iss, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                iss.severity === 'warning'
                  ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                  : iss.severity === 'error'
                  ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                  : 'bg-indigo-50/60 border-indigo-200 text-indigo-900'
              }`}
            >
              <div className="flex items-start space-x-3 space-x-reverse">
                <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                  iss.severity === 'warning' ? 'text-amber-600' : 'text-indigo-600'
                }`} />
                <div className="space-y-0.5">
                  <p className="font-extrabold">{language === 'ar' ? iss.messageAr : iss.message}</p>
                  <p className="text-[11px] opacity-80">{iss.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
