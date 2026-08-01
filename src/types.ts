export type Language = 'ar' | 'en';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'developer' | 'viewer';
  language: Language;
  createdAt: string;
  isDemo?: boolean;
}

export type TriggerType = 'whatsapp' | 'webhook' | 'schedule' | 'email' | 'form' | 'firestore' | 'stripe';

export type StepType = 
  | 'gemini'
  | 'gemini_ai' 
  | 'condition'
  | 'gmail'
  | 'send_email' 
  | 'google_sheets'
  | 'sheets'
  | 'whatsapp' 
  | 'slack' 
  | 'slack_webhook'
  | 'telegram' 
  | 'telegram_bot'
  | 'discord'
  | 'discord_webhook'
  | 'http'
  | 'http_request' 
  | 'webhook'
  | 'webhook_trigger'
  | 'firestore'
  | 'firestore_write' 
  | 'delay' 
  | 'filter'
  | string;

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  title: string;
  titleAr: string;
  icon: string;
  config: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  type: StepType;
  title: string;
  titleAr: string;
  icon: string;
  config: Record<string, any>;
}

export interface Workflow {
  id: string;
  workspaceId?: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: 'Customer Support' | 'Sales & Marketing' | 'Productivity' | 'E-commerce' | 'AI & Data';
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  active: boolean;
  status?: 'Draft' | 'Active' | 'Paused' | 'Error';
  cronSchedule?: string;
  cronEnabled?: boolean;
  executionsCount: number;
  successCount: number;
  lastRunAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionStepResult {
  stepId: string;
  stepTitle: string;
  stepTitleAr?: string;
  status: 'success' | 'failed' | 'skipped' | 'running';
  input?: any;
  output: any;
  durationMs: number;
  logs: string[];
  error?: string;
}

export interface ExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  workflowNameAr?: string;
  status: 'success' | 'failed' | 'running' | 'cancelled';
  durationMs: number;
  triggeredBy: string;
  totalSteps?: number;
  triggerPayload?: any;
  finalOutput?: any;
  stepsLog: ExecutionStepResult[];
  error?: string;
  errorDetails?: string;
  executedAt: string;
}

export type WorkspaceRole = 'Owner' | 'Admin' | 'Editor' | 'Viewer';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  ownerEmail?: string;
  plan: 'starter' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId?: string;
  email: string;
  displayName?: string;
  role: WorkspaceRole;
  status: 'active' | 'invited';
  invitedBy: string;
  joinedAt?: string;
  createdAt: string;
}

export interface Invitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: WorkspaceRole;
  status: 'pending' | 'accepted' | 'declined';
  invitedBy: string;
  invitedByEmail: string;
  createdAt: string;
}

export type AuditLogAction = 
  | 'WORKFLOW_CREATED'
  | 'WORKFLOW_UPDATED'
  | 'WORKFLOW_DELETED'
  | 'WORKFLOW_STATUS_CHANGED'
  | 'MEMBER_INVITED'
  | 'MEMBER_ROLE_UPDATED'
  | 'MEMBER_REMOVED'
  | 'WORKSPACE_CREATED'
  | 'WORKSPACE_UPDATED'
  | 'CONNECTION_UPDATED'
  | 'INVITATION_ACCEPTED'
  | 'INVITATION_DECLINED';

export interface AuditLog {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: AuditLogAction;
  details: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  status: 'Active' | 'Pending';
  invitedAt: string;
  avatar?: string;
}

export type ConnectionStatus = 'active' | 'disconnected' | 'error' | 'expired' | 'connected' | 'needs_key';
export type ConnectionAuthType = 'oauth' | 'api_key' | 'oauth2' | 'webhook' | 'service_account';

export interface AppConnection {
  id: string;
  userId: string;
  service: string; // e.g. 'google', 'microsoft', 'slack', 'openai', etc.
  key: string;     // alias for service ID
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  icon: string;
  category: 'AI' | 'Google' | 'Microsoft' | 'Communication' | 'CRM' | 'Storage' | 'Database' | 'Social Media' | 'Developer' | 'Payments' | string;
  connectionType: ConnectionAuthType;
  authType?: ConnectionAuthType;
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  status: ConnectionStatus;
  isFavorite?: boolean;
  customName?: string;
  scopes?: string[];
  details?: string;
  webhookUrl?: string;
  oauthAccount?: string;
  healthScore?: number;
  lastTestedAt?: string;
  config?: Record<string, any>;
  configuredAt?: string;
}

export type AIProviderId = 
  | 'openai' 
  | 'gemini' 
  | 'claude' 
  | 'grok' 
  | 'deepseek' 
  | 'perplexity' 
  | 'huggingface' 
  | 'openrouter' 
  | 'ollama';

export interface AIProviderConfig {
  id: string;
  provider: AIProviderId;
  name: string;
  nameAr: string;
  icon: string;
  apiKey: string;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  defaultModel: string;
  availableModels: string[];
  requestsCount: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  baseUrl?: string;
  lastTestedAt?: string;
  updatedAt: string;
}

export interface WebhookEvent {
  id: string;
  source: string;
  endpoint: string;
  method: 'POST' | 'GET' | 'PUT';
  receivedAt: string;
  status: 200 | 400 | 500;
  headers: Record<string, string>;
  payload: Record<string, any>;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  date: string;
  status: 'paid' | 'pending';
  downloadUrl: string;
}

export interface BillingPlan {
  id: 'starter' | 'pro' | 'enterprise';
  name: string;
  nameAr: string;
  priceMonthly: number;
  tasksLimit: number;
  workflowsLimit: number;
  aiGenerationsLimit: number;
  features: string[];
  featuresAr: string[];
}

export interface VaultSecret {
  id: string;
  name: string;
  key: string;
  category: 'AI' | 'Database' | 'Payment' | 'Messaging' | 'Cloud' | 'API Key';
  value: string;
  isMasked: boolean;
  status: 'valid' | 'testing' | 'invalid' | 'untested';
  lastTestedAt?: string;
  updatedAt: string;
}

export type MarketplaceCategory = 'Marketing' | 'Sales' | 'Customer Support' | 'E-commerce' | 'AI' | 'Productivity';

export interface MarketplaceTemplateItem {
  id: string;
  itemType: 'workflow' | 'agent' | 'node';
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: MarketplaceCategory;
  thumbnailUrl?: string;
  gradientBg: string;
  author: string;
  version: string;
  downloads: number;
  rating: number;
  reviewsCount: number;
  installed?: boolean;
  tags: string[];
  workflowTemplate?: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'executionsCount' | 'successCount'>;
  nodeConfig?: {
    type: string;
    requiredSecretKey?: string;
    configSchema: Record<string, any>;
  };
}

export interface MarketplaceNode {
  id: string;
  type: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: 'AI & Data' | 'Customer Support' | 'Sales & Marketing' | 'E-commerce' | 'Productivity' | 'AI' | 'Marketing' | 'Sales';
  icon: string;
  installed: boolean;
  version: string;
  author: string;
  downloads: number;
  rating: number;
  requiredSecretKey?: string;
  configSchema: Record<string, any>;
}

export type NavTab = 
  | 'dashboard' 
  | 'admin_dashboard'
  | 'notifications'
  | 'status'
  | 'usage'
  | 'testing'
  | 'pricing'
  | 'api_keys'
  | 'webhooks'
  | 'monitoring'
  | 'developers'
  | 'help_center'
  | 'readiness_report'
  | 'computer_use'
  | 'ai_builder' 
  | 'ai_providers'
  | 'ai_diagnostics'
  | 'ai_agents'
  | 'workflows' 
  | 'builder' 
  | 'workspaces'
  | 'team'
  | 'invitations'
  | 'audit_log'
  | 'connections' 
  | 'marketplace'
  | 'vault'
  | 'analytics' 
  | 'inbox' 
  | 'logs' 
  | 'users' 
  | 'billing' 
  | 'settings';

export type AgentProviderType = 
  | 'gemini' 
  | 'openai' 
  | 'claude' 
  | 'grok' 
  | 'deepseek' 
  | 'perplexity' 
  | 'openrouter' 
  | 'ollama' 
  | 'mistral' 
  | 'cohere';

export type AgentRoleType = 'Manager' | 'Developer' | 'Marketing' | 'Sales' | 'Support' | 'Finance' | 'Custom';

export interface AgentMemoryFact {
  id: string;
  key: string;
  value: string;
  importance: number; // 1-10
  category: 'user_pref' | 'business_rule' | 'context' | 'history';
  createdAt: string;
}

export interface AgentMemory {
  shortTerm: Array<{ id: string; role: 'user' | 'assistant' | 'system'; content: string; timestamp: string }>;
  longTermFacts: AgentMemoryFact[];
  userPreferences: Record<string, any>;
  conversationSessions: Array<{ id: string; title: string; lastMessageAt: string; messagesCount: number }>;
}

export interface AgentPermissions {
  allowWorkflowExecution: boolean;
  allowExternalApi: boolean;
  allowedSkills: string[];
  rbacRole: 'admin' | 'editor' | 'viewer';
}

export interface AgentStats {
  executionTimeMs: number;
  estimatedCostUsd: number;
  totalTokens: number;
  errorsCount: number;
  usageCount: number;
}

export interface AIAgent {
  id: string;
  workspaceId: string;
  name: string;
  nameAr: string;
  avatar: string;
  role: AgentRoleType;
  description: string;
  descriptionAr: string;
  personality: {
    tone: 'Professional' | 'Friendly' | 'Strict' | 'Creative' | 'Analytical';
    temperature: number;
    systemInstructions: string;
    creativityLevel: 'low' | 'balanced' | 'high';
  };
  goals: string[];
  memory: AgentMemory;
  skills: string[];
  permissions: AgentPermissions;
  primaryProvider: AgentProviderType;
  model: string;
  fallbackProviders: AgentProviderType[];
  status: 'active' | 'idle' | 'busy' | 'offline';
  stats: AgentStats;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedToMarketplace?: boolean;
  marketplaceId?: string;
}

export interface MultiAgentMessage {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  agentRole: AgentRoleType;
  content: string;
  timestamp: string;
  tokensUsed?: number;
  providerUsed?: string;
  status?: 'thinking' | 'done' | 'error';
  targetAgentId?: string;
  executedWorkflowId?: string;
}

export interface MultiAgentSession {
  id: string;
  workspaceId: string;
  goal: string;
  goalAr: string;
  participatingAgentIds: string[];
  messages: MultiAgentMessage[];
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface AgentMarketplaceItem {
  id: string;
  agent: Omit<AIAgent, 'id' | 'createdAt' | 'updatedAt'>;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: 'Management' | 'Development' | 'Marketing' | 'Sales' | 'Customer Support' | 'Finance' | 'General';
  author: string;
  version: string;
  downloads: number;
  rating: number;
  reviewsCount: number;
  tags: string[];
  installed?: boolean;
  createdAt: string;
}

export interface UserFeedback {
  id?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  workspaceId?: string;
  type: 'bug' | 'feature' | 'improvement' | 'general';
  rating: number; // 1-5
  comment: string;
  page: string;
  createdAt?: string;
  status?: 'new' | 'reviewed' | 'resolved';
}

export interface AppNotification {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  type: 'success' | 'error' | 'warning' | 'info';
  category: 'workflow' | 'invitation' | 'vault' | 'system' | 'billing';
  read: boolean;
  createdAt: string;
  linkTab?: NavTab;
  workspaceId?: string;
}

export interface ServiceStatus {
  id: string;
  name: string;
  nameAr: string;
  serviceKey: string;
  category: 'AI Model' | 'Database' | 'Messaging' | 'Email' | 'Integration' | 'Compute';
  status: 'operational' | 'degraded' | 'outage';
  latencyMs: number;
  uptime24h: number;
  lastChecked: string;
  description: string;
  descriptionAr: string;
}

export interface WorkspaceUsage {
  workspaceId: string;
  workspaceName: string;
  workflowExecutions: number;
  executionsLimit: number;
  geminiTokensUsed: number;
  geminiTokensLimit: number;
  apiRequests: number;
  apiRequestsLimit: number;
  activeUsers: number;
  userSeatsLimit: number;
  storageMbUsed: number;
  storageMbLimit: number;
  topWorkflows: { name: string; executions: number; tokens: number }[];
}

export interface AdminSystemStats {
  totalUsers: number;
  activeUsers24h: number;
  totalWorkspaces: number;
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutionsMonth: number;
  failedExecutionsMonth: number;
  geminiApiTokensMonth: number;
  systemHealthScore: number;
  activeIncidents: number;
}

// Computer Use Engine Types
export type ComputerActionCategory = 
  | 'navigate' 
  | 'click' 
  | 'type' 
  | 'scroll' 
  | 'extract_table' 
  | 'read_content' 
  | 'upload_file' 
  | 'download_file' 
  | 'sensitive_approval'
  | 'login'
  | 'multi_tab';

export interface DetectedElement {
  id: string;
  type: 'button' | 'input' | 'menu' | 'dialog' | 'image' | 'chart' | 'pdf_link' | 'form';
  label: string;
  selector: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  isSensitive?: boolean;
}

export interface ComputerUseStep {
  id: string;
  stepNumber: number;
  action: ComputerActionCategory;
  description: string;
  targetSelector?: string;
  value?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'requires_approval';
  requiresHumanApproval?: boolean;
  approvalType?: 'send_email' | 'delete_data' | 'make_payment' | 'publish_post' | 'upload_file' | 'submit_form';
  approved?: boolean;
  screenshotUrl?: string;
  detectedElements?: DetectedElement[];
  executionTimeMs?: number;
  recoveryAttempts?: number;
  error?: string;
}

export interface ComputerUsePlan {
  id: string;
  goal: string;
  initialUrl: string;
  createdAt: string;
  steps: ComputerUseStep[];
  status: 'draft' | 'approved' | 'executing' | 'completed' | 'failed';
}

export interface HumanApprovalRequest {
  id: string;
  sessionId: string;
  stepId: string;
  actionType: string;
  target: string;
  description: string;
  sensitiveData?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  respondedAt?: string;
  respondedBy?: string;
}

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  active: boolean;
  favicon?: string;
}

export interface ComputerUseSession {
  id: string;
  workspaceId: string;
  title: string;
  initialUrl: string;
  activeUrl: string;
  tabs: BrowserTab[];
  activeTabId: string;
  plan: ComputerUsePlan;
  status: 'idle' | 'planning' | 'executing' | 'paused_approval' | 'completed' | 'failed';
  currentStepIndex: number;
  recordedSteps: ComputerUseStep[];
  screenshotUrl?: string;
  vaultCredentialIdUsed?: string;
  startTime: string;
  endTime?: string;
  auditLogs: ComputerUseAuditEntry[];
  mobileRemoteEnabled: boolean;
}

export interface ComputerUseAuditEntry {
  id: string;
  timestamp: string;
  sessionId: string;
  action: string;
  selector?: string;
  details: string;
  status: 'success' | 'warning' | 'error' | 'pending_approval';
  userApproved?: boolean;
  approvedBy?: string;
}

// SaaS Trial & Referral System Types
export type TrialStatus = 'active' | 'expired' | 'converted_starter' | 'converted_pro' | 'converted_business' | 'converted_enterprise';

export interface TrialNotificationFlags {
  day7?: boolean;
  day3?: boolean;
  day1?: boolean;
  expired?: boolean;
}

export interface WorkspaceTrial {
  id: string; // workspaceId or unique doc id
  workspaceId: string;
  workspaceName?: string;
  userId: string;
  userEmail: string;
  referralCode: string;
  referredByCode?: string;
  startDate: string; // ISO String
  trialDaysLimit: number; // 15
  trialDaysBonus: number; // Max 30 from referrals
  totalTrialDays: number; // 15 + trialDaysBonus (Max 45)
  tokensLimit: number; // 500,000
  tokensUsed: number;
  workflowsLimit: number; // 10
  workflowsCount: number;
  aiAgentsLimit: number; // 5
  aiAgentsCount: number;
  connectionsLimit: number; // 10
  connectionsCount: number;
  status: TrialStatus;
  notificationsSent: TrialNotificationFlags;
  registeredIp?: string;
  deviceFingerprint?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralReward {
  id: string;
  inviterUserId: string;
  inviterEmail: string;
  inviterReferralCode: string;
  invitedUserId: string;
  invitedUserEmail: string;
  invitedWorkspaceId?: string;
  bonusDaysGranted: number; // +7 days
  status: 'active' | 'flagged_abuse' | 'revoked';
  abuseFlagReason?: string;
  registeredIp?: string;
  createdAt: string;
}

export interface ReferralStats {
  referralCode: string;
  referralUrl: string;
  totalInvited: number;
  totalConverted: number;
  totalBonusDaysEarned: number;
  maxBonusDaysLimit: number; // 30
  rewards: ReferralReward[];
}

export interface TrialExtensionRecord {
  id: string;
  workspaceId: string;
  workspaceName?: string;
  userEmail: string;
  daysAdded: number;
  reason: 'referral' | 'admin_grant' | 'support_promo';
  grantedBy: string;
  createdAt: string;
}

export interface TrialAdminOverview {
  activeTrialsCount: number;
  expiredTrialsCount: number;
  totalReferralsCount: number;
  totalBonusDaysGranted: number;
  conversionRatePercent: number;
  monthlyRecurringRevenueUsd: number;
  annualRecurringRevenueUsd: number;
  totalRevenueUsd: number;
  totalTrialExtensionsCount: number;
  trials: WorkspaceTrial[];
  flaggedReferrals: ReferralReward[];
  extensions: TrialExtensionRecord[];
}



