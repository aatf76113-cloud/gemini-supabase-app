import React, { useState } from 'react';
import { Language } from '../types';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  FileText,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface HelpCenterViewProps {
  language: Language;
}

export const HelpCenterView: React.FC<HelpCenterViewProps> = ({ language }) => {
  const isAr = language === 'ar';
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'getting-started' | 'workflows' | 'ai' | 'security'>('all');
  const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const categories = [
    { id: 'all', labelAr: 'الجميع', labelEn: 'All Guides' },
    { id: 'getting-started', labelAr: 'البداية السريعة', labelEn: 'Getting Started' },
    { id: 'workflows', labelAr: 'محرك الأتمتة', labelEn: 'Workflow Engine' },
    { id: 'ai', labelAr: 'الذكاء الاصطناعي', labelEn: 'Gemini AI' },
    { id: 'security', labelAr: 'الأمان والخزنة', labelEn: 'Security & Vault' }
  ];

  const articles = [
    {
      id: 'art-1',
      category: 'getting-started',
      titleAr: 'كيفية إنشاء أول مسار عمل مؤتمت بالذكاء الاصطناعي خلال 3 دقائق',
      titleEn: 'How to build your first AI-automated workflow in 3 minutes',
      readTimeAr: 'قراءة 3 دقائق',
      readTimeEn: '3 min read'
    },
    {
      id: 'art-2',
      category: 'workflows',
      titleAr: 'دليل استخدام طابور التنفيذ غير المتزامن وسجلات الأخطاء (DLQ Queue)',
      titleEn: 'Mastering Async Execution Queues & Dead Letter Queues (DLQ)',
      readTimeAr: 'قراءة 5 دقائق',
      readTimeEn: '5 min read'
    },
    {
      id: 'art-3',
      category: 'ai',
      titleAr: 'استخدام نماذج Gemini 2.5 Flash وتضمين سياق البيانات في العقد',
      titleEn: 'Utilizing Gemini 2.5 Flash models with dynamic node context',
      readTimeAr: 'قراءة 4 دقائق',
      readTimeEn: '4 min read'
    },
    {
      id: 'art-4',
      category: 'security',
      titleAr: 'تأمين مفاتيح API وتشفير السرائر باستخدام خزنة AES-256 Vault',
      titleEn: 'Securing API keys and encrypting secrets with AES-256 Vault',
      readTimeAr: 'قراءة 6 دقائق',
      readTimeEn: '6 min read'
    }
  ];

  const faqs = [
    {
      id: 'faq-1',
      questionAr: 'كيف يمكنني ربط Webhooks الخارجية بمنصة Zain Automation؟',
      questionEn: 'How do I connect external Webhooks to Zain Automation?',
      answerAr: 'يمكنك اختيار مشغل Webhook Trigger داخل بناء المسارات وتنسيق الرابط الخاص بمساحة عملك مع ترويسة x-zain-signature للتحقق من أمان الحمولة.',
      answerEn: 'Select the Webhook Trigger node in your workflow builder, copy your unique endpoint URL, and send JSON payloads signed with HMAC-SHA256.'
    },
    {
      id: 'faq-2',
      questionAr: 'هل يدعم النظام استدعاء نماذج الذكاء الاصطناعي مع توكنز غير محدودة؟',
      questionEn: 'Does the platform support Gemini AI models with token limits?',
      answerAr: 'نعم، تدعم المنصة نماذج Gemini 2.5 Flash وتوفر حدود توكنز مرنة تبدأ من 500k في الخطة المجانية حتى 25M+ في الخطط المتقدمة.',
      answerEn: 'Yes, Gemini 2.5 Flash is integrated with generous monthly token quotas per plan tier.'
    },
    {
      id: 'faq-3',
      questionAr: 'كيف أسترجع المهام الفاشلة تلقائياً؟',
      questionEn: 'How does the auto-retry and Dead Letter Queue (DLQ) mechanism work?',
      answerAr: 'يقوم المحرك بإعادة محاولة التنفيذ تلقائياً حتى 3 مرات بفواصل زمنية متصاعدة، وفي حال الاستمرار في الفشل يتم نقل المهمة إلى طابور الرسائل الميتة DLQ لإعادة تشغيلها يدوياً.',
      answerEn: 'The engine automatically retries failed workflow executions 3 times with exponential backoff before sending them to the Dead Letter Queue (DLQ) for manual rerun.'
    }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim()) return;
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketSubject('');
      setTicketMessage('');
    }, 2500);
  };

  const filteredArticles = articles.filter(art => {
    const title = isAr ? art.titleAr : art.titleEn;
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || art.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl border border-indigo-900">
        <span className="px-3 py-1 text-xs font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 inline-flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>{isAr ? 'مركز المساعدة وقاعدة المعرفة' : 'Knowledge Base & Support Center'}</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {isAr ? 'كيف يمكننا مساعدتك اليوم؟' : 'How can we help you scale your automation?'}
        </h1>

        {/* Search Input */}
        <div className="max-w-xl mx-auto relative pt-2">
          <Search className="w-5 h-5 text-slate-400 absolute right-4 rtl:left-4 top-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث عن المقالات، الأسئلة الشائعة، ودلائل الاستخدام...' : 'Search docs, workflow guides, API specs...'}
            className="w-full px-5 py-3.5 text-xs text-slate-900 rounded-2xl bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isAr ? cat.labelAr : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.map((art) => (
          <div key={art.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all space-y-2 group cursor-pointer">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold uppercase font-mono">
                {art.category}
              </span>
              <span>{isAr ? art.readTimeAr : art.readTimeEn}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {isAr ? art.titleAr : art.titleEn}
            </h3>
          </div>
        ))}
      </div>

      {/* FAQs Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isAr ? 'الأسئلة الشائعة (Frequently Asked Questions)' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-xs text-slate-500">
              {isAr ? 'إجابات فورية على أكثر الاستفسارات المكررة حول المنصة' : 'Instant answers to common platform queries'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <div key={faq.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 text-right rtl:text-right ltr:text-left text-xs font-bold text-slate-900 flex items-center justify-between gap-3 transition-colors"
                >
                  <span>{isAr ? faq.questionAr : faq.questionEn}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {isExpanded && (
                  <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {isAr ? faq.answerAr : faq.answerEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Support Ticket Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isAr ? 'فتح تذكرة دعم فني مباشرة' : 'Submit Support Ticket'}
            </h2>
            <p className="text-xs text-slate-500">
              {isAr ? 'فريق الهندسة متواجد على مدار الساعة للرد على استفساراتكم' : 'Our engineering team responds within 2 hours'}
            </p>
          </div>
        </div>

        {ticketSubmitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{isAr ? 'تم إنشاء تذكرة الدعم بنجاح! رقم التذكرة: #TKT-89201' : 'Support Ticket Created! Ticket ID: #TKT-89201'}</span>
          </div>
        ) : (
          <form onSubmit={handleTicketSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {isAr ? 'موضوع الاستفسار:' : 'Subject:'}
              </label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder={isAr ? 'مثال: استفسار عن إعدادات الـ Webhooks' : 'e.g., Webhook connection issue'}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {isAr ? 'تفاصيل الرسالة:' : 'Details:'}
              </label>
              <textarea
                required
                rows={4}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder={isAr ? 'اشرح تفاصيل المشكلة أو طلب المساعدة...' : 'Describe the issue or assistance needed...'}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isAr ? 'إرسال التذكرة الآن' : 'Submit Ticket'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
