import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Database, 
  Bot, 
  Slack, 
  MessageSquare, 
  Mail, 
  X,
  RefreshCw,
  Send,
  Globe,
  Webhook,
  ShieldCheck,
  Search,
  ExternalLink,
  Plus,
  Lock,
  Zap,
  Star,
  Activity,
  Sliders,
  SlidersHorizontal,
  Check,
  Trash2,
  Edit2,
  Play,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Language, AppConnection, ConnectionAuthType } from '../types';
import { connectionManager, maskSecret, decryptSecret } from '../services/connectionManager';
import { AiProvidersView } from './AiProvidersView';

interface ConnectionsViewProps {
  language: Language;
  connections: AppConnection[];
  onUpdateConnection: (id: string, updates: Partial<AppConnection>) => void;
}

export const ConnectionsView: React.FC<ConnectionsViewProps> = ({
  language,
  connections: propConnections,
  onUpdateConnection
}) => {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'hub' | 'ai_providers'>('hub');
  const [connectionsList, setConnectionsList] = useState<AppConnection[]>(propConnections || []);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [authFilter, setAuthFilter] = useState<'All' | 'OAuth' | 'API Key'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Connected' | 'Disconnected'>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modals & Active Connection State
  const [selectedConn, setSelectedConn] = useState<AppConnection | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<'oauth' | 'api_key'>('oauth');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');
  const [oauthAccountInput, setOauthAccountInput] = useState('');
  const [showKeySecret, setShowKeySecret] = useState(false);
  
  // Validation & Testing State
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [oauthStep, setOauthStep] = useState<'idle' | 'authorizing' | 'success'>('idle');

  // Sync state on load or prop update
  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    const list = await connectionManager.getConnections();
    setConnectionsList(list);
  };

  const categories = [
    'All',
    'AI',
    'Google',
    'Microsoft',
    'Communication',
    'Storage',
    'Database',
    'Social Media',
    'Developer',
    'Payments'
  ];

  const getIcon = (iconName: string, serviceKey?: string) => {
    switch (iconName) {
      case 'Database': return <Database className="w-5 h-5 text-emerald-400" />;
      case 'Bot': return <Bot className="w-5 h-5 text-indigo-400" />;
      case 'Slack': return <Slack className="w-5 h-5 text-sky-400" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-purple-400" />;
      case 'Send': return <Send className="w-5 h-5 text-blue-400" />;
      case 'Globe': return <Globe className="w-5 h-5 text-cyan-400" />;
      case 'Webhook': return <Webhook className="w-5 h-5 text-amber-400" />;
      case 'Mail': return <Mail className="w-5 h-5 text-rose-400" />;
      default: return <Zap className="w-5 h-5 text-indigo-400" />;
    }
  };

  // Filter logic
  const filteredConnections = connectionsList.filter(conn => {
    const matchesCategory = selectedCategory === 'All' || conn.category === selectedCategory;
    
    const matchesAuth = authFilter === 'All' 
      ? true 
      : authFilter === 'OAuth' 
        ? (conn.connectionType === 'oauth' || conn.authType === 'oauth') 
        : (conn.connectionType === 'api_key' || conn.authType === 'api_key');

    const matchesStatus = statusFilter === 'All'
      ? true
      : statusFilter === 'Connected'
        ? (conn.status === 'active' || conn.status === 'connected')
        : (conn.status === 'disconnected');

    const matchesSearch = conn.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          conn.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          conn.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          conn.key.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesAuth && matchesStatus && matchesSearch;
  });

  const favoriteConnections = connectionsList.filter(c => c.isFavorite && (c.status === 'active' || c.status === 'connected'));
  const recentlyConnected = connectionsList.filter(c => c.status === 'active' || c.status === 'connected').slice(0, 4);

  // Toggle favorite star
  const handleToggleFavorite = async (e: React.MouseEvent, conn: AppConnection) => {
    e.stopPropagation();
    const updated = await connectionManager.toggleFavorite(conn.id);
    setConnectionsList(updated);
  };

  // Open modal
  const handleOpenConnect = (conn: AppConnection) => {
    setSelectedConn(conn);
    setSelectedAuthMethod(conn.connectionType === 'oauth' ? 'oauth' : 'api_key');
    setApiKeyInput(conn.apiKey ? decryptSecret(conn.apiKey) : '');
    setCustomNameInput(conn.customName || '');
    setOauthAccountInput(conn.oauthAccount || '');
    setTestResult(null);
    setOauthStep('idle');
    setShowConnectModal(true);
  };

  // Connect via API Key
  const handleSaveApiKey = async () => {
    if (!selectedConn) return;
    setTesting(true);
    setTestResult(null);

    const val = await connectionManager.validateApiKey(selectedConn.service, apiKeyInput);
    
    if (val.valid) {
      const conn = await connectionManager.connect(selectedConn.service, 'api_key', {
        apiKey: apiKeyInput,
        customName: customNameInput || selectedConn.name
      });

      await loadConnections();
      onUpdateConnection(conn.id, conn);

      setTestResult({
        success: true,
        message: isAr ? 'تم حفظ المفتاح والتحقق من صحته بنجاح!' : 'API key validated & saved successfully!',
        latencyMs: val.latencyMs
      });

      setTimeout(() => {
        setShowConnectModal(false);
      }, 1000);
    } else {
      setTestResult({
        success: false,
        message: val.message,
        latencyMs: val.latencyMs
      });
    }
    setTesting(false);
  };

  // Simulate OAuth Login
  const handleStartOAuth = async () => {
    if (!selectedConn) return;
    setOauthStep('authorizing');
    setTestResult(null);

    await new Promise(r => setTimeout(r, 1500)); // Simulate OAuth window delay

    const defaultAccount = oauthAccountInput || `user_${selectedConn.service}@zainauto.io`;
    
    const conn = await connectionManager.connect(selectedConn.service, 'oauth', {
      oauthAccount: defaultAccount,
      accessToken: `oauth_tok_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      refreshToken: `oauth_ref_${Date.now()}`,
      customName: customNameInput || `${selectedConn.name} (${defaultAccount})`
    });

    setOauthStep('success');
    await loadConnections();
    onUpdateConnection(conn.id, conn);

    setTestResult({
      success: true,
      message: isAr ? `تم توثيق الحساب بنجاح (${defaultAccount})` : `OAuth login successful for ${defaultAccount}!`
    });

    setTimeout(() => {
      setShowConnectModal(false);
      setOauthStep('idle');
    }, 1200);
  };

  // Disconnect Connection
  const handleDisconnect = async (connId: string, serviceKey: string) => {
    await connectionManager.disconnect(connId, serviceKey);
    await loadConnections();
    onUpdateConnection(connId, { status: 'disconnected' });
    if (selectedConn?.id === connId) {
      setShowConnectModal(false);
    }
  };

  // Health check
  const handleRunHealthCheck = async (conn: AppConnection) => {
    setTesting(true);
    const health = await connectionManager.connectionHealthCheck(conn.id);
    setTestResult({
      success: health.healthy,
      message: health.message,
      latencyMs: health.latencyMs
    });
    setTesting(false);
    await loadConnections();
  };

  const totalConnected = connectionsList.filter(c => c.status === 'active' || c.status === 'connected').length;

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {isAr ? 'مركز التكاملات والاتصالات (Connections Hub)' : 'Connections Hub'}
            </h1>
            <p className="text-slate-400 text-xs">
              {isAr 
                ? 'إدارة حسابات OAuth ومفاتيح API لجميع الخدمات ومحركات الذكاء الاصطناعي.'
                : 'Manage OAuth logins, API keys, and encrypted credentials for all services.'}
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('hub')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'hub'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isAr ? 'دليل الخدمات الشامل' : 'Integrations Hub'}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
              {connectionsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ai_providers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ai_providers'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>{isAr ? 'مدير الذكاء الاصطناعي (9)' : 'AI Providers (9)'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'ai_providers' ? (
        <AiProvidersView language={language} />
      ) : (
        <>
          {/* Metrics & Favorite Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-medium">{isAr ? 'الخدمات النشطة' : 'Active Connections'}</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">{totalConnected}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{isAr ? 'جاهزة للتنفيذ في مسارات العمل' : 'Ready for workflow triggers'}</div>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-medium">{isAr ? 'طريقة التوثيق الفعالة' : 'Authentication Types'}</div>
                <div className="text-2xl font-bold text-indigo-400 mt-1">OAuth & API Key</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{isAr ? 'تشفير آمن وتحديث تلقائي' : 'Encrypted storage & auto-refresh'}</div>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-medium">{isAr ? 'خدمات بالفيفرت' : 'Starred Favorites'}</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">{favoriteConnections.length}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{isAr ? 'وصول سريع للمفضلات' : 'Pinned integrations'}</div>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isAr ? 'ابحث عن خدمة، تطبيق، أو API...' : 'Search integrations, apps, APIs...'}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Select Filters */}
              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <select
                  value={authFilter}
                  onChange={(e: any) => setAuthFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
                >
                  <option value="All">{isAr ? 'جميع طرق التوثيق' : 'All Auth Methods'}</option>
                  <option value="OAuth">OAuth Login</option>
                  <option value="API Key">API Key / Token</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
                >
                  <option value="All">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
                  <option value="Connected">{isAr ? 'متصل فقط' : 'Connected Only'}</option>
                  <option value="Disconnected">{isAr ? 'غير متصل' : 'Disconnected'}</option>
                </select>
              </div>
            </div>

            {/* Categories Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/80 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConnections.map((conn) => {
              const isConnected = conn.status === 'active' || conn.status === 'connected';

              return (
                <div
                  key={conn.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-indigo-500/50 transition-all">
                          {getIcon(conn.icon, conn.service)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-100 text-sm">
                              {isAr ? conn.nameAr : conn.name}
                            </h3>
                            {conn.isFavorite && (
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{conn.category}</div>
                        </div>
                      </div>

                      {/* Favorite & Status */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleToggleFavorite(e, conn)}
                          className="p-1.5 rounded text-slate-500 hover:text-amber-400 hover:bg-slate-800"
                        >
                          <Star className={`w-4 h-4 ${conn.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {isAr ? conn.descriptionAr || conn.description : conn.description}
                    </p>

                    {/* Authentication Support Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono">
                        {conn.connectionType === 'oauth' ? 'OAuth 2.0' : 'API Key'}
                      </span>
                      {conn.details && (
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-indigo-300 font-mono truncate max-w-[150px]">
                          {conn.details}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                      <span className={`text-xs font-medium ${isConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {isConnected ? (isAr ? 'متصل وجاهز' : 'Active') : (isAr ? 'غير متصل' : 'Disconnected')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <>
                          <button
                            onClick={() => handleOpenConnect(conn)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                          >
                            {isAr ? 'إدارة' : 'Manage'}
                          </button>
                          <button
                            onClick={() => handleDisconnect(conn.id, conn.service)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                            title={isAr ? 'قطع الاتصال' : 'Disconnect'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenConnect(conn)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isAr ? 'ربط الخدمة' : 'Connect'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connect / Configuration Modal */}
          {showConnectModal && selectedConn && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
                {/* Modal Header */}
                <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      {getIcon(selectedConn.icon, selectedConn.service)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        {isAr ? `ربط ${selectedConn.nameAr}` : `Connect ${selectedConn.name}`}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {selectedConn.category} • {selectedConn.service}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowConnectModal(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-5">
                  {/* Auth Method Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">
                      {isAr ? 'طريقة التوثيق والاتصال:' : 'Authentication Method:'}
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setSelectedAuthMethod('oauth')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          selectedAuthMethod === 'oauth'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Method 1: OAuth</span>
                      </button>

                      <button
                        onClick={() => setSelectedAuthMethod('api_key')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          selectedAuthMethod === 'api_key'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Method 2: API Key</span>
                      </button>
                    </div>
                  </div>

                  {/* Method 1: OAuth UI */}
                  {selectedAuthMethod === 'oauth' && (
                    <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-300 leading-relaxed">
                        {isAr
                          ? `سيتم فتح نافذة التوثيق الرسمية لـ ${selectedConn.name} لتخويل الوصول واستلام رمز الوصول (Access Token).`
                          : `Authenticate directly with ${selectedConn.name} OAuth service to authorize workflow permissions.`}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-400">
                          {isAr ? 'البريد الإلكتروني المربوط (اختياري):' : 'Account Identifier / Email:'}
                        </label>
                        <input
                          type="text"
                          value={oauthAccountInput}
                          onChange={(e) => setOauthAccountInput(e.target.value)}
                          placeholder={`user_${selectedConn.service}@company.com`}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <button
                        onClick={handleStartOAuth}
                        disabled={oauthStep === 'authorizing'}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-2.5 rounded-xl text-xs shadow-lg transition-all disabled:opacity-50"
                      >
                        {oauthStep === 'authorizing' ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>{isAr ? 'جاري الاتصال بنوافذ OAuth...' : 'Connecting OAuth...'}</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4" />
                            <span>{isAr ? 'تسجيل الدخول عبر OAuth' : 'Authorize with OAuth'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Method 2: API Key UI */}
                  {selectedAuthMethod === 'api_key' && (
                    <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                          <span>{isAr ? 'مفتاح API / رمز الوصول:' : 'API Key / Access Token:'}</span>
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Encrypted
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type={showKeySecret ? 'text' : 'password'}
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder="sk-••••••••••••••••••••••••"
                            className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-lg pl-3 pr-20 py-2.5 font-mono focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowKeySecret(!showKeySecret)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
                          >
                            {showKeySecret ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-400">
                          {isAr ? 'اسم مخصص للحساب (اختياري):' : 'Custom Alias / Name:'}
                        </label>
                        <input
                          type="text"
                          value={customNameInput}
                          onChange={(e) => setCustomNameInput(e.target.value)}
                          placeholder="Primary Production Key"
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleRunHealthCheck(selectedConn)}
                          disabled={testing}
                          className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>{isAr ? 'اختبار صحة الاتصال' : 'Validate Key Live'}</span>
                        </button>

                        <button
                          onClick={handleSaveApiKey}
                          disabled={testing || !apiKeyInput}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-all disabled:opacity-50"
                        >
                          {testing ? (isAr ? 'جاري الفحص والحفظ...' : 'Saving...') : (isAr ? 'حفظ وتأكيد المفتاح' : 'Save & Connect')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Feedback Test Result */}
                  {testResult && (
                    <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                      testResult.success 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}>
                      {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />}
                      <div>
                        <div>{testResult.message}</div>
                        {testResult.latencyMs !== undefined && testResult.latencyMs > 0 && (
                          <div className="text-[10px] opacity-75 mt-0.5">Latency: {testResult.latencyMs}ms</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>{isAr ? 'مستضاف ومحمي في Firestore' : 'Secured via Firestore'}</span>
                  </div>

                  {(selectedConn.status === 'active' || selectedConn.status === 'connected') && (
                    <button
                      onClick={() => handleDisconnect(selectedConn.id, selectedConn.service)}
                      className="text-rose-400 hover:underline"
                    >
                      {isAr ? 'قطع الاتصال وإلغاء الاعتماد' : 'Disconnect Service'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
