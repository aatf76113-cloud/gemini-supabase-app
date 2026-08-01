import React, { useState } from 'react';
import { 
  GitFork, 
  Search, 
  Plus, 
  Sparkles, 
  Play, 
  Edit3, 
  Trash2, 
  Check, 
  Power,
  Webhook,
  Bot,
  Database,
  Mail,
  Slack,
  CreditCard,
  MessageSquare,
  Clock,
  AlertOctagon,
  PauseCircle,
  PlayCircle,
  FileCode
} from 'lucide-react';
import { Language, Workflow } from '../types';
import { translations } from '../i18n/translations';
import { getCronHumanReadable } from '../services/workflowRunner';

interface WorkflowsListProps {
  language: Language;
  workflows: Workflow[];
  onSelectWorkflow: (workflow: Workflow) => void;
  onNewWorkflow: () => void;
  onOpenAIGenerator: () => void;
  onToggleActive: (workflow: Workflow, newStatus?: 'Draft' | 'Active' | 'Paused' | 'Error') => void;
  onDeleteWorkflow: (id: string) => void;
  onTestRunWorkflow: (workflow: Workflow) => void;
}

export const WorkflowsList: React.FC<WorkflowsListProps> = ({
  language,
  workflows,
  onSelectWorkflow,
  onNewWorkflow,
  onOpenAIGenerator,
  onToggleActive,
  onDeleteWorkflow,
  onTestRunWorkflow
}) => {
  const t = translations[language];
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const categories = ['All', 'Sales & Marketing', 'Customer Support', 'E-commerce', 'AI & Data'];

  const getWorkflowStatus = (wf: Workflow): 'Draft' | 'Active' | 'Paused' | 'Error' => {
    if (wf.status) return wf.status;
    return wf.active ? 'Active' : 'Draft';
  };

  const filteredWorkflows = workflows.filter(w => {
    const name = language === 'ar' ? w.nameAr : w.name;
    const desc = language === 'ar' ? w.descriptionAr : w.description;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || desc.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || w.category === selectedCategory;
    const currentStatus = getWorkflowStatus(w);
    const matchesStatus = statusFilter === 'All' || currentStatus === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (wf: Workflow) => {
    const st = getWorkflowStatus(wf);
    switch (st) {
      case 'Active':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center space-x-1 space-x-reverse">
            <PlayCircle className="w-3 h-3 text-emerald-600" />
            <span>نشط (Active)</span>
          </span>
        );
      case 'Paused':
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center space-x-1 space-x-reverse">
            <PauseCircle className="w-3 h-3 text-amber-600" />
            <span>موقوف (Paused)</span>
          </span>
        );
      case 'Error':
        return (
          <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center space-x-1 space-x-reverse">
            <AlertOctagon className="w-3 h-3 text-rose-600" />
            <span>خطأ (Error)</span>
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center space-x-1 space-x-reverse">
            <FileCode className="w-3 h-3 text-slate-500" />
            <span>مسودة (Draft)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{t.workflows.title}</h1>
          <p className="text-xs text-slate-500 mt-1">{t.workflows.subtitle}</p>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={onNewWorkflow}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-indigo-100 transition-all flex items-center space-x-2 space-x-reverse"
          >
            <Plus className="w-4 h-4" />
            <span>{t.workflows.newBtn}</span>
          </button>

          <button
            onClick={onOpenAIGenerator}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-2xl border border-slate-800 transition-all flex items-center space-x-2 space-x-reverse"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.workflows.aiBtn}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.workflows.searchPlaceholder}
            className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 space-x-reverse bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {['All', 'Active', 'Paused', 'Draft', 'Error'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'All' ? 'الكل' : st === 'Active' ? 'نشط' : st === 'Paused' ? 'موقوف' : st === 'Draft' ? 'مسودة' : 'خطأ'}
            </button>
          ))}
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.map((wf) => {
          const currentStatus = getWorkflowStatus(wf);

          return (
            <div
              key={wf.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between relative group"
            >
              {/* Active / Status Toggle Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {wf.category}
                </span>

                {/* Status Switcher Dropdown */}
                <select
                  value={currentStatus}
                  onChange={(e) => onToggleActive(wf, e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  <option value="Active">🟢 نشط (Active)</option>
                  <option value="Paused">🟠 موقوف (Paused)</option>
                  <option value="Draft">⚪ مسودة (Draft)</option>
                  <option value="Error">🔴 خطأ (Error)</option>
                </select>
              </div>

              {/* Workflow Title & Description */}
              <div className="mb-4 cursor-pointer" onClick={() => onSelectWorkflow(wf)}>
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {language === 'ar' ? wf.nameAr : wf.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {language === 'ar' ? wf.descriptionAr : wf.description}
                </p>
              </div>

              {/* Status Badge & Cron Info */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {getStatusBadge(wf)}

                {wf.cronSchedule && (
                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 space-x-reverse">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    <span>{getCronHumanReadable(wf.cronSchedule, language)}</span>
                  </span>
                )}
              </div>

              {/* Workflow Trigger & Steps Summary Icons */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-6 flex items-center space-x-2 space-x-reverse overflow-x-auto text-xs">
                <span className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 font-bold text-slate-700 flex items-center space-x-1 space-x-reverse shrink-0">
                  <Webhook className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{wf.trigger.titleAr || wf.trigger.title}</span>
                </span>

                <span className="text-slate-300 font-bold">→</span>

                <span className="bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100 font-bold text-indigo-700 flex items-center space-x-1 space-x-reverse shrink-0">
                  <span>{wf.steps.length} خطوات</span>
                </span>
              </div>

              {/* Footer Stats & Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div>
                  <p className="font-bold text-slate-700">{wf.executionsCount || 0} تشغيل</p>
                  <p className="text-[10px]">نجاح: {wf.successCount || 0}</p>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => onTestRunWorkflow(wf)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center space-x-1 space-x-reverse"
                    title="تشغيل محرك الأتمتة الفوري"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span className="text-[11px]">تشغيل</span>
                  </button>

                  <button
                    onClick={() => onSelectWorkflow(wf)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                    title="تعديل المسار"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteWorkflow(wf.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                    title="حذف المسار"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
