import React, { useState } from 'react';
import { ShieldCheck, Filter, Download, Clock, User, FileText, CheckCircle2, AlertCircle, RefreshCw, Search } from 'lucide-react';
import { Language, AuditLog, Workspace, AuditLogAction } from '../types';

interface AuditLogViewProps {
  language: Language;
  activeWorkspace: Workspace | null;
  logs: AuditLog[];
  onRefresh: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  language,
  activeWorkspace,
  logs,
  onRefresh
}) => {
  const isAr = language === 'ar';
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter(l => {
    const matchesAction = filterAction === 'ALL' || l.action.includes(filterAction);
    const matchesSearch = searchTerm === '' || 
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getActionBadge = (action: AuditLogAction) => {
    if (action.startsWith('WORKFLOW')) {
      return <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 font-extrabold px-2.5 py-1 rounded-lg text-[10px]">⚡ {action}</span>;
    }
    if (action.startsWith('MEMBER') || action.startsWith('INVITATION')) {
      return <span className="bg-amber-100 text-amber-800 border border-amber-200 font-extrabold px-2.5 py-1 rounded-lg text-[10px]">👥 {action}</span>;
    }
    if (action.startsWith('WORKSPACE')) {
      return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold px-2.5 py-1 rounded-lg text-[10px]">🏢 {action}</span>;
    }
    return <span className="bg-slate-100 text-slate-800 border border-slate-200 font-extrabold px-2.5 py-1 rounded-lg text-[10px]">⚙️ {action}</span>;
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Action', 'User', 'Email', 'Details', 'Timestamp'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.action,
      l.userName,
      l.userEmail,
      `"${l.details.replace(/"/g, '""')}"`,
      l.createdAt
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_log_${activeWorkspace?.slug || 'workspace'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {isAr ? 'سجل التدقيق البرمجي (Audit Log)' : 'Compliance Audit Log'}
            </h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-100">
              {activeWorkspace?.name || 'Zain Production'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isAr 
              ? 'تتبع حثيث وسجل كامل وغير قابل للتعديل لجميع العمليات الحساسة (إنشاء وتعديل المسارات، إدارة الأعضاء، الصلاحيات).' 
              : 'Immutable audit trails recording all key workspace mutations, workflow changes, and member access.'}
          </p>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse self-start sm:self-auto shrink-0">
          <button
            onClick={onRefresh}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
            title={isAr ? 'تحديث السجل' : 'Refresh Log'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-2 space-x-reverse"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isAr ? 'بحث في التفاصيل، اسم المستخدم أو البريد...' : 'Search logs by user, email, or action details...'}
            className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Action Filter Pills */}
        <div className="flex items-center space-x-1.5 space-x-reverse overflow-x-auto pb-1 md:pb-0 text-xs font-bold">
          <button
            onClick={() => setFilterAction('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterAction === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'الكل' : 'All Events'}
          </button>

          <button
            onClick={() => setFilterAction('WORKFLOW')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterAction === 'WORKFLOW' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'المسارات' : 'Workflows'}
          </button>

          <button
            onClick={() => setFilterAction('MEMBER')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterAction === 'MEMBER' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'الأعضاء' : 'Members'}
          </button>

          <button
            onClick={() => setFilterAction('WORKSPACE')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterAction === 'WORKSPACE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'مساحة العمل' : 'Workspace'}
          </button>
        </div>
      </div>

      {/* Mobile Card List View for Audit Logs */}
      <div className="block sm:hidden space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            {isAr ? 'لا توجد سجلات تدقيق تطابق شروط البحث' : 'No audit records found matching query'}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5 active:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>{getActionBadge(log.action)}</div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(log.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                  {log.userName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="font-extrabold text-xs text-slate-900 block truncate">{log.userName}</span>
                  <span className="text-[10px] text-slate-400 font-mono truncate block">{log.userEmail}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                {log.details}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Desktop Logs Table */}
      <div className="hidden sm:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider">
              <tr>
                <th className="p-4 pr-6">{isAr ? 'نوع الحدث' : 'Event Action'}</th>
                <th className="p-4">{isAr ? 'المستخدم' : 'Actor'}</th>
                <th className="p-4">{isAr ? 'تفاصيل العملية' : 'Details'}</th>
                <th className="p-4 text-center pl-6">{isAr ? 'التاريخ والوقت' : 'Timestamp'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    {isAr ? 'لا توجد سجلات تدقيق تطابق شروط البحث' : 'No audit records found matching query'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => setSelectedLog(log)}>
                    <td className="p-4 pr-6">{getActionBadge(log.action)}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-[11px] text-slate-700">
                          {log.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{log.userName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.userEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-800 font-medium">{log.details}</td>
                    <td className="p-4 text-center pl-6 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  {isAr ? 'تفاصيل حدث التدقيق' : 'Audit Event Trace Details'}
                </h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl overflow-x-auto space-y-2">
                <p><span className="text-indigo-400">ID:</span> {selectedLog.id}</p>
                <p><span className="text-amber-400">Action:</span> {selectedLog.action}</p>
                <p><span className="text-emerald-400">WorkspaceID:</span> {selectedLog.workspaceId}</p>
                <p><span className="text-sky-400">User:</span> {selectedLog.userName} ({selectedLog.userEmail})</p>
                <p><span className="text-pink-400">Timestamp:</span> {selectedLog.createdAt}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-sans">
                <p className="font-bold text-slate-500 mb-1">{isAr ? 'الوصف الكامل:' : 'Full Description:'}</p>
                <p className="font-medium text-xs">{selectedLog.details}</p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
