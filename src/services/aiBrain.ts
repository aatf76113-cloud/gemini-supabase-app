import { Workflow, Language } from '../types';

export interface AIBrainResponse {
  success: boolean;
  workflow?: Workflow;
  error?: string;
}

export async function generateWorkflowWithAIBrain(
  prompt: string, 
  language: Language = 'ar'
): Promise<AIBrainResponse> {
  try {
    const res = await fetch('/api/generate-workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, language })
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.workflow) {
      const fullWorkflow: Workflow = {
        id: `wf-${Date.now()}`,
        name: data.workflow.name || 'AI Custom Workflow',
        nameAr: data.workflow.nameAr || 'مسار عمل مخصص من الذكاء الاصطناعي',
        description: data.workflow.description || prompt,
        descriptionAr: data.workflow.descriptionAr || prompt,
        category: data.workflow.category || 'AI & Data',
        trigger: data.workflow.trigger || {
          id: 'trig-1',
          type: 'webhook',
          title: 'Webhook Listener',
          titleAr: 'مستقبل Webhook الذكي',
          icon: 'Webhook',
          config: { endpoint: '/api/v1/webhooks/auto' }
        },
        steps: data.workflow.steps || [
          {
            id: 'step-1',
            type: 'gemini_ai',
            title: 'Analyze Prompt with Gemini',
            titleAr: 'تحليل الأوامر بالذكاء الاصطناعي',
            icon: 'Bot',
            config: { prompt: prompt }
          }
        ],
        active: true,
        executionsCount: 0,
        successCount: 0,
        createdBy: 'AI Brain',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return { success: true, workflow: fullWorkflow };
    }

    return { success: false, error: 'No workflow returned from AI Brain' };
  } catch (err: any) {
    console.error('AIBrain compilation error:', err);
    return { 
      success: false, 
      error: err.message || 'فشل في الاتصال بمحرك الذكاء الاصطناعي' 
    };
  }
}
