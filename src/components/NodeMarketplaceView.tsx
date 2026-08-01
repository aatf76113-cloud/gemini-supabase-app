import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Star, 
  Download, 
  Key, 
  Bot, 
  Database, 
  Send, 
  CreditCard, 
  MessageSquare, 
  Clock, 
  Layers,
  Sparkles,
  Check,
  GitFork,
  Mail,
  Zap,
  ArrowRight,
  ExternalLink,
  Tag,
  ShieldCheck,
  Filter,
  Eye,
  X,
  Globe,
  Cpu,
  Code
} from 'lucide-react';
import { Language, Workflow } from '../types';
import { translations } from '../i18n/translations';
import { CATALOG_NODES, CatalogNodeItem } from '../data/nodeCatalog';

interface NodeMarketplaceViewProps {
  language: Language;
  onInstallWorkflow?: (workflow: Workflow) => void;
  onSelectNodeForCanvas?: (nodeKey: string) => void;
}

export const NodeMarketplaceView: React.FC<NodeMarketplaceViewProps> = ({ 
  language,
  onInstallWorkflow
}) => {
  const t = translations[language];
  const isRtl = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'all' | 'node' | 'agent' | 'workflow'>('all');
  const [previewNode, setPreviewNode] = useState<CatalogNodeItem | null>(null);
  const [installSuccessToast, setInstallSuccessToast] = useState<string | null>(null);

  const categories = [
    'All',
    'AI & LLM',
    'Messaging & Chat',
    'Email & Productivity',
    'E-Commerce & Payments',
    'Social Media',
    'Databases & Storage',
    'Developer Tools',
    'Sales & CRM'
  ];

  // Filter 100+ Catalog Nodes
  const filteredNodes = useMemo(() => {
    return CATALOG_NODES.filter(item => {
      const name = isRtl ? item.nameAr : item.name;
      const desc = isRtl ? item.descriptionAr : item.description;
      const matchesSearch = !searchQuery || 
        name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        desc.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.key.includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesType = selectedType === 'all' || (selectedType === 'node' && item.nodeType !== 'ai') || (selectedType === 'agent' && item.nodeType === 'ai');
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [searchQuery, selectedCategory, selectedType, isRtl]);

  const handleInstallNodeAsWorkflow = (item: CatalogNodeItem) => {
    if (!onInstallWorkflow) return;

    const newWf: Workflow = {
      id: `wf-inst-${item.key}-${Date.now().toString().slice(-4)}`,
      name: `${item.name} Integration Pipeline`,
      nameAr: `مسار أتمتة ${item.nameAr}`,
      description: item.description,
      descriptionAr: item.descriptionAr,
      category: 'AI & Data',
      active: true,
      status: 'Active',
      executionsCount: 0,
      successCount: 0,
      createdBy: 'Marketplace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trigger: {
        id: `trig-${Date.now()}`,
        type: 'webhook',
        title: `${item.name} Trigger`,
        titleAr: `مُشغّل ${item.nameAr}`,
        icon: item.icon,
        config: { url: `https://api.zainauto.io/v1/hooks/${item.key}` }
      },
      steps: [
        {
          id: `step-1-${Date.now()}`,
          type: 'gemini_ai',
          title: `Process with ${item.name}`,
          titleAr: `معالجة عبر ${item.nameAr}`,
          icon: item.icon,
          config: { action: item.name, prompt: 'Process incoming payload' }
        }
      ]
    };

    onInstallWorkflow(newWf);
    setInstallSuccessToast(isRtl ? `تم تثبيت عقدة ${item.nameAr} في مساراتك بنجاح!` : `${item.name} node added to your workflows!`);
    setTimeout(() => setInstallSuccessToast(null), 3500);
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Toast Notification */}
      {installSuccessToast && (
        <div className="fixed top-20 right-1/2 translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center space-x-2 space-x-reverse animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-extrabold text-xs">{installSuccessToast}</span>
        </div>
      )}

      {/* Hero Marketplace Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-8 sm:p-12 text-white shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 space-x-reverse bg-indigo-500/20 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-indigo-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{isRtl ? 'أكثر من 100+ عقدة وتكامل احترافي جاهز للربط' : '100+ Production Ready Integration Nodes'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {isRtl ? 'سوق العُقد والتكاملات (Node Marketplace)' : 'Node & Integration Marketplace'}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
            {isRtl
              ? 'تصفح أكبر مكتبة معتمدة للربط مع Gmail, WhatsApp Business, Stripe, OpenAI, Gemini, PostgreSQL, Supabase, Google Sheets, Notion, Shopify وأكثر من 100 خدمة عالمية.'
              : 'Discover certified integrations for Gmail, WhatsApp Business, Stripe, OpenAI, Gemini, PostgreSQL, Supabase, Google Sheets, Notion, Shopify and over 100 global tools.'}
          </p>

          {/* Stats Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-300">
            <div className="flex items-center space-x-1.5 space-x-reverse bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>100+ Active Nodes</span>
            </div>
            <div className="flex items-center space-x-1.5 space-x-reverse bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Secrets Vault Secured</span>
            </div>
            <div className="flex items-center space-x-1.5 space-x-reverse bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Make & n8n Compatible</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'ابحث عن عقدة مثل Gmail, WhatsApp, Stripe, AI...' : 'Search nodes like Gmail, WhatsApp, Stripe, AI...'}
              className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Type Selector Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedType === 'all' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isRtl ? 'الكل (100+)' : 'All Nodes (100+)'}
            </button>
            <button
              onClick={() => setSelectedType('agent')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedType === 'agent' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isRtl ? 'عُقد الذكاء الاصطناعي (AI)' : 'AI Nodes'}
            </button>
            <button
              onClick={() => setSelectedType('node')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedType === 'node' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isRtl ? 'عُقد الخدمات والتطبيقات' : 'App Integrations'}
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 100+ Marketplace Node Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredNodes.map((item) => (
          <div
            key={item.id}
            onClick={() => setPreviewNode(item)}
            className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-500 p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Top Accent Gradient Line */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: item.brandColor }}
            />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pt-1">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: item.brandColor }}
                >
                  <Zap className="w-6 h-6" />
                </div>

                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  {item.category}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                {isRtl ? item.nameAr : item.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                {isRtl ? item.descriptionAr : item.description}
              </p>
            </div>

            {/* Footer Details */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {item.requiredSecretKey ? (
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center space-x-1 space-x-reverse">
                  <Key className="w-3 h-3" />
                  <span>Secret Key</span>
                </span>
              ) : (
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center space-x-1 space-x-reverse">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Ready</span>
                </span>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInstallNodeAsWorkflow(item);
                }}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-extrabold text-xs rounded-xl transition-all flex items-center space-x-1 space-x-reverse"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إضافة' : 'Add'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Node Detail Preview Modal */}
      {previewNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-white flex items-center justify-between" style={{ backgroundColor: previewNode.brandColor || '#1E1B4B' }}>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    {isRtl ? previewNode.nameAr : previewNode.name}
                  </h3>
                  <p className="text-xs text-white/80">{previewNode.category}</p>
                </div>
              </div>

              <button onClick={() => setPreviewNode(null)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div>
                <h4 className="font-extrabold text-slate-900 mb-1">الوصف والتفاصيل:</h4>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {isRtl ? previewNode.descriptionAr : previewNode.description}
                </p>
              </div>

              {previewNode.requiredSecretKey && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <p className="font-extrabold text-amber-900 flex items-center space-x-1.5 space-x-reverse">
                    <Key className="w-4 h-4 text-amber-600" />
                    <span>يتطلب المفتاح الخفي (Secrets Vault):</span>
                  </p>
                  <code className="block p-2 bg-amber-100 rounded-xl text-amber-900 font-mono text-[11px]">
                    {previewNode.requiredSecretKey}
                  </code>
                </div>
              )}

              <div>
                <h4 className="font-extrabold text-slate-900 mb-2">الحقول المدعومة (Config Schema):</h4>
                <div className="space-y-2">
                  {previewNode.configFields.map((f) => (
                    <div key={f.key} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{isRtl ? f.labelAr : f.label}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">key: {f.key}</span>
                      </div>
                      <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
                        {f.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => setPreviewNode(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  handleInstallNodeAsWorkflow(previewNode);
                  setPreviewNode(null);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-100"
              >
                تثبيت وإضافة لمسارات العمل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
