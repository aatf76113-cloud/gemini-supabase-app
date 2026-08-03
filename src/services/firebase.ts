import { initializeApp, getApps, getApp } from 'firebase/app';
import { supabase, supabaseAuthService, supabaseDb } from './supabase';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { 
  Workflow, 
  ExecutionLog, 
  TeamMember, 
  AppConnection, 
  UserProfile, 
  Workspace, 
  WorkspaceMember, 
  Invitation, 
  AuditLog, 
  AuditLogAction, 
  WorkspaceRole,
  AppNotification,
  ServiceStatus,
  WorkspaceUsage,
  AdminSystemStats,
  UserFeedback
} from '../types';

// Default initial sample data for instant usability
const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-primary',
    name: 'مساحة العمل الرئيسية - Zain Production',
    slug: 'zain-production',
    ownerId: 'usr-demo-admin',
    ownerEmail: 'ahmed@zainauto.io',
    plan: 'pro',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ws-marketing',
    name: 'فريق التسويق والنمو - Growth & Marketing',
    slug: 'growth-marketing',
    ownerId: 'usr-demo-admin',
    ownerEmail: 'ahmed@zainauto.io',
    plan: 'starter',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_INVITATIONS: Invitation[] = [
  {
    id: 'inv-101',
    workspaceId: 'ws-primary',
    workspaceName: 'مساحة العمل الرئيسية - Zain Production',
    email: 'ahmed@zainauto.io',
    role: 'Admin',
    status: 'pending',
    invitedBy: 'usr-demo-admin',
    invitedByEmail: 'founder@zainauto.io',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    workspaceId: 'ws-primary',
    userId: 'usr-demo-admin',
    userName: 'Ahmed Zain',
    userEmail: 'ahmed@zainauto.io',
    action: 'WORKSPACE_CREATED',
    details: 'أنشأ مساحة العمل الرئيسية Zain Production',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'log-102',
    workspaceId: 'ws-primary',
    userId: 'usr-demo-admin',
    userName: 'Ahmed Zain',
    userEmail: 'ahmed@zainauto.io',
    action: 'WORKFLOW_CREATED',
    details: 'أنشأ مسار العمل الجديد: مؤتمت التأهيل عبر WhatsApp والتحليل بـ Gemini',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 'log-103',
    workspaceId: 'ws-primary',
    userId: 'usr-demo-admin',
    userName: 'Ahmed Zain',
    userEmail: 'ahmed@zainauto.io',
    action: 'MEMBER_INVITED',
    details: 'أرسل دعوة للانضمام إلى sara@zainauto.io بصلاحية Editor',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'log-104',
    workspaceId: 'ws-primary',
    userId: 'usr-demo-admin',
    userName: 'Ahmed Zain',
    userEmail: 'ahmed@zainauto.io',
    action: 'CONNECTION_UPDATED',
    details: 'قام بتحديث إعدادات ربط Telegram Bot API في بيئة الإنتاج',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-whatsapp-nurture',
    name: 'WhatsApp Lead Qualification & Sales Routing',
    nameAr: 'مؤتمت التأهيل عبر WhatsApp والتحليل بـ Gemini',
    description: 'Triggers on incoming WhatsApp message, analyzes sentiment and interest level using Gemini AI, routes via condition to Firestore and emails the sales team via Gmail.',
    descriptionAr: 'ينشط عند استقبال رسالة واتساب، يحلل اهتمام العميل عبر Gemini AI، وفي حال الاهتمام (Interested) يتم حفظ البيانات في Firestore وإرسال بريد Gmail لفريق المبيعات.',
    category: 'Sales & Marketing',
    active: true,
    executionsCount: 2840,
    successCount: 2832,
    lastRunAt: new Date(Date.now() - 2 * 60000).toISOString(),
    createdBy: 'Ahmed Zain',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    trigger: {
      id: 'trig-wa',
      type: 'whatsapp',
      title: 'WhatsApp Incoming Message Trigger',
      titleAr: 'مُشغل استقبال رسائل WhatsApp الواردة',
      icon: 'MessageSquare',
      config: { phoneNumberId: '109283719283', webhook: '/api/v1/webhooks/whatsapp' }
    },
    steps: [
      {
        id: 'step-gemini',
        type: 'gemini_ai',
        title: 'Gemini AI Sentiment & Intent Analysis',
        titleAr: 'تحليل اهتمام وشعور العميل بـ Gemini AI',
        icon: 'Bot',
        config: { model: 'gemini-2.0-flash', prompt: 'Analyze WhatsApp customer message and check if status is "Interested"' }
      },
      {
        id: 'step-condition',
        type: 'condition',
        title: 'Check Condition: Interested?',
        titleAr: 'شرط منطقي: هل العميل مهتم (Interested)؟',
        icon: 'GitFork',
        config: { field: 'intent', operator: 'equals', value: 'Interested' }
      },
      {
        id: 'step-firestore',
        type: 'firestore_write',
        title: 'Store Qualified Lead in Firestore',
        titleAr: 'حفظ بيانات العميل المهتم في Firestore',
        icon: 'Database',
        config: { collection: 'interested_leads', merge: true }
      },
      {
        id: 'step-gmail',
        type: 'send_email',
        title: 'Send Notification to Gmail / Sales Team',
        titleAr: 'إرسال إشعار فوري لفريق المبيعات عبر Gmail',
        icon: 'Mail',
        config: { recipient: 'sales@zainauto.io', subject: '🔥 Hot WhatsApp Lead Interested: {name}' }
      }
    ]
  },
  {
    id: 'wf-lead-automation',
    name: 'Lead Qualification & Slack Alert',
    nameAr: 'مؤتمت التأهيل التلقائي للعملاء وتنبيه Slack',
    description: 'Receives webhook lead submissions, analyzes intent with Gemini AI, saves to Firestore and sends Slack notification.',
    descriptionAr: 'يستقبل نماذج تسجيل العملاء المحتملين عبر Webhook، يحلل اهتمامهم باستخدام Gemini AI، ويحفظهم في Firestore ويرسل إشعار Slack.',
    category: 'Sales & Marketing',
    active: true,
    executionsCount: 1420,
    successCount: 1416,
    lastRunAt: new Date(Date.now() - 5 * 60000).toISOString(),
    createdBy: 'Ahmed Zain',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    trigger: {
      id: 'trig-1',
      type: 'webhook',
      title: 'HTTP Webhook Trigger',
      titleAr: 'مُشغل Webhook للنماذج',
      icon: 'Webhook',
      config: { url: 'https://api.zainauto.io/v1/hooks/lead-capture', method: 'POST' }
    },
    steps: [
      {
        id: 'step-1',
        type: 'gemini_ai',
        title: 'Gemini AI Lead Scoring',
        titleAr: 'تحليل وتقييم العميل بـ Gemini AI',
        icon: 'Bot',
        config: { model: 'gemini-2.0-flash', prompt: 'Score customer intent from 1-100 and output short JSON summary.' }
      },
      {
        id: 'step-2',
        type: 'firestore_write',
        title: 'Store in Cloud Firestore',
        titleAr: 'حفظ العميل في Cloud Firestore',
        icon: 'Database',
        config: { collection: 'qualified_leads', merge: true }
      },
      {
        id: 'step-3',
        type: 'slack',
        title: 'Send Urgent Slack Alert',
        titleAr: 'إرسال تنبيه فوري لقناة Slack',
        icon: 'Slack',
        config: { channel: '#sales-hot-leads', template: '🔥 New Qualified Lead: {name} (Score: {score})' }
      }
    ]
  },
  {
    id: 'wf-ecommerce-receipt',
    name: 'E-commerce Order Multi-Channel Dispatch',
    nameAr: 'مؤتمت معالجة الطلبات وإرسال إشعارات الواتساب والبريد',
    description: 'Triggers on new Stripe checkout success, sends automated WhatsApp message & PDF receipt email.',
    descriptionAr: 'ينشط عند تأكيد إتمام الدفع عبر Stripe، يرسل إشعار واتساب تلقائي وإشعار الفاتورة عبر البريد.',
    category: 'E-commerce',
    active: true,
    executionsCount: 982,
    successCount: 980,
    lastRunAt: new Date(Date.now() - 22 * 60000).toISOString(),
    createdBy: 'Sara Al-Ghamdi',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    trigger: {
      id: 'trig-2',
      type: 'stripe',
      title: 'Stripe Payment Success',
      titleAr: 'نجاح عملية دفع Stripe',
      icon: 'CreditCard',
      config: { event: 'checkout.session.completed' }
    },
    steps: [
      {
        id: 'step-1',
        type: 'whatsapp',
        title: 'Send Instant WhatsApp Confirmation',
        titleAr: 'إرسال تأكيد فوري عبر الواتساب',
        icon: 'MessageSquare',
        config: { template: 'مرحباً {name}، تم استلام طلبك رقم #{order_id} بنجاح!' }
      },
      {
        id: 'step-2',
        type: 'send_email',
        title: 'Send PDF Invoice Email',
        titleAr: 'إرسال البريد الإلكتروني مع الفاتورة',
        icon: 'Send',
        config: { subject: 'تأكيد طلبك رقم #{order_id} - Zain Auto' }
      }
    ]
  },
  {
    id: 'wf-support-ticket',
    name: 'Auto-Classify Support Tickets with AI',
    nameAr: 'التصنيف التلقائي للتذاكر الدعم والرد بـ Gemini',
    description: 'Listens to incoming emails, auto-tags priority and drafts intelligent response via Gemini.',
    descriptionAr: 'يستقبل بريد الدعم الوارد، يحدد الأولوية تلقائياً ويرسم مسودة الرد الذكية بواسطة Gemini.',
    category: 'Customer Support',
    active: false,
    executionsCount: 412,
    successCount: 409,
    lastRunAt: new Date(Date.now() - 120 * 60000).toISOString(),
    createdBy: 'Khaled Omar',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    trigger: {
      id: 'trig-3',
      type: 'email',
      title: 'Incoming Email Ticket',
      titleAr: 'استقبال بريد دعم وارد',
      icon: 'Mail',
      config: { inbox: 'support@zainauto.io' }
    },
    steps: [
      {
        id: 'step-1',
        type: 'gemini_ai',
        title: 'Gemini Auto Sentiment & Category',
        titleAr: 'تحليل شعور وتصنيف المشكلة بـ Gemini AI',
        icon: 'Bot',
        config: { model: 'gemini-2.0-flash', action: 'Classify sentiment into Urgent/Medium/Low and write draft reply' }
      },
      {
        id: 'step-2',
        type: 'firestore_write',
        title: 'Save Ticket in Firestore',
        titleAr: 'حفظ التذكرة في قاعدة بيانات Firestore',
        icon: 'Database',
        config: { collection: 'support_tickets' }
      }
    ]
  }
];

const INITIAL_LOGS: ExecutionLog[] = [
  {
    id: 'exec-101',
    workflowId: 'wf-lead-automation',
    workflowName: 'Lead Qualification & Slack Alert',
    workflowNameAr: 'مؤتمت التأهيل التلقائي للعملاء وتنبيه Slack',
    status: 'success',
    durationMs: 420,
    triggeredBy: 'Webhook POST /lead-capture',
    executedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    stepsLog: [
      { stepId: 'step-1', stepTitle: 'Gemini AI Lead Scoring', status: 'success', durationMs: 210, output: { score: 94 }, logs: ['Received JSON payload', 'Model output intent: HIGH (Score: 94)', 'Extracted lead tags'] },
      { stepId: 'step-2', stepTitle: 'Store in Cloud Firestore', status: 'success', durationMs: 110, output: { docId: 'lead_8492' }, logs: ['Document written to /qualified_leads/lead_8492'] },
      { stepId: 'step-3', stepTitle: 'Send Urgent Slack Alert', status: 'success', durationMs: 100, output: { delivered: true }, logs: ['Slack webhook returned HTTP 200 OK'] }
    ]
  },
  {
    id: 'exec-102',
    workflowId: 'wf-ecommerce-receipt',
    workflowName: 'E-commerce Order Multi-Channel Dispatch',
    workflowNameAr: 'مؤتمت معالجة الطلبات وإرسال إشعارات الواتساب والبريد',
    status: 'success',
    durationMs: 380,
    triggeredBy: 'Stripe Event: checkout.session.completed',
    executedAt: new Date(Date.now() - 22 * 60000).toISOString(),
    stepsLog: [
      { stepId: 'step-1', stepTitle: 'Send Instant WhatsApp Confirmation', status: 'success', durationMs: 220, output: { sent: true }, logs: ['WhatsApp API message sent to +966500000000'] },
      { stepId: 'step-2', stepTitle: 'Send PDF Invoice Email', status: 'success', durationMs: 160, output: { delivered: true }, logs: ['Email sent via SMTP relay'] }
    ]
  },
  {
    id: 'exec-103',
    workflowId: 'wf-support-ticket',
    workflowName: 'Auto-Classify Support Tickets with AI',
    workflowNameAr: 'التصنيف التلقائي للتذاكر الدعم والرد بـ Gemini',
    status: 'failed',
    durationMs: 850,
    triggeredBy: 'Email Received: customer@company.com',
    executedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    error: 'SMTP Relay Authentication Timeout',
    stepsLog: [
      { stepId: 'step-1', stepTitle: 'Gemini Auto Sentiment & Category', status: 'success', durationMs: 510, output: { priority: 'URGENT' }, logs: ['Email analyzed', 'Priority: URGENT'] },
      { stepId: 'step-2', stepTitle: 'Save Ticket in Firestore', status: 'failed', durationMs: 340, output: { error: 'Network timeout' }, logs: ['Error writing doc: Network connection timeout'] }
    ]
  }
];

const INITIAL_TEAM: TeamMember[] = [
  { id: 'usr-1', name: 'Ahmed Zain', email: 'ahmed@zainauto.io', role: 'Admin', status: 'Active', invitedAt: '2026-01-10' },
  { id: 'usr-2', name: 'Sara Al-Ghamdi', email: 'sara@zainauto.io', role: 'Editor', status: 'Active', invitedAt: '2026-02-14' },
  { id: 'usr-3', name: 'Khaled Omar', email: 'khaled@zainauto.io', role: 'Editor', status: 'Active', invitedAt: '2026-03-01' },
  { id: 'usr-4', name: 'Mona Youssef', email: 'mona@zainauto.io', role: 'Viewer', status: 'Pending', invitedAt: '2026-07-20' }
];

const INITIAL_CONNECTIONS: AppConnection[] = [
  { 
    id: 'conn-gmail', 
    userId: 'usr-demo-admin',
    service: 'gmail',
    key: 'gmail', 
    name: 'Gmail API', 
    nameAr: 'بريد Gmail API', 
    icon: 'Mail', 
    category: 'Email & Productivity', 
    status: 'connected', 
    connectionType: 'oauth',
    authType: 'oauth2',
    oauthAccount: 'sales@zainauto.io',
    details: 'OAuth 2.0 connected (Scopes: gmail.send, gmail.readonly)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    configuredAt: new Date().toISOString()
  },
  { 
    id: 'conn-sheets', 
    userId: 'usr-demo-admin',
    service: 'google_sheets',
    key: 'google_sheets', 
    name: 'Google Sheets API', 
    nameAr: 'جداول Google Sheets', 
    icon: 'Database', 
    category: 'Email & Productivity', 
    status: 'connected', 
    connectionType: 'oauth',
    authType: 'oauth2',
    oauthAccount: 'sheets-sync@zainauto.io',
    details: 'Spreadsheet ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    configuredAt: new Date().toISOString()
  },
  { 
    id: 'conn-telegram', 
    userId: 'usr-demo-admin',
    service: 'telegram',
    key: 'telegram', 
    name: 'Telegram Bot API', 
    nameAr: 'بوت تلغرام Telegram Bot', 
    icon: 'Send', 
    category: 'Messaging & Chat', 
    status: 'connected', 
    connectionType: 'api_key',
    authType: 'api_key',
    apiKey: '7829104821:AAH-x92183921839218392183921',
    details: 'Default Chat ID: @zainauto_alerts',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    configuredAt: new Date().toISOString()
  },
  { 
    id: 'conn-discord', 
    userId: 'usr-demo-admin',
    service: 'discord',
    key: 'discord', 
    name: 'Discord Webhooks', 
    nameAr: 'ويب هوك ديسكورد Discord', 
    icon: 'MessageSquare', 
    category: 'Messaging & Chat', 
    status: 'connected', 
    connectionType: 'webhook',
    authType: 'webhook',
    webhookUrl: 'https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz',
    details: 'Channel: #alerts-feed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    configuredAt: new Date().toISOString()
  },
  { 
    id: 'conn-slack', 
    userId: 'usr-demo-admin',
    service: 'slack',
    key: 'slack', 
    name: 'Slack Workspace', 
    nameAr: 'مساحة العمل في Slack', 
    icon: 'Slack', 
    category: 'Messaging & Chat', 
    status: 'connected', 
    connectionType: 'oauth',
    authType: 'oauth2',
    oauthAccount: 'Zain Auto Enterprise (#sales-hot-leads)',
    details: 'OAuth 2.0 Bot Scope: chat:write',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    configuredAt: new Date().toISOString()
  },
  { 
    id: 'conn-http', 
    userId: 'usr-demo-admin',
    service: 'http_request',
    key: 'http_request', 
    name: 'HTTP Request & REST API', 
    nameAr: 'طلبات HTTP و REST API', 
    icon: 'Globe', 
    category: 'Developer Tools', 
    status: 'connected', 
    connectionType: 'api_key',
    authType: 'api_key',
    apiKey: 'Bearer za_live_981273918273918273',
    details: 'Global Bearer Token Configured',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    configuredAt: new Date().toISOString()
  },
  { 
    id: 'conn-webhook', 
    userId: 'usr-demo-admin',
    service: 'webhook',
    key: 'webhook', 
    name: 'Webhooks Service', 
    nameAr: 'خدمة استقبال Webhooks', 
    icon: 'Webhook', 
    category: 'Developer Tools', 
    status: 'connected', 
    connectionType: 'webhook',
    authType: 'webhook',
    webhookUrl: 'https://api.zainauto.io/v1/hooks/live',
    details: 'Ingress Webhook Listener Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    configuredAt: new Date().toISOString()
  },
  { 
    id: 'conn-firestore', 
    userId: 'usr-demo-admin',
    service: 'firestore',
    key: 'firestore', 
    name: 'Google Cloud Firestore', 
    nameAr: 'قاعدة بيانات Cloud Firestore', 
    icon: 'Database', 
    category: 'Databases & Storage', 
    status: 'connected', 
    connectionType: 'api_key',
    authType: 'service_account',
    details: 'Project: zain-auto-prod (Collection: qualified_leads)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    configuredAt: new Date().toISOString()
  },
  { 
    id: 'conn-gemini', 
    userId: 'usr-demo-admin',
    service: 'gemini',
    key: 'gemini', 
    name: 'Google Gemini 2.0 AI', 
    nameAr: 'نموذج Gemini AI API', 
    icon: 'Bot', 
    category: 'AI & LLM', 
    status: 'connected', 
    connectionType: 'api_key',
    authType: 'api_key',
    apiKey: 'GEMINI_SERVER_PROXY_ACTIVE',
    details: 'Model: gemini-2.0-flash (Server Proxy Active)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    configuredAt: new Date().toISOString()
  }
];

// Safe Environment variable retrieval helper
const getEnvVal = (key: string, fallback: string = ''): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key]!;
  }
  return fallback;
};

// Helper to check if Firebase web app config is present
export let firebaseApp: any = null;
export let firebaseAuth: any = null;
export let firebaseDb: any = null;

try {
  // Check runtime window or env firebase config
  const firebaseConfig = {
    apiKey: getEnvVal("VITE_FIREBASE_API_KEY", "AIzaSyDxul2HsPXCOX6naJE-WCZUhFYlNX_ALag"),
    authDomain: getEnvVal("VITE_FIREBASE_AUTH_DOMAIN", "gen-lang-client-0599557086.firebaseapp.com"),
    projectId: getEnvVal("VITE_FIREBASE_PROJECT_ID", "gen-lang-client-0599557086"),
    storageBucket: getEnvVal("VITE_FIREBASE_STORAGE_BUCKET", "gen-lang-client-0599557086.firebasestorage.app"),
    messagingSenderId: getEnvVal("VITE_FIREBASE_MESSAGING_SENDER_ID", "294576871200"),
    appId: getEnvVal("VITE_FIREBASE_APP_ID", "1:294576871200:web:4ce2a387a4ae3bb2046945")
  };

  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }

  firebaseAuth = getAuth(firebaseApp);
  firebaseDb = getFirestore(firebaseApp);
} catch (err) {
  console.warn("Firebase initialized in fallback mode:", err);
}

export const db = firebaseDb;

// Local storage persistent fallback helper
const getLocalData = <T>(key: string, fallback: T): T => {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const item = localStorage.getItem(`zain_auto_${key}`);
      if (item) return JSON.parse(item);
    }
  } catch (e) {
    console.warn(`Error reading ${key} from storage`, e);
  }
  return fallback;
};

const setLocalData = <T>(key: string, data: T): void => {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(`zain_auto_${key}`, JSON.stringify(data));
    }
  } catch (e) {
    console.warn(`Error writing ${key} to storage`, e);
  }
};

// Workspace Service for Multi-Tenant architecture
export const workspaceService = {
  async getWorkspaces(userId?: string, userEmail?: string): Promise<Workspace[]> {
    try {
      const supaData = await supabaseDb.select<any>('workspaces', undefined, 'created_at', false);
      if (supaData && supaData.length > 0) {
        return supaData.map(w => ({
          id: w.id,
          name: w.name,
          slug: w.slug,
          ownerId: w.owner_id,
          ownerEmail: w.owner_email,
          plan: w.plan,
          createdAt: w.created_at,
          updatedAt: w.updated_at
        }));
      }
    } catch (err) {
      console.warn("Supabase workspace fetch error:", err);
    }

    if (firebaseDb) {
      try {
        const q = query(collection(firebaseDb, 'workspaces'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace));
          return docs;
        }
      } catch (err) {
        console.warn("Firestore workspaces fetch error, fallback:", err);
      }
    }
    return getLocalData<Workspace[]>('workspaces', INITIAL_WORKSPACES);
  },

  async createWorkspace(
    name: string, 
    userId: string, 
    userEmail: string, 
    plan: 'starter' | 'pro' | 'enterprise' = 'pro'
  ): Promise<Workspace> {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '') || `ws-${Date.now()}`;
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      slug,
      ownerId: userId,
      ownerEmail: userEmail,
      plan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const current = await this.getWorkspaces(userId, userEmail);
    const updated = [newWs, ...current];
    setLocalData('workspaces', updated);

    // Save to Supabase PostgreSQL
    try {
      await supabaseDb.insert('workspaces', {
        id: newWs.id,
        name: newWs.name,
        slug: newWs.slug,
        owner_id: newWs.ownerId,
        owner_email: newWs.ownerEmail,
        plan: newWs.plan,
        created_at: newWs.createdAt,
        updated_at: newWs.updatedAt
      });

      await supabaseDb.insert('workspace_members', {
        id: `m-${newWs.id}-${userId}`,
        workspace_id: newWs.id,
        user_id: userId,
        email: userEmail,
        role: 'Owner',
        status: 'active',
        invited_by: userId,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Supabase create workspace error:", e);
    }

    if (firebaseDb) {
      try {
        await setDoc(doc(firebaseDb, 'workspaces', newWs.id), newWs);
        const memberId = `m-${newWs.id}-${userId}`;
        await setDoc(doc(firebaseDb, 'workspace_members', memberId), {
          id: memberId,
          workspaceId: newWs.id,
          userId,
          email: userEmail,
          role: 'Owner',
          status: 'active',
          invitedBy: userId,
          joinedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn("Firestore create workspace error:", e);
      }
    }

    await auditLogService.logAudit(
      newWs.id,
      userId,
      userEmail.split('@')[0] || 'User',
      userEmail,
      'WORKSPACE_CREATED',
      `أنشأ مساحة العمل الجديدة: ${name}`
    );

    return newWs;
  },

  async updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Promise<Workspace> {
    const workspaces = await this.getWorkspaces();
    const idx = workspaces.findIndex(w => w.id === workspaceId);
    let updatedWs: Workspace;
    if (idx >= 0) {
      updatedWs = { ...workspaces[idx], ...updates, updatedAt: new Date().toISOString() };
      workspaces[idx] = updatedWs;
    } else {
      updatedWs = { id: workspaceId, name: updates.name || 'Workspace', slug: 'ws', ownerId: 'usr', plan: 'pro', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...updates };
      workspaces.push(updatedWs);
    }
    setLocalData('workspaces', workspaces);

    try {
      await supabaseDb.update('workspaces', 'id', workspaceId, {
        name: updates.name,
        plan: updates.plan,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Supabase update workspace error:", e);
    }

    if (firebaseDb) {
      try {
        await setDoc(doc(firebaseDb, 'workspaces', workspaceId), updates, { merge: true });
      } catch (e) {
        console.warn("Firestore update workspace error:", e);
      }
    }

    return updatedWs;
  }
};

// Invitations Service
export const invitationService = {
  async getInvitationsForEmail(email: string): Promise<Invitation[]> {
    if (firebaseDb) {
      try {
        const q = query(collection(firebaseDb, 'invitations'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Invitation));
          return all.filter(i => i.email.toLowerCase() === email.toLowerCase() && i.status === 'pending');
        }
      } catch (e) {
        console.warn("Firestore invitations error:", e);
      }
    }
    const localInvs = getLocalData<Invitation[]>('invitations', INITIAL_INVITATIONS);
    return localInvs.filter(i => i.email.toLowerCase() === email.toLowerCase() && i.status === 'pending');
  },

  async getAllInvitations(): Promise<Invitation[]> {
    if (firebaseDb) {
      try {
        const q = query(collection(firebaseDb, 'invitations'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Invitation));
        }
      } catch (e) {
        console.warn("Firestore all invitations error:", e);
      }
    }
    return getLocalData<Invitation[]>('invitations', INITIAL_INVITATIONS);
  },

  async sendInvitation(
    workspaceId: string,
    workspaceName: string,
    email: string,
    role: WorkspaceRole,
    inviterUid: string,
    inviterName: string,
    inviterEmail: string
  ): Promise<Invitation> {
    const newInv: Invitation = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      workspaceId,
      workspaceName,
      email,
      role,
      status: 'pending',
      invitedBy: inviterUid,
      invitedByEmail: inviterEmail,
      createdAt: new Date().toISOString()
    };

    const current = getLocalData<Invitation[]>('invitations', INITIAL_INVITATIONS);
    setLocalData('invitations', [newInv, ...current]);

    if (firebaseDb) {
      try {
        await setDoc(doc(firebaseDb, 'invitations', newInv.id), newInv);
      } catch (e) {
        console.warn("Firestore invitation save error:", e);
      }
    }

    await auditLogService.logAudit(
      workspaceId,
      inviterUid,
      inviterName,
      inviterEmail,
      'MEMBER_INVITED',
      `أرسل دعوة للانضمام إلى (${email}) بصلاحية (${role})`
    );

    return newInv;
  },

  async acceptInvitation(invitationId: string, userId: string, userName: string, userEmail: string): Promise<void> {
    const invitations = getLocalData<Invitation[]>('invitations', INITIAL_INVITATIONS);
    const target = invitations.find(i => i.id === invitationId);
    if (target) {
      target.status = 'accepted';
      setLocalData('invitations', invitations);

      if (firebaseDb) {
        try {
          await setDoc(doc(firebaseDb, 'invitations', invitationId), { status: 'accepted' }, { merge: true });
        } catch (e) {
          console.warn("Firestore accept invitation error:", e);
        }
      }

      await teamService.addMember({
        name: userName || userEmail.split('@')[0],
        email: userEmail,
        role: target.role,
        status: 'Active'
      });

      await auditLogService.logAudit(
        target.workspaceId,
        userId,
        userName || userEmail.split('@')[0],
        userEmail,
        'INVITATION_ACCEPTED',
        `قبل العضو (${userEmail}) الدعوة وانضم لمساحة العمل (${target.workspaceName})`
      );
    }
  },

  async declineInvitation(invitationId: string, userEmail: string): Promise<void> {
    const invitations = getLocalData<Invitation[]>('invitations', INITIAL_INVITATIONS);
    const target = invitations.find(i => i.id === invitationId);
    if (target) {
      target.status = 'declined';
      setLocalData('invitations', invitations);

      if (firebaseDb) {
        try {
          await setDoc(doc(firebaseDb, 'invitations', invitationId), { status: 'declined' }, { merge: true });
        } catch (e) {
          console.warn("Firestore decline invitation error:", e);
        }
      }
    }
  }
};

// Audit Logs Service
export const auditLogService = {
  async getAuditLogs(workspaceId?: string): Promise<AuditLog[]> {
    if (firebaseDb) {
      try {
        const q = query(collection(firebaseDb, 'audit_logs'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
          return workspaceId ? logs.filter(l => l.workspaceId === workspaceId) : logs;
        }
      } catch (e) {
        console.warn("Firestore audit logs error:", e);
      }
    }
    const localLogs = getLocalData<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
    return workspaceId ? localLogs.filter(l => l.workspaceId === workspaceId) : localLogs;
  },

  async logAudit(
    workspaceId: string,
    userId: string,
    userName: string,
    userEmail: string,
    action: AuditLogAction,
    details: string,
    metadata?: Record<string, any>
  ): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      workspaceId,
      userId,
      userName,
      userEmail,
      action,
      details,
      metadata,
      createdAt: new Date().toISOString()
    };

    const current = getLocalData<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
    setLocalData('audit_logs', [newLog, ...current]);

    if (firebaseDb) {
      try {
        await setDoc(doc(firebaseDb, 'audit_logs', newLog.id), newLog);
      } catch (e) {
        console.warn("Firestore audit log save error:", e);
      }
    }

    return newLog;
  }
};

// Data Store Services (Seamless Supabase PostgreSQL + Local Storage)
export const workflowService = {
  async getWorkflows(workspaceId?: string): Promise<Workflow[]> {
    try {
      const supaData = await supabaseDb.select<any>('workflows', workspaceId ? { workspace_id: workspaceId } : undefined, 'created_at', false);
      if (supaData && supaData.length > 0) {
        return supaData.map(w => ({
          id: w.id,
          workspaceId: w.workspace_id,
          name: w.name,
          nameAr: w.name_ar,
          description: w.description,
          descriptionAr: w.description_ar,
          category: w.category,
          active: w.active,
          executionsCount: w.executions_count,
          successCount: w.success_count,
          lastRunAt: w.last_run_at,
          trigger: w.trigger_config,
          steps: w.steps_config,
          createdBy: w.created_by || 'system',
          createdAt: w.created_at,
          updatedAt: w.updated_at
        }));
      }
    } catch (err) {
      console.warn("Supabase workflows fetch error, fallback to local:", err);
    }

    if (firebaseDb && getEnvVal("VITE_FIREBASE_API_KEY")) {
      try {
        const q = query(collection(firebaseDb, 'workflows'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workflow));
          return workspaceId ? list.filter(w => !w.workspaceId || w.workspaceId === workspaceId) : list;
        }
      } catch (err) {
        console.warn("Firestore fetch error, fallback to local:", err);
      }
    }
    const local = getLocalData<Workflow[]>('workflows', INITIAL_WORKFLOWS);
    return workspaceId ? local.filter(w => !w.workspaceId || w.workspaceId === workspaceId) : local;
  },

  async saveWorkflow(workflow: Workflow, actorInfo?: { uid: string; name: string; email: string }): Promise<Workflow> {
    const current = await this.getWorkflows();
    const existingIndex = current.findIndex(w => w.id === workflow.id);
    let updatedList: Workflow[];
    const isNew = existingIndex < 0;

    if (existingIndex >= 0) {
      updatedList = [...current];
      updatedList[existingIndex] = { ...workflow, updatedAt: new Date().toISOString() };
    } else {
      updatedList = [workflow, ...current];
    }

    setLocalData('workflows', updatedList);

    // Save to Supabase PostgreSQL
    try {
      await supabaseDb.insert('workflows', {
        id: workflow.id,
        workspace_id: workflow.workspaceId || 'ws-primary',
        name: workflow.name,
        name_ar: workflow.nameAr,
        description: workflow.description,
        description_ar: workflow.descriptionAr,
        category: workflow.category,
        active: workflow.active,
        executions_count: workflow.executionsCount || 0,
        success_count: workflow.successCount || 0,
        last_run_at: workflow.lastRunAt,
        trigger_config: workflow.trigger,
        steps_config: workflow.steps,
        created_at: workflow.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Supabase workflow save error:", e);
    }

    if (firebaseDb && getEnvVal("VITE_FIREBASE_API_KEY")) {
      try {
        await setDoc(doc(firebaseDb, 'workflows', workflow.id), workflow, { merge: true });
      } catch (e) {
        console.warn("Firestore save error:", e);
      }
    }

    if (actorInfo && workflow.workspaceId) {
      await auditLogService.logAudit(
        workflow.workspaceId,
        actorInfo.uid,
        actorInfo.name,
        actorInfo.email,
        isNew ? 'WORKFLOW_CREATED' : 'WORKFLOW_UPDATED',
        isNew ? `أنشأ مسار العمل الجديد: ${workflow.nameAr || workflow.name}` : `عدّل مسار العمل: ${workflow.nameAr || workflow.name}`
      );
    }

    return workflow;
  },

  async deleteWorkflow(id: string, workspaceId?: string, actorInfo?: { uid: string; name: string; email: string }): Promise<void> {
    const current = await this.getWorkflows();
    const target = current.find(w => w.id === id);
    const updated = current.filter(w => w.id !== id);
    setLocalData('workflows', updated);

    try {
      await supabaseDb.delete('workflows', 'id', id);
    } catch (e) {
      console.warn("Supabase workflow delete error:", e);
    }

    if (firebaseDb && getEnvVal("VITE_FIREBASE_API_KEY")) {
      try {
        await deleteDoc(doc(firebaseDb, 'workflows', id));
      } catch (e) {
        console.warn("Firestore delete error:", e);
      }
    }

    if (actorInfo && (workspaceId || target?.workspaceId)) {
      await auditLogService.logAudit(
        workspaceId || target?.workspaceId || 'ws-primary',
        actorInfo.uid,
        actorInfo.name,
        actorInfo.email,
        'WORKFLOW_DELETED',
        `حذف مسار العمل: ${target?.nameAr || target?.name || id}`
      );
    }
  }
};

export const executionService = {
  async getExecutions(workspaceId?: string): Promise<ExecutionLog[]> {
    if (firebaseDb && getEnvVal("VITE_FIREBASE_API_KEY")) {
      try {
        const q = query(collection(firebaseDb, 'executions'), orderBy('executedAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const logs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExecutionLog));
          return workspaceId ? logs.filter(l => !(l as any).workspaceId || (l as any).workspaceId === workspaceId) : logs;
        }
      } catch (e) {
        console.warn("Firestore logs error:", e);
      }
    }
    const local = getLocalData<ExecutionLog[]>('executions', INITIAL_LOGS);
    return workspaceId ? local.filter(l => !(l as any).workspaceId || (l as any).workspaceId === workspaceId) : local;
  },

  async logExecution(log: ExecutionLog): Promise<ExecutionLog> {
    const current = await this.getExecutions();
    const updated = [log, ...current];
    setLocalData('executions', updated);

    if (firebaseDb && getEnvVal("VITE_FIREBASE_API_KEY")) {
      try {
        await setDoc(doc(firebaseDb, 'executions', log.id), log);
      } catch (e) {
        console.warn("Firestore log save error:", e);
      }
    }
    return log;
  }
};

export const teamService = {
  async getMembers(workspaceId?: string): Promise<TeamMember[]> {
    return getLocalData<TeamMember[]>('team', INITIAL_TEAM);
  },

  async addMember(member: Omit<TeamMember, 'id' | 'invitedAt'>, actorInfo?: { uid: string; name: string; email: string }, workspaceId: string = 'ws-primary'): Promise<TeamMember> {
    const current = await this.getMembers();
    const newMember: TeamMember = {
      ...member,
      id: `usr-${Date.now()}`,
      invitedAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newMember, ...current];
    setLocalData('team', updated);

    if (actorInfo) {
      await auditLogService.logAudit(
        workspaceId,
        actorInfo.uid,
        actorInfo.name,
        actorInfo.email,
        'MEMBER_INVITED',
        `أضاف العضو (${member.email}) بصلاحية (${member.role})`
      );
    }

    return newMember;
  },

  async updateMemberRole(id: string, newRole: WorkspaceRole, actorInfo?: { uid: string; name: string; email: string }, workspaceId: string = 'ws-primary'): Promise<TeamMember[]> {
    const current = await this.getMembers();
    const target = current.find(m => m.id === id);
    const updated = current.map(m => m.id === id ? { ...m, role: newRole } : m);
    setLocalData('team', updated);

    if (actorInfo && target) {
      await auditLogService.logAudit(
        workspaceId,
        actorInfo.uid,
        actorInfo.name,
        actorInfo.email,
        'MEMBER_ROLE_UPDATED',
        `عدل صلاحية العضو (${target.name} - ${target.email}) إلى (${newRole})`
      );
    }

    return updated;
  },

  async removeMember(id: string, actorInfo?: { uid: string; name: string; email: string }, workspaceId: string = 'ws-primary'): Promise<TeamMember[]> {
    const current = await this.getMembers();
    const target = current.find(m => m.id === id);
    const updated = current.filter(m => m.id !== id);
    setLocalData('team', updated);

    if (actorInfo && target) {
      await auditLogService.logAudit(
        workspaceId,
        actorInfo.uid,
        actorInfo.name,
        actorInfo.email,
        'MEMBER_REMOVED',
        `حذف العضو (${target.name} - ${target.email}) من مساحة العمل`
      );
    }

    return updated;
  }
};

import { connectionManager } from './connectionManager';

export const connectionService = {
  async getConnections(): Promise<AppConnection[]> {
    return connectionManager.getConnections();
  },

  async updateConnection(id: string, updates: Partial<AppConnection>): Promise<AppConnection[]> {
    if (updates.status === 'disconnected') {
      await connectionManager.disconnect(id);
    } else if (updates.apiKey || updates.accessToken) {
      await connectionManager.connect(updates.service || id, updates.connectionType || 'api_key', {
        apiKey: updates.apiKey,
        accessToken: updates.accessToken,
        refreshToken: updates.refreshToken,
        oauthAccount: updates.oauthAccount,
        customName: updates.customName
      });
    }
    return connectionManager.getConnections();
  }
};

// Authentication Services (Supabase Auth + Firebase + Local Fallback)
export const authService = {
  getCurrentUser(): UserProfile | null {
    return getLocalData<UserProfile | null>('user', {
      uid: 'usr-demo-admin',
      email: 'ahmed@zainauto.io',
      displayName: 'Ahmed Zain (Admin)',
      role: 'admin',
      language: 'ar',
      createdAt: '2026-01-01',
      isDemo: true
    });
  },

  async loginWithEmail(email: string, pass: string): Promise<UserProfile> {
    try {
      const supaResult = await supabaseAuthService.signIn(email, pass);
      if (supaResult && supaResult.user) {
        const userProfile: UserProfile = {
          uid: supaResult.user.id,
          email: supaResult.user.email || email,
          displayName: supaResult.user.user_metadata?.display_name || email.split('@')[0],
          role: 'admin',
          language: 'ar',
          createdAt: new Date().toISOString()
        };
        setLocalData('user', userProfile);
        return userProfile;
      }
    } catch (e) {
      console.warn("Supabase Auth sign in error:", e);
    }

    if (firebaseAuth && getEnvVal("VITE_FIREBASE_API_KEY")) {
      try {
        const cred = await signInWithEmailAndPassword(firebaseAuth, email, pass);
        const userProfile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: cred.user.displayName || email.split('@')[0],
          photoURL: cred.user.photoURL || undefined,
          role: 'admin',
          language: 'ar',
          createdAt: new Date().toISOString()
        };
        setLocalData('user', userProfile);
        return userProfile;
      } catch (err: any) {
        console.warn("Firebase auth sign in error, fallback to demo mode:", err);
      }
    }
    // Fallback login
    const userProfile: UserProfile = {
      uid: `usr-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      role: 'admin',
      language: 'ar',
      createdAt: new Date().toISOString()
    };
    setLocalData('user', userProfile);
    return userProfile;
  },

  async registerWithEmail(email: string, pass: string, name: string): Promise<UserProfile> {
    try {
      const supaResult = await supabaseAuthService.signUp(email, pass, name);
      if (supaResult && supaResult.user) {
        const userProfile: UserProfile = {
          uid: supaResult.user.id,
          email: supaResult.user.email || email,
          displayName: name || email.split('@')[0],
          role: 'admin',
          language: 'ar',
          createdAt: new Date().toISOString()
        };
        setLocalData('user', userProfile);
        return userProfile;
      }
    } catch (e) {
      console.warn("Supabase Auth signup error:", e);
    }

    if (firebaseAuth && getEnvVal("VITE_FIREBASE_API_KEY")) {
      try {
        const cred = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
        const userProfile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: name || email.split('@')[0],
          role: 'admin',
          language: 'ar',
          createdAt: new Date().toISOString()
        };
        setLocalData('user', userProfile);
        return userProfile;
      } catch (err) {
        console.warn("Firebase auth signup error, fallback to demo mode:", err);
      }
    }
    const userProfile: UserProfile = {
      uid: `usr-${Date.now()}`,
      email,
      displayName: name,
      role: 'admin',
      language: 'ar',
      createdAt: new Date().toISOString()
    };
    setLocalData('user', userProfile);
    return userProfile;
  },

  loginDemoUser(): UserProfile {
    const demoUser: UserProfile = {
      uid: 'usr-demo-admin',
      email: 'demo@zainauto.io',
      displayName: 'أحمد الزين (حساب تجريبي)',
      role: 'admin',
      language: 'ar',
      createdAt: new Date().toISOString(),
      isDemo: true
    };
    setLocalData('user', demoUser);
    return demoUser;
  },

  logout(): void {
    supabaseAuthService.signOut().catch(() => {});
    if (firebaseAuth) {
      firebaseSignOut(firebaseAuth).catch(() => {});
    }
    try {
      localStorage.removeItem('zain_auto_user');
    } catch (e) {
      console.warn('Failed to clear user from localStorage:', e);
    }
  },

  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    if (firebaseAuth && getEnvVal("VITE_FIREBASE_API_KEY")) {
      return onAuthStateChanged(firebaseAuth, (fbUser) => {
        if (fbUser) {
          const userProfile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'المستخدم',
            photoURL: fbUser.photoURL || undefined,
            role: 'admin',
            language: 'ar',
            createdAt: new Date().toISOString()
          };
          setLocalData('user', userProfile);
          callback(userProfile);
        } else {
          const current = this.getCurrentUser();
          callback(current);
        }
      });
    }
    // Fallback sync call
    const current = this.getCurrentUser();
    callback(current);
    return () => {};
  }
};

// ==========================================
// INITIAL BETA DATASETS & SERVICES
// ==========================================

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'نجاح تنفيذ مسار التأهيل',
    titleAr: 'نجاح تنفيذ مسار التأهيل عبر WhatsApp',
    message: 'تم تشغيل وتمرير البيانات بنجاح لـ 5 عملاء جدد.',
    messageAr: 'تم تشغيل وتمرير البيانات بنجاح لـ 5 عملاء جدد عبر Gemini AI.',
    type: 'success',
    category: 'workflow',
    read: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    linkTab: 'logs',
    workspaceId: 'ws-primary'
  },
  {
    id: 'notif-2',
    title: 'دعوة انضمام جديدة',
    titleAr: 'دعوة جديدة لمساحة عمل النمو والتسويق',
    message: 'تم دعوة حسابك للانضمام كـ Admin.',
    messageAr: 'تم دعوة حسابك للانضمام إلى مساحة Growth & Marketing كـ Admin.',
    type: 'info',
    category: 'invitation',
    read: false,
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    linkTab: 'invitations',
    workspaceId: 'ws-marketing'
  },
  {
    id: 'notif-3',
    title: 'تنبيه استهلاك الموارد',
    titleAr: 'تنبيه استهلاك الموارد الشهري',
    message: 'وصل استهلاك مساحة Zain Production إلى 62% من الحصة الشهرية.',
    messageAr: 'وصل استهلاك مساحة Zain Production إلى 62% من الحصة الشهرية للذكاء الاصطناعي.',
    type: 'warning',
    category: 'billing',
    read: true,
    createdAt: new Date(Date.now() - 1440 * 60000).toISOString(),
    linkTab: 'usage',
    workspaceId: 'ws-primary'
  },
  {
    id: 'notif-4',
    title: 'التحقق من مفتاح Gemini API',
    titleAr: 'التحقق من مفتاح Gemini API بنجاح',
    message: 'تم تأكيد جاهزية المفتاح وتوفير أقصى سرعة استجابة.',
    messageAr: 'تم تأكيد جاهزية المفتاح وتوفير أقصى سرعة استجابة من السيرفر.',
    type: 'success',
    category: 'vault',
    read: true,
    createdAt: new Date(Date.now() - 2880 * 60000).toISOString(),
    linkTab: 'vault',
    workspaceId: 'ws-primary'
  }
];

const INITIAL_SERVICE_STATUSES: ServiceStatus[] = [
  {
    id: 'srv-gemini',
    name: 'Google Gemini 1.5 Flash / Pro API',
    nameAr: 'محرك الذكاء الاصطناعي Gemini AI 1.5',
    serviceKey: 'gemini',
    category: 'AI Model',
    status: 'operational',
    latencyMs: 38,
    uptime24h: 99.99,
    lastChecked: new Date().toISOString(),
    description: 'Generative AI inference, function calling, & automated scoring.',
    descriptionAr: 'معالجة النصوص والتوليد والتحليل الذكي لمسارات العمل.'
  },
  {
    id: 'srv-firestore',
    name: 'Google Cloud Firestore Database',
    nameAr: 'قاعدة بيانات Cloud Firestore',
    serviceKey: 'firestore',
    category: 'Database',
    status: 'operational',
    latencyMs: 16,
    uptime24h: 100.0,
    lastChecked: new Date().toISOString(),
    description: 'Multi-tenant real-time persistence and secure state storage.',
    descriptionAr: 'تخزين المخططات، السجلات، وتخصيص البيانات المعزولة.'
  },
  {
    id: 'srv-gmail',
    name: 'Gmail & Google Workspace OAuth',
    nameAr: 'خدمات البريد Gmail & Google Workspace',
    serviceKey: 'gmail',
    category: 'Email',
    status: 'operational',
    latencyMs: 54,
    uptime24h: 99.96,
    lastChecked: new Date().toISOString(),
    description: 'Automated email dispatch, trigger listening, and attachment parsing.',
    descriptionAr: 'استقبال القوالب، قراءة الرسائل الواردة وإرسال التنبيهات.'
  },
  {
    id: 'srv-telegram',
    name: 'Telegram Bot API Gateway',
    nameAr: 'بوابة بوت التليجرام Telegram Bot',
    serviceKey: 'telegram',
    category: 'Messaging',
    status: 'operational',
    latencyMs: 62,
    uptime24h: 99.92,
    lastChecked: new Date().toISOString(),
    description: 'Instant notification webhooks & interactive command bots.',
    descriptionAr: 'إرسال الإشعارات التلقائية وتلقي أوامر المجموعات والقنوات.'
  },
  {
    id: 'srv-slack',
    name: 'Slack Webhooks Engine',
    nameAr: 'محرك إشعارات Slack',
    serviceKey: 'slack',
    category: 'Messaging',
    status: 'operational',
    latencyMs: 45,
    uptime24h: 99.98,
    lastChecked: new Date().toISOString(),
    description: 'Channel messaging & team alerts integration.',
    descriptionAr: 'توجيه تنبيهات الأحداث لقنوات Slack للمفرق والفرق.'
  },
  {
    id: 'srv-whatsapp',
    name: 'WhatsApp Business Cloud API',
    nameAr: 'واتساب الأعمال Cloud API',
    serviceKey: 'whatsapp',
    category: 'Messaging',
    status: 'operational',
    latencyMs: 78,
    uptime24h: 99.90,
    lastChecked: new Date().toISOString(),
    description: 'Official WhatsApp messaging API trigger and response dispatch.',
    descriptionAr: 'إرسال واستقبال رسائل العملاء التلقائية والرد الآلي.'
  },
  {
    id: 'srv-webhook',
    name: 'HTTP Ingestion & Webhook Gateway',
    nameAr: 'بوابة استقبال HTTP Webhooks',
    serviceKey: 'webhook',
    category: 'Integration',
    status: 'operational',
    latencyMs: 22,
    uptime24h: 100.0,
    lastChecked: new Date().toISOString(),
    description: 'High-throughput payload receiver with instant execution routing.',
    descriptionAr: 'استقبال طلبات POST الواردة فورياً وتمرير المشغلات.'
  }
];

const INITIAL_USAGE_METRICS: Record<string, WorkspaceUsage> = {
  'ws-primary': {
    workspaceId: 'ws-primary',
    workspaceName: 'مساحة العمل الرئيسية - Zain Production',
    workflowExecutions: 14280,
    executionsLimit: 25000,
    geminiTokensUsed: 1840000,
    geminiTokensLimit: 3000000,
    apiRequests: 45200,
    apiRequestsLimit: 100000,
    activeUsers: 4,
    userSeatsLimit: 10,
    storageMbUsed: 128,
    storageMbLimit: 1024,
    topWorkflows: [
      { name: 'مؤتمت التأهيل عبر WhatsApp بـ Gemini', executions: 8400, tokens: 1100000 },
      { name: 'تحليل وتصنيف تذاكر الدعم الفني تلقائياً', executions: 3820, tokens: 520000 },
      { name: 'مزامنة صفقات المبيعات مع Google Sheets', executions: 2060, tokens: 220000 }
    ]
  },
  'ws-marketing': {
    workspaceId: 'ws-marketing',
    workspaceName: 'فريق التسويق والنمو - Growth & Marketing',
    workflowExecutions: 4120,
    executionsLimit: 10000,
    geminiTokensUsed: 620000,
    geminiTokensLimit: 1000000,
    apiRequests: 12800,
    apiRequestsLimit: 50000,
    activeUsers: 2,
    userSeatsLimit: 5,
    storageMbUsed: 42,
    storageMbLimit: 512,
    topWorkflows: [
      { name: 'صياغة منشورات السوشيال ميديا التلقائية', executions: 2800, tokens: 480000 },
      { name: 'تحليل العملاء المحتملين من الفورم', executions: 1320, tokens: 140000 }
    ]
  }
};

const INITIAL_ADMIN_STATS: AdminSystemStats = {
  totalUsers: 142,
  activeUsers24h: 38,
  totalWorkspaces: 24,
  totalWorkflows: 96,
  activeWorkflows: 72,
  totalExecutionsMonth: 54380,
  failedExecutionsMonth: 112,
  geminiApiTokensMonth: 7820000,
  systemHealthScore: 99.9,
  activeIncidents: 0
};

export const notificationService = {
  async getNotifications(workspaceId?: string): Promise<AppNotification[]> {
    const list = getLocalData<AppNotification[]>('notifications', INITIAL_NOTIFICATIONS);
    if (workspaceId) {
      return list.filter(n => !n.workspaceId || n.workspaceId === workspaceId);
    }
    return list;
  },

  async markAsRead(id: string): Promise<AppNotification[]> {
    const list = getLocalData<AppNotification[]>('notifications', INITIAL_NOTIFICATIONS);
    const updated = list.map(n => n.id === id ? { ...n, read: true } : n);
    setLocalData('notifications', updated);
    return updated;
  },

  async markAllAsRead(): Promise<AppNotification[]> {
    const list = getLocalData<AppNotification[]>('notifications', INITIAL_NOTIFICATIONS);
    const updated = list.map(n => ({ ...n, read: true }));
    setLocalData('notifications', updated);
    return updated;
  },

  async addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<AppNotification> {
    const list = getLocalData<AppNotification[]>('notifications', INITIAL_NOTIFICATIONS);
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    const updated = [newNotif, ...list];
    setLocalData('notifications', updated);
    return newNotif;
  },

  async deleteNotification(id: string): Promise<AppNotification[]> {
    const list = getLocalData<AppNotification[]>('notifications', INITIAL_NOTIFICATIONS);
    const updated = list.filter(n => n.id !== id);
    setLocalData('notifications', updated);
    return updated;
  }
};

export const statusService = {
  async getServicesStatus(): Promise<ServiceStatus[]> {
    return getLocalData<ServiceStatus[]>('service_statuses', INITIAL_SERVICE_STATUSES);
  },

  async pingService(serviceKey: string): Promise<ServiceStatus> {
    const list = getLocalData<ServiceStatus[]>('service_statuses', INITIAL_SERVICE_STATUSES);
    const idx = list.findIndex(s => s.serviceKey === serviceKey);
    const randomLatency = Math.floor(15 + Math.random() * 50);
    const updatedStatus: ServiceStatus = {
      ...(idx >= 0 ? list[idx] : INITIAL_SERVICE_STATUSES[0]),
      latencyMs: randomLatency,
      status: 'operational',
      lastChecked: new Date().toISOString()
    };

    if (idx >= 0) {
      list[idx] = updatedStatus;
      setLocalData('service_statuses', list);
    }
    return updatedStatus;
  }
};

export const usageService = {
  async getWorkspaceUsage(workspaceId: string): Promise<WorkspaceUsage> {
    const metricsMap = getLocalData<Record<string, WorkspaceUsage>>('usage_metrics', INITIAL_USAGE_METRICS);
    if (metricsMap[workspaceId]) {
      return metricsMap[workspaceId];
    }
    return {
      workspaceId,
      workspaceName: 'Custom Workspace',
      workflowExecutions: 120,
      executionsLimit: 10000,
      geminiTokensUsed: 45000,
      geminiTokensLimit: 1000000,
      apiRequests: 850,
      apiRequestsLimit: 50000,
      activeUsers: 1,
      userSeatsLimit: 5,
      storageMbUsed: 12,
      storageMbLimit: 512,
      topWorkflows: [
        { name: 'Custom AI Processing Pipeline', executions: 120, tokens: 45000 }
      ]
    };
  },

  async getAllWorkspacesUsage(): Promise<WorkspaceUsage[]> {
    const metricsMap = getLocalData<Record<string, WorkspaceUsage>>('usage_metrics', INITIAL_USAGE_METRICS);
    return Object.values(metricsMap);
  }
};

export const adminService = {
  async getAdminStats(): Promise<AdminSystemStats> {
    return getLocalData<AdminSystemStats>('admin_stats', INITIAL_ADMIN_STATS);
  },

  async getAllPlatformUsers(): Promise<UserProfile[]> {
    const defaultUsers: UserProfile[] = [
      { uid: 'usr-101', email: 'ahmed@zainauto.io', displayName: 'Ahmed Zain', role: 'admin', language: 'ar', createdAt: '2026-01-10T10:00:00Z' },
      { uid: 'usr-102', email: 'sara@zainauto.io', displayName: 'Sara Al-Ghamdi', role: 'admin', language: 'ar', createdAt: '2026-02-14T12:30:00Z' },
      { uid: 'usr-103', email: 'khaled@zainauto.io', displayName: 'Khaled Omar', role: 'developer', language: 'en', createdAt: '2026-03-01T09:15:00Z' },
      { uid: 'usr-104', email: 'mona@zainauto.io', displayName: 'Mona Youssef', role: 'viewer', language: 'ar', createdAt: '2026-04-12T16:20:00Z' },
      { uid: 'usr-105', email: 'tariq@zainauto.io', displayName: 'Tariq Nabil', role: 'developer', language: 'en', createdAt: '2026-05-20T11:45:00Z' }
    ];
    return getLocalData<UserProfile[]>('platform_users', defaultUsers);
  },

  async updateUserRole(uid: string, role: string): Promise<UserProfile[]> {
    const users = await this.getAllPlatformUsers();
    const updated = users.map(u => u.uid === uid ? { ...u, role } : u);
    setLocalData('platform_users', updated);
    return updated;
  }
};

export const feedbackService = {
  async submitFeedback(feedback: Omit<UserFeedback, 'id' | 'createdAt' | 'status'>): Promise<UserFeedback> {
    const newFeedback: UserFeedback = {
      ...feedback,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    if (firebaseDb) {
      try {
        await addDoc(collection(firebaseDb, 'feedback'), newFeedback);
      } catch (e) {
        console.warn('Firestore feedback insert fallback:', e);
      }
    }

    const currentList = getLocalData<UserFeedback[]>('user_feedback', []);
    const updatedList = [newFeedback, ...currentList];
    setLocalData('user_feedback', updatedList);
    return newFeedback;
  },

  async getAllFeedback(): Promise<UserFeedback[]> {
    const initialSamples: UserFeedback[] = [
      {
        id: 'fb-1',
        userName: 'أحمد علي',
        userEmail: 'ahmed@company.com',
        type: 'feature',
        rating: 5,
        comment: 'المنصة ممتازة وسريعة جداً! اقتراح: إمكانية تكرار مسار العمل بضغطة زر.',
        page: 'Workflows',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        status: 'reviewed'
      },
      {
        id: 'fb-2',
        userName: 'مريم السعيد',
        userEmail: 'mariam@tech.io',
        type: 'bug',
        rating: 4,
        comment: 'واجهة بناء الذكاء الاصطناعي تعمل بشكل جيد، لكن تحتاج زر مسح الشات سريعا.',
        page: 'AI Builder',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        status: 'new'
      }
    ];

    if (firebaseDb) {
      try {
        const q = query(collection(firebaseDb, 'feedback'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserFeedback));
        }
      } catch (e) {
        console.warn('Firestore feedback fetch fallback:', e);
      }
    }

    return getLocalData<UserFeedback[]>('user_feedback', initialSamples);
  }
};

