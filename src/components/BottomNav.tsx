import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  GitFork, 
  Bot, 
  ShoppingBag, 
  Plus, 
  Sparkles,
  Menu,
  Wand2,
  Plug,
  Activity,
  CreditCard,
  Settings
} from 'lucide-react';
import { NavTab, Language } from '../types';
import { translations } from '../i18n/translations';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  language: Language;
  onNewWorkflow: () => void;
  onOpenAIGenerator: () => void;
  onToggleSidebar: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  language,
  onNewWorkflow,
  onOpenAIGenerator,
  onToggleSidebar
}) => {
  const t = translations[language];
  const isAr = language === 'ar';
  const [isFabOpen, setIsFabOpen] = useState(false);

  const mainTabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: isAr ? 'الرئيسية' : 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'ai_agents', label: isAr ? 'الوكلاء' : 'Agents', icon: <Bot className="w-5 h-5" /> },
    { id: 'workflows', label: isAr ? 'المسارات' : 'Workflows', icon: <GitFork className="w-5 h-5" /> },
    { id: 'marketplace', label: isAr ? 'السوق' : 'Store', icon: <ShoppingBag className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Quick Action FAB Menu Backdrop */}
      {isFabOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-150"
          onClick={() => setIsFabOpen(false)}
        />
      )}

      {/* Quick Action FAB Expanded Choices */}
      {isFabOpen && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 md:hidden flex flex-col items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <button
            onClick={() => {
              setIsFabOpen(false);
              onOpenAIGenerator();
            }}
            className="flex items-center space-x-2 space-x-reverse bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2.5 rounded-2xl shadow-xl font-bold text-xs border border-indigo-500/30 whitespace-nowrap active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isAr ? 'مولد الأتمتة بالذكاء الاصطناعي' : 'AI Workflow Generator'}</span>
          </button>

          <button
            onClick={() => {
              setIsFabOpen(false);
              onNewWorkflow();
            }}
            className="flex items-center space-x-2 space-x-reverse bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl font-bold text-xs border border-slate-700 whitespace-nowrap active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'إنشاء مسار أتمتة جديد' : 'Create New Workflow'}</span>
          </button>
        </div>
      )}

      {/* Bottom Navigation Bar Container */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1 flex items-center justify-around md:hidden select-none">
        {/* Left Side Items */}
        {mainTabs.slice(0, 2).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setIsFabOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive 
                  ? 'text-indigo-600 font-extrabold bg-indigo-50/80 scale-105' 
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* Center Floating Action (+) Button */}
        <div className="relative -top-3">
          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform active:scale-90 ${
              isFabOpen 
                ? 'bg-rose-600 rotate-45 shadow-rose-200' 
                : 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-indigo-800 shadow-indigo-300 ring-4 ring-white'
            }`}
            aria-label="Create Action"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Right Side Items */}
        {mainTabs.slice(2, 4).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setIsFabOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive 
                  ? 'text-indigo-600 font-extrabold bg-indigo-50/80 scale-105' 
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* Drawer Menu Button */}
        <button
          onClick={() => {
            setIsFabOpen(false);
            onToggleSidebar();
          }}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-slate-500 hover:text-slate-800 font-medium transition-all"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">{isAr ? 'القائمة' : 'Menu'}</span>
        </button>
      </nav>
    </>
  );
};
