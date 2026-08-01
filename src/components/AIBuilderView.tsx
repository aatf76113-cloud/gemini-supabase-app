import React, { useState } from 'react';
import { 
  Wand2, 
  Sparkles, 
  Play, 
  Save, 
  ArrowLeft, 
  ArrowRight, 
  Bot, 
  CheckCircle2, 
  Loader2, 
  Zap, 
  ChevronRight,
  Code2,
  Sliders,
  Share2
} from 'lucide-react';
import { Language, Workflow } from '../types';
import { translations } from '../i18n/translations';
import { AIErrorBanner } from './AIErrorBanner';
import { aiProviderService, FormattedAIError } from '../services/aiProviderService';

interface AIBuilderViewProps {
  language: Language;
  onWorkflowGenerated: (workflow: Workflow) => void;
  onOpenCanvas: (workflow: Workflow) => void;
}

export const AIBuilderView: React.FC<AIBuilderViewProps> = ({
  language,
  onWorkflowGenerated,
  onOpenCanvas
}) => {
  const t = translations[language];
  const isRtl = language === 'ar';

  const [prompt, setPrompt] = useState('');
  const [modelPreset, setModelPreset] = useState<'gemini-2.0-flash' | 'gemini-2.0-pro'>('gemini-2.0-flash');
  const [loading, setLoading] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<Workflow | null>(null);
  const [formattedError, setFormattedError] = useState<FormattedAIError | null>(null);

  const samplePrompts = [
    {
      titleAr: 'أتمتة المبيعات وتصنيف العملاء المحتملين',
      titleEn: 'Lead Scoring & Sales Automation',
      textAr: 'عند وصول طلب جديد عبر Webhook، قم بتصنيف العميل وتقييمه بـ Gemini AI، ثم احفظه في Cloud Firestore وأرسل تنفيذاً فورياً لقناة Slack.',
      textEn: 'When a new request arrives via Webhook, score and categorize the lead with Gemini AI, write to Cloud Firestore, and notify Slack.'
    },
    {
      titleAr: 'خدمة العملاء الذكية وتحليل الانطباع',
      titleEn: 'Smart Support Ticket Categorization',
      textAr: 'عند استقبال بريد إلكتروني من عميل، حلل درجة الغضب أو الرضا باستخدام Gemini AI، وأرسل ردك التلقائي عبر WhatsApp مع تحديث تذكرة الدعم.',
      textEn: 'When a customer email arrives, evaluate sentiment with Gemini AI, send an automated WhatsApp message, and log ticket in Firestore.'
    },
    {
      titleAr: 'تأكيد الدفع وإصدار الفواتير التلقائي',
      titleEn: 'Stripe Payment & WhatsApp Invoice',
      textAr: 'عند نجاح عملية عملية دفع في Stripe، استخرج تفاصيل المشتريات وأنمل PDF الفاتورة، وأرسلها عبر البريد الإلكتروني مع إشعار WhatsApp.',
      textEn: 'Upon Stripe payment success, parse order details, send email invoice, and ping WhatsApp confirmation.'
    }
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setFormattedError(null);

    const activeKey = aiProviderService.getBestActiveKey('gemini');

    try {
      const response = await fetch('/api/generate-workflow', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-AI-Key': activeKey?.key || ''
        },
        body: JSON.stringify({ prompt, language, modelPreset })
      });

      const data = await response.json();

      if (response.ok && data.success && data.workflow) {
        const generated = data.workflow;
        const newWf: Workflow = {
          id: `wf-ai-${Date.now()}`,
          name: generated.name || 'AI Generated Pipeline',
          nameAr: generated.nameAr || 'مسار ذكي مجمع بـ Gemini AI',
          description: generated.description || prompt,
          descriptionAr: generated.descriptionAr || prompt,
          category: generated.category || 'AI & Data',
          active: true,
          executionsCount: 0,
          successCount: 0,
          createdBy: 'AI Builder Studio',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          trigger: generated.trigger || {
            id: 'trig-1',
            type: 'webhook',
            title: 'HTTP Webhook Receiver',
            titleAr: 'مستقبل Webhook ذكي',
            icon: 'Webhook',
            config: { url: 'https://api.zainauto.io/v1/hooks/ai-gen' }
          },
          steps: generated.steps || [
            {
              id: 'step-1',
              type: 'gemini_ai',
              title: 'Gemini AI Intelligent Analysis',
              titleAr: 'معالجة ذكية بـ Gemini AI',
              icon: 'Bot',
              config: { prompt: 'Analyze payload and categorize urgency' }
            }
          ]
        };

        setGeneratedWorkflow(newWf);
      } else {
        const errObj = aiProviderService.formatError(response.status, data.error || 'Pipeline generation failed');
        setFormattedError(errObj);
      }
    } catch (err: any) {
      const errObj = aiProviderService.formatError(500, err?.message || 'Network error during generation');
      setFormattedError(errObj);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndOpen = () => {
    if (generatedWorkflow) {
      onWorkflowGenerated(generatedWorkflow);
      onOpenCanvas(generatedWorkflow);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 space-x-reverse px-3 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-300 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Gemini AI Workflow Generator v2.5</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            مولد المسارات الذكية (AI Builder Studio)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            صف أتمتة أعمالك بأسلوبك اليومي بالعربية أو الإنجليزية، وسيصدر لك محرك Gemini AI هيكلاً كاملاً لمسار العمل يحتوي على المشغلات (Triggers) والخطوات البرمجية (Steps) الجاهزة للتنفيذ والحفظ بـ Firestore.
          </p>
        </div>
      </div>

      {/* Main Studio Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prompt Input Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-extrabold text-slate-900">
                  وصف مسار العمل البرمجي:
                </label>
                <div className="flex items-center space-x-2 space-x-reverse text-xs text-slate-500">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>الموديل:</span>
                  <select
                    value={modelPreset}
                    onChange={(e: any) => setModelPreset(e.target.value)}
                    className="bg-slate-100 font-bold px-2 py-1 rounded-lg border border-slate-200 outline-none text-[11px]"
                  >
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (فائق السرعة)</option>
                    <option value="gemini-2.0-pro">Gemini 2.0 Pro (عالي الدقة والتعقيد)</option>
                  </select>
                </div>
              </div>

              <textarea
                rows={5}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="أدخل وصفاً تفصيلياً، مثال: عندما تصل رسالة جديدة في واتساب، حلل استفسار العميل بـ Gemini AI، ثم ابحث عن الإجابة في Cloud Firestore، وأرسل الإجابة تلقائياً عبر الإيميل..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed text-slate-900 placeholder:text-slate-400 shadow-inner"
              />
            </div>

            {/* Quick Sample Prompts */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                نماذج جاهزة للتجربة السريعة:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(language === 'ar' ? p.textAr : p.textEn)}
                    className="p-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 rounded-xl text-right text-xs transition-all text-slate-700 hover:text-indigo-700 font-medium"
                  >
                    <p className="font-bold mb-1 text-[11px] text-slate-900">
                      {language === 'ar' ? p.titleAr : p.titleEn}
                    </p>
                    <p className="line-clamp-2 text-[10px] text-slate-500 leading-normal">
                      {language === 'ar' ? p.textAr : p.textEn}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {formattedError && (
              <AIErrorBanner
                error={formattedError}
                onRetry={() => handleGenerate()}
                onKeyChanged={() => handleGenerate()}
                onProviderSwitched={() => handleGenerate()}
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-2xl text-xs shadow-xl shadow-indigo-100 transition-all flex items-center justify-center space-x-2 space-x-reverse"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>جاري التحليل والتوليد بـ Gemini AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 text-amber-300" />
                  <span>توليد مسار العمل التلقائي الآن</span>
                  {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated Workflow Preview Canvas */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Code2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm text-white">معاينة المسار المولد</h3>
              </div>
              {generatedWorkflow && (
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                  جاهز للتفاعل
                </span>
              )}
            </div>

            {generatedWorkflow ? (
              <div className="space-y-4">
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                  <h4 className="font-extrabold text-sm text-amber-300 mb-1">
                    {language === 'ar' ? generatedWorkflow.nameAr : generatedWorkflow.name}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {language === 'ar' ? generatedWorkflow.descriptionAr : generatedWorkflow.description}
                  </p>
                </div>

                {/* Nodes Chain Visual */}
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                    تسلسل خطوات الأتمتة (Node Hierarchy):
                  </p>

                  {/* Trigger Node */}
                  <div className="bg-indigo-950/80 border border-indigo-500/30 p-3.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="p-2 bg-indigo-600 rounded-xl">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-300 font-extrabold block">المُشغِّل (Trigger)</span>
                        <p className="text-xs font-bold text-white">
                          {language === 'ar' ? generatedWorkflow.trigger.titleAr : generatedWorkflow.trigger.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Steps */}
                  {generatedWorkflow.steps.map((s, idx) => (
                    <div key={idx} className="relative">
                      <div className="w-0.5 h-3 bg-indigo-500/40 mx-auto my-0.5"></div>
                      <div className="bg-slate-800/90 border border-slate-700 p-3.5 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="p-2 bg-slate-700 rounded-xl text-amber-400">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-extrabold block">الخطوة {idx + 1}</span>
                            <p className="text-xs font-bold text-white">
                              {language === 'ar' ? s.titleAr : s.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3 border border-dashed border-slate-800 rounded-2xl">
                <Wand2 className="w-8 h-8 text-slate-700 animate-bounce" />
                <p className="text-xs font-medium">
                  أدخل الوصف واضغط زر "توليد مسار العمل" لرؤية مخطط الربط الذكي هنا.
                </p>
              </div>
            )}
          </div>

          {generatedWorkflow && (
            <div className="pt-6 border-t border-slate-800 space-y-2 mt-6">
              <button
                onClick={handleSaveAndOpen}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center space-x-2 space-x-reverse shadow-lg shadow-emerald-950"
              >
                <Save className="w-4 h-4" />
                <span>حفظ في Firestore وفتح المحرر المرئي</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
