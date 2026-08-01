import React, { useState, useEffect } from 'react';
import { AppNotification, Language, NavTab } from '../types';
import { notificationService } from '../services/firebase';
import { 
  Bell, 
  Check, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Workflow, 
  UserPlus, 
  Key, 
  CreditCard, 
  ExternalLink,
  Filter,
  RefreshCw
} from 'lucide-react';

interface NotificationsCenterProps {
  language: Language;
  onNavigateTab?: (tab: NavTab) => void;
  isDropdownMode?: boolean;
  onCloseDropdown?: () => void;
  workspaceId?: string;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  language,
  onNavigateTab,
  isDropdownMode = false,
  onCloseDropdown,
  workspaceId,
  onUnreadCountChange
}) => {
  const isAr = language === 'ar';
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(workspaceId);
      setNotifications(data);
      const unread = data.filter(n => !n.read).length;
      if (onUnreadCountChange) onUnreadCountChange(unread);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [workspaceId]);

  const handleMarkAsRead = async (id: string) => {
    const updated = await notificationService.markAsRead(id);
    setNotifications(updated);
    const unread = updated.filter(n => !n.read).length;
    if (onUnreadCountChange) onUnreadCountChange(unread);
  };

  const handleMarkAllAsRead = async () => {
    const updated = await notificationService.markAllAsRead();
    setNotifications(updated);
    if (onUnreadCountChange) onUnreadCountChange(0);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = await notificationService.deleteNotification(id);
    setNotifications(updated);
    const unread = updated.filter(n => !n.read).length;
    if (onUnreadCountChange) onUnreadCountChange(unread);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      handleMarkAsRead(notif.id);
    }
    if (notif.linkTab && onNavigateTab) {
      onNavigateTab(notif.linkTab);
      if (onCloseDropdown) onCloseDropdown();
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === 'all') return true;
    return n.category === activeCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workflow': return <Workflow className="w-4 h-4 text-indigo-600" />;
      case 'invitation': return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case 'vault': return <Key className="w-4 h-4 text-amber-600" />;
      case 'billing': return <CreditCard className="w-4 h-4 text-purple-600" />;
      default: return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
  };

  if (isDropdownMode) {
    return (
      <div className="w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-150">
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 font-semibold">
            <Bell className="w-4 h-4 text-indigo-400" />
            <span>{isAr ? 'الإشعارات التلقائية' : 'In-App Notifications'}</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-indigo-500 text-white rounded-full font-bold">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </div>
          <button 
            onClick={handleMarkAllAsRead}
            className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Check className="w-3 h-3" />
            <span>{isAr ? 'قراءة الكل' : 'Mark all read'}</span>
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>{isAr ? 'جاري التحميل...' : 'Loading...'}</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">{isAr ? 'لا توجد إشعارات حالياً' : 'No notifications found'}</p>
            </div>
          ) : (
            filteredNotifications.slice(0, 5).map(n => (
              <div 
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start relative ${
                  !n.read ? 'bg-indigo-50/40 border-l-2 border-indigo-600' : ''
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                  {getCategoryIcon(n.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h5 className="font-semibold text-xs text-slate-900 truncate">
                      {isAr ? n.titleAr : n.title}
                    </h5>
                    {getTypeBadge(n.type)}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {isAr ? n.messageAr : n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
          <button 
            onClick={() => {
              if (onNavigateTab) onNavigateTab('notifications');
              if (onCloseDropdown) onCloseDropdown();
            }}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 mx-auto"
          >
            <span>{isAr ? 'عرض جميع الإشعارات' : 'View All Notifications'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {isAr ? 'مركز الإشعارات والتنبيهات' : 'Notifications & Alerts Center'}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {isAr ? 'متابعة حية لتنفيذ سير العمل، الدعوات، والأحداث الأمنية للكتلة' : 'Real-time feed for workflow runs, team invites, and security vaults'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={loadNotifications}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title={isAr ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium rounded-lg shadow-sm flex items-center gap-2 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>{isAr ? 'تحديد الكل كـ مقروء' : 'Mark All as Read'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'all', labelAr: 'جميع الإشعارات', labelEn: 'All Alerts' },
          { id: 'workflow', labelAr: 'تنفيذ المسارات', labelEn: 'Workflow Executions' },
          { id: 'invitation', labelAr: 'الدعوات والفريق', labelEn: 'Team & Invites' },
          { id: 'vault', labelAr: 'خزنة المفاتيح Security', labelEn: 'Vault & Secrets' },
          { id: 'billing', labelAr: 'الاستهلاك والاشتراكات', labelEn: 'Usage & Billing' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {isAr ? cat.labelAr : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            <span>{isAr ? 'جاري تحميل سجل الإشعارات...' : 'Loading notification log...'}</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">
              {isAr ? 'لا توجد إشعارات في الفئة المحددة' : 'No notifications found'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isAr ? 'ستظهر جميع التنبيهات الفورية والتأكيدات هنا في الحين' : 'Automated status alerts will stream here instantly'}
            </p>
          </div>
        ) : (
          filteredNotifications.map(n => (
            <div 
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer flex items-start gap-4 hover:shadow-md ${
                !n.read ? 'border-indigo-300 bg-indigo-50/20 shadow-sm' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="p-3 bg-slate-100 rounded-xl shrink-0">
                {getCategoryIcon(n.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-900">
                      {isAr ? n.titleAr : n.title}
                    </h3>
                    {!n.read && (
                      <span className="px-2 py-0.5 text-[10px] bg-indigo-100 text-indigo-700 font-bold rounded-full">
                        {isAr ? 'جديد' : 'NEW'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{new Date(n.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US')}</span>
                    {getTypeBadge(n.type)}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {isAr ? n.messageAr : n.message}
                </p>

                {n.linkTab && (
                  <div className="mt-2 text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:underline">
                    <span>{isAr ? 'الانتقال إلى القسم المعني' : 'Navigate to section'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                )}
              </div>

              <button 
                onClick={(e) => handleDelete(n.id, e)}
                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                title={isAr ? 'حذف' : 'Delete'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
