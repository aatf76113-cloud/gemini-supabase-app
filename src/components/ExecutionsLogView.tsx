import React, { useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  ChevronRight, 
  X,
  Code,
  RotateCcw,
  StopCircle,
  Calendar,
  Sparkles,
  Zap,
  Layers,
  ArrowDown,
  Terminal,
  Database,
  Play,
  Check,
  Cpu
} from 'lucide-react';
import { Language, ExecutionLog, Workflow } from '../types';
import { translations } from '../i18n/translations';
import { retryWorkflowExecution, executeWorkflow, getCronHumanReadable, getNextCronRunTime } from '../services/workflowRunner';

interface ExecutionsLogViewProps {
  language: Language;
  executions: ExecutionLog[];
  workflows: Workflow[];
  onExecutionUpdate?: (newLog: ExecutionLog) => void;
  onWorkflowUpdate?: (workflow: Workflow) => void;
}

export const ExecutionsLogView: React.FC<ExecutionsLogViewProps> = ({
  language,
  executions,
  workflows,
  onExecutionUpdate,
  onWorkflowUpdate
}) => {
  const t = translations[language];
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'cancelled'>('all');
  const [selectedExec, setSelectedExec] = useState<ExecutionLog | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'scheduler' | 'dlq'>('logs');
  
  // Cron schedule modal state
  const [selectedCronWorkflow, setSelectedCronWorkflow] = useState<Workflow | null>(null);
  const [cronExpressionInput, setCronExpressionInput] = useState('0 9 * * *');
  const [cronRunningId, setCronRunningId] = useState<string | null>(null);

  // Compute Engine Analytics Metrics
  const totalCount = executions.length;
  const successCount = executions.filter(e => e.status === 'success').length;
  const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 100;
  const avgDurationMs = totalCount > 0 
    ? Math.round(executions.reduce((acc, curr) => acc + (curr.durationMs || 0), 0) / totalCount) 
    : 0;
  
  const scheduledWorkflows = workflows.filter(w => w.cronSchedule || w.trigger.type === 'schedule');

  const filteredLogs = executions.filter(exec => {
    const name = language === 'ar' ? (exec.workflowNameAr || exec.workflowName) : exec.workflowName;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || exec.triggeredBy.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRetryExecution = async (execToRetry: ExecutionLog) => {
    setIsRetrying(true);
    try {
      const targetWorkflow = workflows.find(w => w.id === execToRetry.workflowId) || {
        id: execToRetry.workflowId,
        name: execToRetry.workflowName,
        nameAr: execToRetry.workflowNameAr || execToRetry.workflowName,
        description: 'Auto reconstructed workflow',
        descriptionAr: 'مسار معاد توجيهه من السجلات',
        category: 'Sales & Marketing',
        active: true,
        executionsCount: 1,
        successCount: 1,
        createdBy: 'Automation Engine',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        trigger: { id: 'trig-ret', type: 'webhook', title: 'Webhook Trigger', titleAr: 'مُشغل أوتوماتيكي', icon: 'Webhook', config: {} },
        steps: execToRetry.stepsLog.slice(1).map((s, idx) => ({
          id: s.stepId,
          type: 'gemini_ai',
          title: s.stepTitle,
          titleAr: s.stepTitleAr || s.stepTitle,
          icon: 'Bot',
          config: {}
        }))
      };

      const newLog = await retryWorkflowExecution(execToRetry, targetWorkflow as Workflow);
      if (onExecutionUpdate) {
        onExecutionUpdate(newLog);
      }
      setSelectedExec(newLog);
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleRunScheduledCronJob = async (wf: Workflow) => {
    setCronRunningId(wf.id);
    try {
      const newLog = await executeWorkflow(wf, {
        triggeredBy: `Scheduler Cron (${wf.cronSchedule || '0 9 * * *'})`
      });
      if (onExecutionUpdate) {
        onExecutionUpdate(newLog);
      }
    } catch (err) {
      console.error('Cron run error:', err);
    } finally {
      setCronRunningId(null);
    }
  };

  const handleSaveCronSchedule = (wf: Workflow) => {
    const updatedWf: Workflow = {
      ...wf,
      cronSchedule: cronExpressionInput,
      cronEnabled: true
    };
    if (onWorkflowUpdate) {
      onWorkflowUpdate(updatedWf);
    }
    setSelectedCronWorkflow(null);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Engine Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Cpu className="w-6 h-6 text-indigo-600 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              محرك الأتمتة المباشر (Zain Automation Engine)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            سجل التنفيذ الفوري ومركز تحكم الجدولة الذكية لجميع مسارات العمل المربوطة بـ Cloud Firestore
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center space-x-1.5 space-x-reverse ${
              activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>سجل التتبع المباشر (Execution History)</span>
          </button>

          <button
            onClick={() => setActiveTab('scheduler')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center space-x-1.5 space-x-reverse ${
              activeTab === 'scheduler' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>المُجدول الأوتوماتيكي (Cron Scheduler)</span>
            {scheduledWorkflows.length > 0 && (
              <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                {scheduledWorkflows.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('dlq')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center space-x-1.5 space-x-reverse ${
              activeTab === 'dlq' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>طابور الرسائل الميتة (Dead Letter Queue)</span>
            {executions.filter(e => e.status === 'failed').length > 0 && (
              <span className="bg-rose-100 text-rose-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                {executions.filter(e => e.status === 'failed').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Engine Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>إجمالي مرات التشغيل</span>
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalCount.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">مسجلة بالكامل في Firestore</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>نسبة النجاح العامة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{successRate}%</p>
          <p className="text-[10px] text-emerald-700/80 mt-1">{successCount} عملية ناجحة</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>متوسط زمن التنفيذ</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{avgDurationMs}ms</p>
          <p className="text-[10px] text-slate-400 mt-1">زمن استجابة فائق السرعة</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>مُجدولات Cron النشطة</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-600">{scheduledWorkflows.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">مهام مجدولة تلقائياً</p>
        </div>
      </div>

      {activeTab === 'logs' ? (
        <>
          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث باسم المسار، المحفز، أو الرمز المرجعي..."
                className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              />
            </div>

            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setStatusFilter('success')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  statusFilter === 'success' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                }`}
              >
                {t.logs.statusSuccess}
              </button>
              <button
                onClick={() => setStatusFilter('failed')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  statusFilter === 'failed' ? 'bg-rose-600 text-white' : 'text-slate-600'
                }`}
              >
                {t.logs.statusFailed}
              </button>
            </div>
          </div>

          {/* Mobile Card View for Executions */}
          <div className="block sm:hidden space-y-3">
            {filteredLogs.map((exec) => (
              <div
                key={exec.id}
                onClick={() => setSelectedExec(exec)}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2.5 active:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse min-w-0 pr-2">
                    <Activity className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="font-extrabold text-xs text-slate-900 truncate">
                      {language === 'ar' ? (exec.workflowNameAr || exec.workflowName) : exec.workflowName}
                    </span>
                  </div>

                  <span className={`inline-flex items-center space-x-1 space-x-reverse px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                    exec.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {exec.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    <span>{exec.status === 'success' ? t.logs.statusSuccess : t.logs.statusFailed}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">المشغل (Trigger):</span>
                    <span className="truncate block font-bold text-slate-700">{exec.triggeredBy}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">الزمن (Duration):</span>
                    <span className="font-bold text-slate-700">{exec.durationMs}ms</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                  <span>{new Date(exec.executedAt).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetryExecution(exec);
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-bold rounded-xl transition-all border border-slate-200 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>إعادة التشغيل</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Executions Table */}
          <div className="hidden sm:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4 pr-6">{t.logs.workflowName}</th>
                    <th className="p-4">{t.logs.triggeredBy}</th>
                    <th className="p-4">الخطوات</th>
                    <th className="p-4">{t.logs.duration}</th>
                    <th className="p-4">{t.logs.time}</th>
                    <th className="p-4 pl-6 text-center">الحالة والإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredLogs.map((exec) => (
                    <tr
                      key={exec.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedExec(exec)}
                    >
                      <td className="p-4 pr-6 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Activity className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>{language === 'ar' ? (exec.workflowNameAr || exec.workflowName) : exec.workflowName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 font-mono text-[11px]">{exec.triggeredBy}</td>
                      <td className="p-4 text-slate-700 font-bold">
                        {exec.totalSteps || exec.stepsLog.length} عُقد
                      </td>
                      <td className="p-4 font-mono text-slate-500">{exec.durationMs}ms</td>
                      <td className="p-4 text-slate-400">
                        {new Date(exec.executedAt).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="p-4 pl-6 text-center">
                        <div className="flex items-center justify-center space-x-2 space-x-reverse" onClick={(e) => e.stopPropagation()}>
                          <span className={`inline-flex items-center space-x-1 space-x-reverse px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            exec.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {exec.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            <span>{exec.status === 'success' ? t.logs.statusSuccess : t.logs.statusFailed}</span>
                          </span>

                          <button
                            onClick={() => handleRetryExecution(exec)}
                            className="p-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-xl transition-all border border-slate-200"
                            title="إعادة تشغيل هذا التنفيذ فوراً (Retry Execution)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Cron Scheduler View */
        <div className="space-y-6">
          <div className="bg-indigo-900 text-white p-6 rounded-3xl border border-indigo-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Calendar className="w-6 h-6 text-amber-300" />
                <h2 className="text-lg font-black">مُجدول Cron الذكي (Automated Cron Scheduler)</h2>
              </div>
              <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                قم بجدولة مسارات العمل للعمل التلقائي بناءً على تعابير Cron القياسية (مثل كل 15 دقيقة، أو يومياً الساعة 8 صباحاً)، واستشعار المواعيد دون تدخل بشري.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflows.map((wf) => {
              const isScheduled = !!wf.cronSchedule;

              return (
                <div key={wf.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase bg-slate-100 px-2.5 py-1 rounded-lg text-slate-500">
                        {wf.category}
                      </span>
                      {isScheduled ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center space-x-1 space-x-reverse">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>مجـدول نشـط</span>
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                          غير مجدول
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 mb-1">
                      {language === 'ar' ? wf.nameAr : wf.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {language === 'ar' ? wf.descriptionAr : wf.description}
                    </p>

                    {isScheduled && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 mb-4 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[10px]">تعبير Cron:</span>
                          <span className="bg-slate-900 text-amber-300 font-bold px-2 py-0.5 rounded-lg text-[11px]">
                            {wf.cronSchedule}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700 font-sans">
                          <span className="text-slate-400 text-[10px]">الوصف الزمني:</span>
                          <span className="font-bold">{getCronHumanReadable(wf.cronSchedule || '', language)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500 text-[11px] pt-2 border-t border-slate-200/60 font-sans">
                          <span>التشغيل القادم المتوقع:</span>
                          <span className="font-bold text-indigo-600">{getNextCronRunTime(wf.cronSchedule)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedCronWorkflow(wf);
                        setCronExpressionInput(wf.cronSchedule || '0 9 * * *');
                      }}
                      className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-all border border-slate-200 text-center"
                    >
                      {isScheduled ? 'تعديل جدول Cron' : 'إضافة جدولة Cron'}
                    </button>

                    <button
                      disabled={cronRunningId === wf.id}
                      onClick={() => handleRunScheduledCronJob(wf)}
                      className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center space-x-1.5 space-x-reverse"
                    >
                      {cronRunningId === wf.id ? (
                        <span>جاري التنفيذ...</span>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>تشغيل الجدولة الآن</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cron Config Modal */}
      {selectedCronWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Clock className="w-5 h-5 text-amber-300" />
                <h3 className="font-extrabold text-sm">
                  إعداد جدولة Cron: {language === 'ar' ? selectedCronWorkflow.nameAr : selectedCronWorkflow.name}
                </h3>
              </div>
              <button onClick={() => setSelectedCronWorkflow(null)} className="p-1 text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-800">
              <div>
                <label className="block font-bold mb-1">أدخل تعبير Cron (Standard 5-part Cron):</label>
                <input
                  type="text"
                  value={cronExpressionInput}
                  onChange={(e) => setCronExpressionInput(e.target.value)}
                  placeholder="0 9 * * *"
                  className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-sm rounded-2xl border border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px] text-slate-600 font-mono">
                <p className="font-bold text-slate-900 font-sans">نماذج جاهزة للتشغيل:</p>
                <p onClick={() => setCronExpressionInput('0 8 * * *')} className="cursor-pointer hover:text-indigo-600">
                  • 0 8 * * * : يومياً الساعة 8:00 صباحاً
                </p>
                <p onClick={() => setCronExpressionInput('*/15 * * * *')} className="cursor-pointer hover:text-indigo-600">
                  • */15 * * * * : كل 15 دقيقة
                </p>
                <p onClick={() => setCronExpressionInput('0 0 * * 1')} className="cursor-pointer hover:text-indigo-600">
                  • 0 0 * * 1 : أسبوعياً كل يوم إثنين
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px]">
                سيقوم Automation Engine بتشغيل المسار وحفظ المخرجات بانتظام في Cloud Firestore.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedCronWorkflow(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleSaveCronSchedule(selectedCronWorkflow)}
                className="px-5 py-2 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md hover:bg-indigo-700"
              >
                حفظ الجدول المجدول
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dead Letter Queue (DLQ) View */}
      {activeTab === 'dlq' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-sm text-rose-900">
                طابور الرسائل والعمليات الميتة (Dead Letter Queue - DLQ)
              </h3>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              تصل العمليات الفاشلة إلى هذا الطابور بعد استنفاذ جميع محاولات الإعادة التلقائية الثلاثة (3x Retries) بفواصل زمنية مضاعفة. يمكنك إعادة تشغيلها بضغطة واحدة بعد تصليح المشكلة.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                المهام الميتة المتوقفة: {executions.filter(e => e.status === 'failed').length}
              </span>

              {executions.filter(e => e.status === 'failed').length > 0 && (
                <button
                  onClick={() => {
                    const failedExecs = executions.filter(e => e.status === 'failed');
                    if (failedExecs.length > 0) {
                      handleRetryExecution(failedExecs[0]);
                    }
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة تشغيل جميع عمليات DLQ برمجياً</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {executions.filter(e => e.status === 'failed').length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="font-bold text-slate-700">طابور DLQ فارغ وسليم 100%!</p>
                  <p>جميع العمليات يتم تنفيذها بسلاسة وبدون أي رسائل معلقة.</p>
                </div>
              ) : (
                executions.filter(e => e.status === 'failed').map((failedExec) => (
                  <div key={failedExec.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-rose-50/40 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                          DLQ-{failedExec.id.slice(0, 8)}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900">
                          {language === 'ar' ? (failedExec.workflowNameAr || failedExec.workflowName) : failedExec.workflowName}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Cause: {failedExec.error || 'Runtime Exception / Node Timeout'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRetryExecution(failedExec)}
                      disabled={isRetrying}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>إعادة محاولة الرن الآن</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Step Trace & Data Inspection Modal */}
      {selectedExec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2.5 bg-indigo-600 rounded-2xl text-white">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                      Execution ID: {selectedExec.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      selectedExec.status === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {selectedExec.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-black text-base mt-0.5">
                    تفاصيل تنفيذ: {language === 'ar' ? (selectedExec.workflowNameAr || selectedExec.workflowName) : selectedExec.workflowName}
                  </h3>
                </div>
              </div>

              <button onClick={() => setSelectedExec(null)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6 text-slate-800">
              {/* Trigger Payload Inspection */}
              {selectedExec.triggerPayload && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-900 flex items-center space-x-2 space-x-reverse">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <span>المدخل المبدئي لمُشغّل الأتمتة ($trigger payload):</span>
                  </h4>
                  <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-2xl border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedExec.triggerPayload, null, 2)}
                  </pre>
                </div>
              )}

              {/* Step Trace Breakdown */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center space-x-2 space-x-reverse">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>تتبع العُقد وسلسلة نقل البيانات (Data Pipeline Step Trace):</span>
                </h4>

                <div className="space-y-3">
                  {selectedExec.stepsLog.map((step, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono text-[10px] font-bold">
                            {idx}
                          </span>
                          <span className="font-black text-slate-900">
                            {step.stepTitleAr || step.stepTitle}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                            {step.durationMs}ms
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            step.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {step.status}
                          </span>
                        </div>
                      </div>

                      {/* Step Outputs */}
                      {step.output && (
                        <div>
                          <p className="text-[10px] font-extrabold text-slate-500 mb-1">المخرجات الممررة للخطوة التالية ($output):</p>
                          <pre className="bg-slate-900 text-amber-300 p-3 rounded-xl font-mono text-[10px] overflow-x-auto whitespace-pre-wrap border border-slate-800">
                            {JSON.stringify(step.output, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Step Live Console Logs */}
                      {step.logs && step.logs.length > 0 && (
                        <div>
                          <p className="text-[10px] font-extrabold text-slate-500 mb-1">سجل المخرجات المباشرة (Console Output):</p>
                          <div className="bg-slate-950 text-emerald-400 p-3 rounded-xl font-mono text-[10px] space-y-1 border border-slate-900">
                            {step.logs.map((l, lIdx) => (
                              <p key={lIdx}>&gt; {l}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedExec(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-2xl transition-all"
              >
                إغلاق التقرير
              </button>

              <button
                disabled={isRetrying}
                onClick={() => handleRetryExecution(selectedExec)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center space-x-2 space-x-reverse"
              >
                <RotateCcw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'جاري إعادة التشغيل...' : 'إعادة تشغيل هذا التنفيذ فوراً (Retry)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

