import React, { useState } from 'react';
import { Sparkles, X, Bot, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Language, Workflow } from '../types';
import { translations } from '../i18n/translations';
import { AIErrorBanner } from './AIErrorBanner';
import { aiProviderService, FormattedAIError } from '../services/aiProviderService';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialPrompt?: string;
  onWorkflowGenerated: (workflow: Workflow) => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  language,
  initialPrompt = '',
  onWorkflowGenerated
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const isRtl = language === 'ar';

  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [formattedError, setFormattedError] = useState<FormattedAIError | null>(null);

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
        body: JSON.stringify({ prompt, language })
      });

      const data = await response.json();

      if (response.ok && data.success && data.workflow) {
        const generated = data.workflow;
        const newWorkflow: Workflow = {
          id: `wf-ai-${Date.now()}`,
          name: generated.name || 'AI Generated Workflow',
          nameAr: generated.nameAr || 'مسار عمل توليدي بالذكاء الاصطناعي',
          description: generated.description || prompt,
          descriptionAr: generated.descriptionAr || prompt,
          category: generated.category || 'AI & Data',
          trigger: generated.trigger || {
            id: 'trig-ai-1',
            type: 'webhook',
            title: 'HTTP Webhook Trigger',
            titleAr: 'مُشغل Webhook للبيانات',
            icon: 'Webhook',
            config: { url: 'https://api.zainauto.io/v1/hooks/ai-gen' }
          },
          steps: generated.steps || [
            {
              id: 'step-ai-1',
              type: 'gemini_ai',
              title: 'Gemini AI Process',
              titleAr: 'معالجة ذكية بـ Gemini AI',
              icon: 'Bot',
              config: { prompt: 'Analyze payload and categorize' }
            }
          ],
          active: true,
          executionsCount: 0,
          successCount: 0,
          createdBy: 'Gemini AI Generator',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        onWorkflowGenerated(newWorkflow);
        onClose();
      } else {
        const errObj = aiProviderService.formatError(response.status, data.error || 'Workflow generation failed');
        setFormattedError(errObj);
      }
    } catch (err: any) {
      const errObj = aiProviderService.formatError(500, err?.message || 'Network error during generation');
      setFormattedError(errObj);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 duration-200">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <h3 className="font-extrabold text-base">{t.nav.aiGenerator}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              صف الأتمتة التي تريد بناءها باللغة العربية أو الإنجليزية:
            </label>
            <textarea
              rows={4}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="مثال: عندما يصل نموذج تسجيل جديد عبر Webhook، يحلل اهتمامات العميل بـ Gemini AI، ويحفظ البيانات بـ Cloud Firestore، ثم يرسل تنفيذاً فورياً لقناة Slack..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
            />
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
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-2 space-x-reverse"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري توليد المسار بـ Gemini AI...</span>
              </>
            ) : (
              <>
                <span>توليد المسار وتجميعه فورا</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
