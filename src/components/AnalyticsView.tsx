import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Zap,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { Language, Workflow, ExecutionLog } from '../types';
import { translations } from '../i18n/translations';

interface AnalyticsViewProps {
  language: Language;
  workflows: Workflow[];
  executions: ExecutionLog[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  language,
  workflows,
  executions
}) => {
  const t = translations[language];

  // Daily trend mock-derived data for Recharts
  const dailyData = [
    { day: 'سبت', tasks: 1200, success: 1190, errors: 10 },
    { day: 'أحد', tasks: 1850, success: 1830, errors: 20 },
    { day: 'إثنين', tasks: 2400, success: 2380, errors: 20 },
    { day: 'ثلاثاء', tasks: 3100, success: 3070, errors: 30 },
    { day: 'أربعاء', tasks: 2900, success: 2880, errors: 20 },
    { day: 'خميس', tasks: 3800, success: 3770, errors: 30 },
    { day: 'جمعة', tasks: 2100, success: 2090, errors: 10 },
  ];

  const categoryData = [
    { name: 'AI & Data', count: 420 },
    { name: 'Sales & Mktg', count: 310 },
    { name: 'Customer Support', count: 280 },
    { name: 'E-commerce', count: 190 },
    { name: 'Productivity', count: 150 },
  ];

  const pieData = [
    { name: 'ناجحة (Success)', value: 98.4, color: '#10b981' },
    { name: 'أخطاء (Failed)', value: 1.6, color: '#f43f5e' },
  ];

  const totalRuns = executions.length + 12402;
  const successCount = Math.round(totalRuns * 0.984);
  const avgLatency = 312; // ms

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{t.nav.analytics}</h1>
          <p className="text-xs text-slate-500 mt-1">تقارير بيانية تفصيلية لمعدل تنفيذ المهام والسرعة ونسبة النجاح</p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse bg-slate-50 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>آخر 30 يوماً</span>
        </div>
      </div>

      {/* KPI Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي المهام المنفذة</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalRuns.toLocaleString()}</p>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg inline-block">
            +18.4% عن الشهر الماضي
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">نسبة نجاح التنفيذ</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">98.4%</p>
          <span className="text-[11px] font-bold text-slate-500">من أصل جميع المحاولات</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">متوسط زمن الاستجابة</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{avgLatency} ms</p>
          <span className="text-[11px] font-bold text-emerald-600">استجابة سريعة جداً</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الساعات البرمجية الموفرة</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">420+ ساعة</p>
          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg inline-block">
            توفير في الوقت والتكلفة
          </span>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Line Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">حجم المهام اليومية الأسبوعي</h3>
            <span className="text-xs text-slate-400 font-mono">Tasks / Day</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="tasks" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Success Rate */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 mb-1">دقة وموثوقية التشغيل</h3>
            <p className="text-xs text-slate-500">توزيع الحالات بين النجاح والأخطاء</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-xl font-black text-slate-900">98.4%</span>
              <span className="text-[10px] text-slate-400 block">ناجح</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center space-x-2 space-x-reverse">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>العمليات الناجحة</span>
              </span>
              <span>{successCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center space-x-2 space-x-reverse">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>فشل التنفيذ</span>
              </span>
              <span>{(totalRuns - successCount).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart Categories */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900">حجم الاستخدام حسب التصنيف الأكاديمي والعملي</h3>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
