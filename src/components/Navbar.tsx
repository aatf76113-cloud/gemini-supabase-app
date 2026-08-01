import React, { useState } from 'react';
import { 
  Zap, 
  Globe, 
  Sparkles, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Menu,
  ChevronDown,
  Building2,
  Plus,
  Users,
  Check,
  Bell,
  MessageSquarePlus,
  Download
} from 'lucide-react';
import { Language, UserProfile, Workspace, NavTab } from '../types';
import { translations } from '../i18n/translations';
import { NotificationsCenter } from './NotificationsCenter';

interface NavbarProps {
  user: UserProfile | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAIGenerator: () => void;
  onToggleSidebar?: () => void;
  onOpenFeedback?: () => void;
  onOpenInstallPwa?: () => void;
  activeWorkspace?: Workspace | null;
  workspaces?: Workspace[];
  onSelectWorkspace?: (ws: Workspace) => void;
  onOpenWorkspacesView?: () => void;
  onOpenTeamView?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  language,
  onLanguageChange,
  onOpenAuth,
  onLogout,
  onOpenAIGenerator,
  onToggleSidebar,
  onOpenFeedback,
  onOpenInstallPwa,
  activeWorkspace,
  workspaces = [],
  onSelectWorkspace,
  onOpenWorkspacesView,
  onOpenTeamView,
  onNavigateTab
}) => {
  const t = translations[language];
  const isAr = language === 'ar';
  const [isWsMenuOpen, setIsWsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(2);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center space-x-3 space-x-reverse">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center space-x-2.5 space-x-reverse">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-200">
            Z
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800">
            Zain <span className="text-indigo-600">Auto</span>
          </span>
        </div>

        {/* Workspace Switcher Component */}
        <div className="relative pr-3 border-r border-slate-200 mr-2">
          <button
            onClick={() => setIsWsMenuOpen(!isWsMenuOpen)}
            className="flex items-center space-x-2 space-x-reverse bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors text-xs"
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span className="font-extrabold text-slate-900 max-w-[150px] truncate">
              {activeWorkspace?.name || 'Zain Production'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isWsMenuOpen && (
            <div 
              className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setIsWsMenuOpen(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                {isAr ? 'مساحات العمل الخاصة بك' : 'Your Workspaces'}
              </div>

              <div className="max-h-48 overflow-y-auto px-1 space-y-1">
                {workspaces.map((ws) => {
                  const isSelected = activeWorkspace?.id === ws.id;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => {
                        if (onSelectWorkspace) onSelectWorkspace(ws);
                        setIsWsMenuOpen(false);
                      }}
                      className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                        isSelected 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate pr-1">{ws.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 mt-2 pt-1 px-1 space-y-0.5">
                <button
                  onClick={() => {
                    if (onOpenWorkspacesView) onOpenWorkspacesView();
                    setIsWsMenuOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center space-x-2 space-x-reverse transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إدارة وإنشاء مساحة عمل جديدة' : 'Manage & Create Workspaces'}</span>
                </button>

                <button
                  onClick={() => {
                    if (onOpenTeamView) onOpenTeamView();
                    setIsWsMenuOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl flex items-center space-x-2 space-x-reverse transition-colors"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{isAr ? 'دعوة أعضاء الفريق' : 'Team Governance'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3 space-x-reverse">
        {/* Install PWA App Button */}
        {onOpenInstallPwa && (
          <button
            onClick={onOpenInstallPwa}
            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all border border-indigo-200 flex items-center gap-1.5 shadow-sm"
            title={isAr ? 'تثبيت التطبيق (PWA / App)' : 'Install App'}
          >
            <Download className="w-4 h-4 text-indigo-600 animate-bounce" />
            <span className="hidden lg:inline text-xs font-extrabold text-indigo-700">
              {isAr ? 'تثبيت التطبيق' : 'Install App'}
            </span>
          </button>
        )}

        {/* Feedback Button */}
        {onOpenFeedback && (
          <button
            onClick={onOpenFeedback}
            className="p-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
            title={isAr ? 'إرسال ملاحظة على النسخة التجريبية' : 'Beta Feedback'}
          >
            <MessageSquarePlus className="w-4 h-4 text-indigo-600" />
            <span className="hidden md:inline text-xs font-bold text-slate-700 hover:text-indigo-600">
              {isAr ? 'ملاحظات Beta' : 'Feedback'}
            </span>
          </button>
        )}

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl relative transition-colors"
            title={isAr ? 'الإشعارات' : 'Notifications'}
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute left-0 mt-2 z-50 ltr:left-auto ltr:right-0 rtl:right-auto rtl:left-0">
              <NotificationsCenter
                language={language}
                isDropdownMode={true}
                onCloseDropdown={() => setIsNotifOpen(false)}
                onNavigateTab={(tab) => {
                  if (onNavigateTab) onNavigateTab(tab);
                  setIsNotifOpen(false);
                }}
                workspaceId={activeWorkspace?.id}
                onUnreadCountChange={setUnreadNotifsCount}
              />
            </div>
          )}
        </div>

        {/* AI Generator Quick Trigger */}
        <button
          onClick={onOpenAIGenerator}
          className="flex items-center space-x-1.5 space-x-reverse bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="hidden sm:inline">{t.nav.aiGenerator}</span>
        </button>

        {/* Language Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => onLanguageChange('ar')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              language === 'ar'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            عربي
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              language === 'en'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            EN
          </button>
        </div>

        {/* Auth / User Control */}
        {user ? (
          <div className="relative group">
            <div className="flex items-center space-x-2 space-x-reverse cursor-pointer bg-slate-50 hover:bg-slate-100 p-1.5 rounded-xl border border-slate-200 transition-colors">
              <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-sm border border-indigo-200">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-right leading-tight pr-1">
                <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                  {user.displayName}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1 space-x-reverse">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
                  <span>{user.isDemo ? t.auth.guestBadge : user.role}</span>
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>

            {/* Dropdown menu */}
            <div className="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 hidden group-hover:block z-50">
              <div className="px-4 py-2 border-b border-slate-100 text-xs">
                <p className="font-bold text-slate-800">{user.displayName}</p>
                <p className="text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full text-right px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center justify-between transition-colors"
              >
                <span>{t.auth.logout}</span>
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            {t.auth.login}
          </button>
        )}
      </div>
    </header>
  );
};
