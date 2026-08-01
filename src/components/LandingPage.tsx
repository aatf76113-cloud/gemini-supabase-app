import React from 'react';
import { 
  Sparkles, 
  Zap, 
  Bot, 
  Database, 
  Globe, 
  ArrowLeft, 
  ArrowRight,
  Webhook, 
  Slack, 
  CheckCircle2, 
  Play, 
  Shield, 
  Layers,
  MessageSquare
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface LandingPageProps {
  language: Language;
  onGetStarted: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onGetStarted,
  onExploreDemo
}) => {
  const t = translations[language];
  const isRtl = language === 'ar';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Banner Accent */}
      <div className="bg-indigo-600 text-white py-2 px-4 text-center text-xs font-bold flex items-center justify-center space-x-2 space-x-reverse shadow-inner">
        <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
        <span>{t.landing.badge}</span>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="inline-flex items-center space-x-2 space-x-reverse bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold mb-6 shadow-sm">
          <Zap className="w-4 h-4 text-indigo-600" />
          <span>Zain Automation v2.4 Release</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight max-w-4xl mx-auto mb-6">
          {language === 'ar' ? (
            <>
              أتمت كل أعمالك بين تطبيقك و <span className="text-indigo-600">Cloud Firestore</span> و <span className="text-indigo-600">Gemini AI</span>
            </>
          ) : (
            <>
              Automate Everything Between Your Apps, <span className="text-indigo-600">Cloud Firestore</span> & <span className="text-indigo-600">Gemini AI</span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          {t.landing.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 space-x-reverse text-base"
          >
            <span>{t.landing.getStarted}</span>
            {isRtl ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </button>

          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-800 font-extrabold rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center justify-center space-x-2 space-x-reverse text-base"
          >
            <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            <span>{t.landing.tryDemo}</span>
          </button>
        </div>

        {/* Live Interactive Workflow Mock Canvas Preview */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl relative overflow-hidden text-left max-w-5xl mx-auto" dir="ltr">
          <div className="absolute top-4 left-4 flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
          <div className="absolute top-4 right-6 text-xs text-slate-500 font-mono">
            Zain Workflow Studio - Live Interactive Canvas
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-center relative z-10">
            {/* Step 1 */}
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-lg">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                1. TRIGGER
              </span>
              <div className="flex items-center space-x-3 text-white font-bold text-sm">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <Webhook className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-200 font-bold">HTTP Webhook</p>
                  <p className="text-[10px] text-slate-400 font-normal">Incoming POST payload</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800 border border-indigo-500/50 p-4 rounded-2xl shadow-lg relative">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                2. AI TRANSFORM
              </span>
              <div className="flex items-center space-x-3 text-white font-bold text-sm">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-200 font-bold">Gemini 2.5 Flash</p>
                  <p className="text-[10px] text-amber-300 font-normal">Intent Lead Scoring</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-lg">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                3. PERSISTENCE
              </span>
              <div className="flex items-center space-x-3 text-white font-bold text-sm">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-200 font-bold">Cloud Firestore</p>
                  <p className="text-[10px] text-slate-400 font-normal">/qualified_leads</p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-lg">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">
                4. NOTIFICATION
              </span>
              <div className="flex items-center space-x-3 text-white font-bold text-sm">
                <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
                  <Slack className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-200 font-bold">Slack Alert</p>
                  <p className="text-[10px] text-slate-400 font-normal">#sales-hot-leads</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              {t.landing.featuresTitle}
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              بنية تحتية مرنة تحاكي Zapier و Make مع تكامل أعمق للذكاء الاصطناعي وقواعد البيانات.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">{t.landing.feature1Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.landing.feature1Desc}</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">{t.landing.feature2Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.landing.feature2Desc}</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">{t.landing.feature3Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.landing.feature3Desc}</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-4">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">{t.landing.feature4Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.landing.feature4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-12 bg-slate-900 text-white px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-black text-indigo-400 mb-1">{t.landing.statsWorkflows}</p>
            <p className="text-xs text-slate-400">جاهزة للتخصيص الفوري</p>
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-400 mb-1">{t.landing.statsSuccessRate}</p>
            <p className="text-xs text-slate-400">دقة متناهية ومراقبة حية</p>
          </div>
          <div>
            <p className="text-3xl font-black text-amber-400 mb-1">{t.landing.statsTasks}</p>
            <p className="text-xs text-slate-400">تمت معالجتها بنجاح</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Zain Automation Platform. Built with React & Firebase.</p>
          <div className="flex space-x-4 space-x-reverse text-slate-400">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Firebase Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
