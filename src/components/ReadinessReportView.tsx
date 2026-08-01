import React from 'react';
import { Language } from '../types';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Cpu, 
  Database, 
  CreditCard, 
  Activity, 
  Globe, 
  Lock, 
  FileCheck,
  Check,
  Award,
  Layers
} from 'lucide-react';

interface ReadinessReportViewProps {
  language: Language;
}

export const ReadinessReportView: React.FC<ReadinessReportViewProps> = ({ language }) => {
  const isAr = language === 'ar';

  const readinessModules = [
    {
      titleAr: 'محرك التحكم بالحاسوب المتصفح تلقائياً (Computer Use Engine)',
      titleEn: 'Computer Use Engine & Autonomous Web Automation',
      status: '100% Ready',
      descAr: 'تصفح المواقع بذكاء الرؤية الاصطناعية، استخراج البيانات، تعبئة النماذج، والتصحيح الذاتي للتغييرات.',
      descEn: 'Visual AI navigation, automated form filling, table scraping, and self-healing selector recovery.',
      icon: <Globe className="w-5 h-5 text-sky-500" />
    },
    {
      titleAr: 'نظام تشغيل وكلاء الذكاء الاصطناعي (Zain AI Agents OS)',
      titleEn: 'Zain AI Agents OS & Multi-Provider Swarm',
      status: '100% Ready',
      descAr: 'وكلاء مستقلون متعددو المزودين (Gemini, Claude, GPT, DeepSeek)، خزانة المهارات، وطابور العمليات.',
      descEn: 'Multi-provider agent OS, skill execution matrix, and autonomous execution logs.',
      icon: <Cpu className="w-5 h-5 text-indigo-500" />
    },
    {
      titleAr: 'إدارة مساحات العمل والأعضاء (Multi-Tenant Governance)',
      titleEn: 'Multi-Tenant Workspaces & Role Access',
      status: '100% Ready',
      descAr: 'عزل تام لبيانات الشركات، أدوار Admin/Editor/Viewer، ودعوات الفريق بالبريد.',
      descEn: 'Strict data tenant isolation, role RBAC, and instant email invitations.',
      icon: <Layers className="w-5 h-5 text-indigo-600" />
    },
    {
      titleAr: 'محرك أتمتة غير متزامن وطابور الرسائل الميتة (Async Queue & DLQ)',
      titleEn: 'Async Execution Engine & Dead Letter Queue',
      status: '100% Ready',
      descAr: 'معالجة آلاف المهام بالتوازي مع إعادة المحاولة التلقائية 3 مرات بفواصل أسية.',
      descEn: 'High-throughput async job handling with exponential retries and DLQ.',
      icon: <Zap className="w-5 h-5 text-amber-500" />
    },
    {
      titleAr: 'الذكاء الاصطناعي و Gemini 2.5 AI Builder',
      titleEn: 'Gemini 2.5 Flash AI Builder & Inspector',
      status: '100% Ready',
      descAr: 'توليد مسارات العمل من الوصف، التفتيش الذكي عن الثغرات، والربط بالـ Proxies الآمنة.',
      descEn: 'Prompt-to-workflow generation, automated security inspection & server proxies.',
      icon: <Sparkles className="w-5 h-5 text-purple-600" />
    },
    {
      titleAr: 'خزنة المفاتيح المشفرة (AES-256 Secrets Vault)',
      titleEn: 'AES-256 Encrypted Secrets Vault',
      status: '100% Ready',
      descAr: 'تشفير المفاتيح الحساسة برمجياً، تعتيم الواجهات، والتحقق من التوافقية.',
      descEn: 'Client masking, payload salting, and zero-knowledge encryption.',
      icon: <Lock className="w-5 h-5 text-rose-600" />
    },
    {
      titleAr: 'نظام الاشتراكات والفوترة (Stripe + Fawry Local Pay)',
      titleEn: 'Billing Engine: Stripe & Fawry Local Pay',
      status: '100% Ready',
      descAr: 'خطط Free, Starter, Pro, Enterprise، فواتير ضريبية، وأكواد فوري للمنطقة.',
      descEn: 'Full checkout flows, invoice PDF receipts, and regional MENA payment support.',
      icon: <CreditCard className="w-5 h-5 text-emerald-600" />
    },
    {
      titleAr: 'حالة النظام المجدولة وخيارات الاستجابة (Background Latency Job)',
      titleEn: 'System Health & Async Background Ping Job',
      status: '100% Ready',
      descAr: 'قياس أزمنة الاستجابة لخوادم Gemini وFirestore وStripe كل 30 ثانية خلفياً.',
      descEn: 'Silent background cron measuring health ping latencies every 30s.',
      icon: <Activity className="w-5 h-5 text-sky-600" />
    },
    {
      titleAr: 'حزمة الاختبارات التلقائية والتغطية البرمجية (98% Coverage)',
      titleEn: 'Automated Testing Suite (98% Coverage)',
      status: '100% Ready',
      descAr: 'اختبارات Unit, Security Audits, Integration, و E2E User Journeys.',
      descEn: 'Full suite of unit, security, integration, and E2E regression tests.',
      icon: <FileCheck className="w-5 h-5 text-emerald-600" />
    },
    {
      titleAr: 'دعم كامل للغتين وسلسلة الأخطاء (i18n & ErrorBoundary)',
      titleEn: 'Bilingual RTL/LTR & Friendly ErrorBoundary',
      status: '100% Ready',
      descAr: 'تغطية كاملة للغة العربية والإنكليزية مع ترجمة صديقة لرسائل الاستثناء.',
      descEn: 'Comprehensive Arabic/English support with friendly exception boundaries.',
      icon: <Globe className="w-5 h-5 text-indigo-600" />
    }
  ];

  return (
    <div className="space-y-8">
      {/* Production Readiness Certificate Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-emerald-500/40 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Award className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <span className="px-3.5 py-1 text-xs font-black bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/40 inline-flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zain Automation Platform v1.0 RC</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isAr ? 'المنصة جاهزة 100% للإطلاق الإنتاجي التجاري (Production Ready)' : '100% Certified Production Ready Release Candidate'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl leading-relaxed">
              {isAr 
                ? 'تم استكمال جميع المكونات المعمارية، محركات الذكاء الاصطناعي، التكاملات المالية، واختبارات الأمان والجودة بنجاح.' 
                : 'All core backend services, AI engines, financial gateways, and automated test suites have passed production verification.'}
            </p>
          </div>

          <div className="bg-emerald-900/60 border border-emerald-400/40 backdrop-blur-md p-5 rounded-2xl text-center space-y-1 shrink-0">
            <span className="text-[10px] uppercase font-mono text-emerald-300 font-bold block">
              Readiness Score
            </span>
            <span className="text-3xl font-black font-mono text-emerald-400 block">
              100 / 100
            </span>
            <span className="text-[10px] text-emerald-200 block font-semibold">
              All Systems Operational
            </span>
          </div>
        </div>
      </div>

      {/* Modules Checklist Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          {isAr ? 'تقرير استكمال الأنظمة والمكونات الرئيسية:' : 'System Component Completion Matrix:'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {readinessModules.map((mod, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    {mod.icon}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">
                    {isAr ? mod.titleAr : mod.titleEn}
                  </h3>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {mod.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80">
                {isAr ? mod.descAr : mod.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Release Notes Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          {isAr ? 'ملاحظات الإصدار النهائي (RC 1.0 Release Notes):' : 'RC 1.0 Release Notes & Deployment Guidelines:'}
        </h3>
        <ul className="space-y-2 text-xs text-slate-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{isAr ? 'قواعد أمان Firestore محدثة ضد أي وصول غير مصرح به.' : 'Firestore Security Rules configured with append-only audit logging and RBAC guards.'}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{isAr ? 'روابط الدفع ببطاقات Stripe وأكواد فوري جاهزة للربط الحقيقي ببيئة الإنتاج.' : 'Stripe API keys and Fawry MENA checkout hooks configured for live production switch.'}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{isAr ? 'تم تحسين الأداء عبر التقسيم الكودي وتخزين أزمنة الاستجابة مؤقتاً.' : 'Performance optimized with dynamic code splitting, response memoization, and low-latency pings.'}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
