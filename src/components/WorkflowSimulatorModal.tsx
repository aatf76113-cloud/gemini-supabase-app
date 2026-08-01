import React, { useState } from 'react';
import { 
  Play, 
  X, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  Code, 
  Layers, 
  Sparkles, 
  Bot, 
  Send, 
  Database, 
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Workflow, ExecutionStepResult, Language } from '../types';

interface WorkflowSimulatorModalProps {
  workflow: Workflow;
  language: Language;
  onClose: () => void;
}

export const WorkflowSimulatorModal: React.FC<WorkflowSimulatorModalProps> = ({
  workflow,
  language,
  onClose
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [simulationLogs, setSimulationLogs] = useState<ExecutionStepResult[]>([]);
  const [selectedInspectStep, setSelectedInspectStep] = useState<ExecutionStepResult | null>(null);

  const [mockPayload, setMockPayload] = useState<string>(
    JSON.stringify(
      {
        event: workflow.trigger.type,
        timestamp: new Date().toISOString(),
        customer: {
          id: 'cust_8829',
          name: 'سعيد القحطاني',
          email: 'saeed@zainauto.io',
          phone: '+966551234567',
          plan: 'Enterprise Pro'
        },
        metadata: {
          source: 'Live Webhook Simulation',
          valueSAR: 1850
        }
      },
      null,
      2
    )
  );

  const handleStartSimulation = async () => {
    setIsSimulating(true);
    setSimulationLogs([]);
    setActiveStepIndex(0);

    let parsedPayload: any = {};
    try {
      parsedPayload = JSON.parse(mockPayload);
    } catch {
      parsedPayload = { raw: mockPayload };
    }

    // Step 0: Trigger Node
    await new Promise(r => setTimeout(r, 600));
    const triggerLog: ExecutionStepResult = {
      stepId: workflow.trigger.id,
      stepTitle: workflow.trigger.title,
      stepTitleAr: workflow.trigger.titleAr,
      status: 'success',
      durationMs: 45,
      output: {
        triggerReceived: true,
        type: workflow.trigger.type,
        payload: parsedPayload
      },
      logs: [
        `[SIMULATOR] Event received on trigger node: ${workflow.trigger.type}`,
        `[SIMULATOR] Validated incoming payload JSON schema against vault credentials`,
        `[SIMULATOR] Output variables bound to $trigger.payload`
      ]
    };

    setSimulationLogs([triggerLog]);

    // Action Steps Iteration
    for (let i = 0; i < workflow.steps.length; i++) {
      setActiveStepIndex(i + 1);
      const step = workflow.steps[i];
      await new Promise(r => setTimeout(r, 800));

      const stepLog: ExecutionStepResult = {
        stepId: step.id,
        stepTitle: step.title,
        stepTitleAr: step.titleAr,
        status: 'success',
        durationMs: Math.floor(Math.random() * 180) + 90,
        output: {
          stepType: step.type,
          processedAt: new Date().toISOString(),
          simulatedResult: `Successfully processed variable bindings from $step_${i > 0 ? i : 'trigger'}.output`,
          aiAnalysis: step.type === 'gemini_ai' ? 'تحليل محاكاة ذكي: تم تصنيف العميل كجهة عالية الأهمية High Priority' : undefined,
          targetRef: step.config?.collection || step.config?.channel || 'Simulated Node Endpoint'
        },
        logs: [
          `[SIMULATOR] Executing dry-run step: ${step.title}`,
          `[SIMULATOR] Resolved step params: ${JSON.stringify(step.config || {})}`,
          `[SIMULATOR] Dry-run execution succeeded with 0 errors`
        ]
      };

      setSimulationLogs(prev => [...prev, stepLog]);
    }

    setIsSimulating(false);
    setActiveStepIndex(-1);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Zap className="w-5 h-5 text-indigo-600 animate-pulse" />
              <h2 className="text-lg font-black text-slate-900">
                محاكي سير العمل التفاعلي (Workflow Dry-Run Simulator)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Workflow: {workflow.nameAr || workflow.name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-2xl transition-all border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Payload Configuration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-xs text-slate-900 flex items-center space-x-2 space-x-reverse">
                <Code className="w-4 h-4 text-indigo-600" />
                <span>تزويد البيانات التجريبية للمُشغّل ($trigger.payload):</span>
              </label>
              <button
                disabled={isSimulating}
                onClick={handleStartSimulation}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center space-x-2 space-x-reverse"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري المحاكاة...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>تشغيل المحاكاة الآن</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={5}
              disabled={isSimulating}
              value={mockPayload}
              onChange={(e) => setMockPayload(e.target.value)}
              className="w-full p-3.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none"
            />
          </div>

          {/* Stepper Timeline Visualizer */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-xs text-slate-900">مسار التنفيذ التفاعلي للخطوات:</h3>

            <div className="space-y-3">
              {/* Trigger node in stepper */}
              <div className={`p-4 rounded-2xl border transition-all ${
                simulationLogs.length > 0 ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center space-x-2 space-x-reverse text-slate-900">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-mono">0</span>
                    <span>المُشغّل: {workflow.trigger.titleAr || workflow.trigger.title}</span>
                  </span>
                  {simulationLogs.length > 0 && (
                    <span className="text-emerald-700 text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full">تم التفعيل</span>
                  )}
                </div>
              </div>

              {/* Action nodes in stepper */}
              {workflow.steps.map((step, idx) => {
                const stepLog = simulationLogs.find(l => l.stepId === step.id);
                const isActive = activeStepIndex === idx + 1;

                return (
                  <div
                    key={step.id}
                    onClick={() => stepLog && setSelectedInspectStep(stepLog)}
                    className={`p-4 rounded-2xl border transition-all ${
                      isActive 
                        ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200 animate-pulse'
                        : stepLog 
                        ? 'bg-emerald-50/40 border-emerald-300 cursor-pointer hover:bg-emerald-50' 
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center space-x-2 space-x-reverse text-slate-900">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-mono">
                          {idx + 1}
                        </span>
                        <span>{step.titleAr || step.title}</span>
                      </span>

                      {stepLog && (
                        <div className="flex items-center space-x-2 space-x-reverse text-[10px]">
                          <span className="font-mono text-slate-500">{stepLog.durationMs}ms</span>
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            ناجح
                          </span>
                        </div>
                      )}
                    </div>

                    {stepLog && (
                      <p className="text-[11px] font-mono text-slate-500 mt-2 bg-white/80 p-2 rounded-xl border border-slate-100">
                        {JSON.stringify(stepLog.output)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-slate-600">
          <span>نتائج المحاكاة لا تؤثر على البيانات الحقيقية في قاعدة البيانات (Sandbox Isolation)</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl transition-all"
          >
            إغلاق المحاكي
          </button>
        </div>
      </div>
    </div>
  );
};
