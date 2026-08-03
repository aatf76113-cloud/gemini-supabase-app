import React, { useState, useEffect } from 'react';
import { 
  Language, 
  UserProfile, 
  NavTab, 
  Workflow, 
  ExecutionLog, 
  TeamMember, 
  AppConnection,
  Workspace,
  Invitation,
  AuditLog,
  WorkspaceRole
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { WorkflowsList } from './components/WorkflowsList';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { ConnectionsView } from './components/ConnectionsView';
import { ExecutionsLogView } from './components/ExecutionsLogView';
import { UserManagementView } from './components/UserManagementView';
import { AIBuilderView } from './components/AIBuilderView';
import { NodeMarketplaceView } from './components/NodeMarketplaceView';
import { SecretsVaultView } from './components/SecretsVaultView';
import { AnalyticsView } from './components/AnalyticsView';
import { InboxView } from './components/InboxView';
import { BillingView } from './components/BillingView';
import { SettingsView } from './components/SettingsView';
import { AIGeneratorModal } from './components/AIGeneratorModal';

// Beta Readiness & RC 1.0 Components
import { AdminDashboardView } from './components/AdminDashboardView';
import { NotificationsCenter } from './components/NotificationsCenter';
import { StatusView } from './components/StatusView';
import { UsageView } from './components/UsageView';
import { TestingSuiteView } from './components/TestingSuiteView';
import { PricingView } from './components/PricingView';
import { ApiKeysView } from './components/ApiKeysView';
import { WebhooksView } from './components/WebhooksView';
import { MonitoringDashboardView } from './components/MonitoringDashboardView';
import { DevelopersView } from './components/DevelopersView';
import { HelpCenterView } from './components/HelpCenterView';
import { ReadinessReportView } from './components/ReadinessReportView';
import { AiProvidersView } from './components/AiProvidersView';
import { AIDiagnosticsView } from './components/AIDiagnosticsView';
import { AIAgentsView } from './components/AIAgentsView';
import { ComputerUseView } from './components/ComputerUseView';
import { FeedbackModal } from './components/FeedbackModal';
import { ErrorBoundary } from './components/ErrorBoundary';

// SaaS Trial & Referral Components
import { TrialUsageBanner } from './components/TrialUsageBanner';
import { ReferralModal } from './components/ReferralModal';

// PWA & Native App Components
import { OfflineBanner } from './components/pwa/OfflineBanner';
import { UpdateNotifierToast } from './components/pwa/UpdateNotifierToast';
import { InstallPwaModal } from './components/pwa/InstallPwaModal';

// Multi-tenant components
import { WorkspacesView } from './components/WorkspacesView';
import { TeamManagementView } from './components/TeamManagementView';
import { InvitationsView } from './components/InvitationsView';
import { AuditLogView } from './components/AuditLogView';

import { 
  authService, 
  workflowService, 
  executionService, 
  teamService, 
  connectionService,
  workspaceService,
  invitationService,
  auditLogService,
  notificationService
} from './services/firebase';
import { runWorkflowTest } from './services/workflowRunner';

import { SEOHead } from './components/SEOHead';
import { BottomNav } from './components/BottomNav';

export default function App() {
  // State initialization
  const [user, setUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [language, setLanguage] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  
  // Multi-tenant Workspace State
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Data State
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<ExecutionLog[]>([]);
  const [connections, setConnections] = useState<AppConnection[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isInstallPwaOpen, setIsInstallPwaOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync HTML dir attribute whenever language changes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Load Workspaces for User
  useEffect(() => {
    const initWorkspaces = async () => {
      try {
        const userId = user?.uid || 'usr-demo-admin';
        const userEmail = user?.email || 'ahmed@zainauto.io';
        const wsList = await workspaceService.getWorkspaces(userId, userEmail);
        setWorkspaces(wsList);
        if (wsList.length > 0 && !activeWorkspace) {
          setActiveWorkspace(wsList[0]);
        }
      } catch (err) {
        console.error("Failed to fetch workspaces:", err);
      }
    };
    initWorkspaces();
  }, [user]);

  // Load Workspace-Scoped Data whenever activeWorkspace changes
  useEffect(() => {
    const loadWorkspaceData = async () => {
      if (!activeWorkspace) return;
      const wsId = activeWorkspace.id;
      const userEmail = user?.email || 'ahmed@zainauto.io';

      try {
        const [wfs, execs, conns, team, invs, logs] = await Promise.all([
          workflowService.getWorkflows(wsId),
          executionService.getExecutions(wsId),
          connectionService.getConnections(),
          teamService.getMembers(wsId),
          invitationService.getInvitationsForEmail(userEmail),
          auditLogService.getAuditLogs(wsId)
        ]);

        setWorkflows(wfs);
        setExecutions(execs);
        setConnections(conns);
        setTeamMembers(team);
        setInvitations(invs);
        setAuditLogs(logs);
      } catch (err) {
        console.error("Error loading workspace data:", err);
      }
    };

    loadWorkspaceData();
  }, [activeWorkspace, user]);

  // Handlers
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const handleAuthSuccess = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  // Multi-Tenant Handlers
  const handleSelectWorkspace = (ws: Workspace) => {
    setActiveWorkspace(ws);
    setActiveTab('dashboard');
  };

  const handleCreateWorkspace = async (name: string) => {
    const userId = user?.uid || 'usr-demo-admin';
    const userEmail = user?.email || 'ahmed@zainauto.io';
    const newWs = await workspaceService.createWorkspace(name, userId, userEmail, 'pro');
    setWorkspaces(prev => [newWs, ...prev]);
    setActiveWorkspace(newWs);
  };

  const handleInviteMember = async (email: string, role: WorkspaceRole) => {
    if (!activeWorkspace) return;
    const inviterUid = user?.uid || 'usr-demo-admin';
    const inviterName = user?.displayName || 'Ahmed Zain';
    const inviterEmail = user?.email || 'ahmed@zainauto.io';

    const newInv = await invitationService.sendInvitation(
      activeWorkspace.id,
      activeWorkspace.name,
      email,
      role,
      inviterUid,
      inviterName,
      inviterEmail
    );
    setInvitations(prev => [newInv, ...prev]);
    
    // Add to pending team members
    const newMember: TeamMember = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: role,
      status: 'Pending',
      invitedAt: new Date().toISOString().split('T')[0]
    };
    setTeamMembers(prev => [newMember, ...prev]);

    // Refresh Audit Log
    const logs = await auditLogService.getAuditLogs(activeWorkspace.id);
    setAuditLogs(logs);
  };

  const handleUpdateRole = async (memberId: string, newRole: WorkspaceRole) => {
    if (!activeWorkspace) return;
    const actorInfo = {
      uid: user?.uid || 'usr-demo-admin',
      name: user?.displayName || 'Ahmed Zain',
      email: user?.email || 'ahmed@zainauto.io'
    };
    const updatedTeam = await teamService.updateMemberRole(memberId, newRole, actorInfo, activeWorkspace.id);
    setTeamMembers(updatedTeam);

    const logs = await auditLogService.getAuditLogs(activeWorkspace.id);
    setAuditLogs(logs);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!activeWorkspace) return;
    const actorInfo = {
      uid: user?.uid || 'usr-demo-admin',
      name: user?.displayName || 'Ahmed Zain',
      email: user?.email || 'ahmed@zainauto.io'
    };
    const updatedTeam = await teamService.removeMember(memberId, actorInfo, activeWorkspace.id);
    setTeamMembers(updatedTeam);

    const logs = await auditLogService.getAuditLogs(activeWorkspace.id);
    setAuditLogs(logs);
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    const userId = user?.uid || 'usr-demo-admin';
    const userName = user?.displayName || 'Ahmed Zain';
    const userEmail = user?.email || 'ahmed@zainauto.io';

    await invitationService.acceptInvitation(invitationId, userId, userName, userEmail);
    setInvitations(prev => prev.filter(i => i.id !== invitationId));
    
    // Refresh user's workspaces
    const wsList = await workspaceService.getWorkspaces(userId, userEmail);
    setWorkspaces(wsList);
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    const userEmail = user?.email || 'ahmed@zainauto.io';
    await invitationService.declineInvitation(invitationId, userEmail);
    setInvitations(prev => prev.filter(i => i.id !== invitationId));
  };

  const handleNewWorkflow = () => {
    const newWf: Workflow = {
      id: `wf-${Date.now()}`,
      workspaceId: activeWorkspace?.id || 'ws-default',
      name: 'New Custom Workflow',
      nameAr: 'مسار عمل مخصص جديد',
      description: 'Automates task execution sequence',
      descriptionAr: 'يؤتمت تسلسل تنفيذ المهام التلقائية',
      category: 'Productivity',
      active: true,
      status: 'Active',
      executionsCount: 0,
      successCount: 0,
      createdBy: user?.displayName || 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trigger: {
        id: `trig-${Date.now()}`,
        type: 'webhook',
        title: 'HTTP Webhook Trigger',
        titleAr: 'مُشغل Webhook وارد',
        icon: 'Webhook',
        config: { url: 'https://api.zainauto.io/v1/hooks/custom' }
      },
      steps: [
        {
          id: `step-${Date.now()}`,
          type: 'gemini_ai',
          title: 'Gemini AI Lead Scoring',
          titleAr: 'تحليل وتصنيف بـ Gemini AI',
          icon: 'Bot',
          config: { prompt: 'Process incoming data payload' }
        }
      ]
    };

    setSelectedWorkflow(newWf);
    setActiveTab('builder');
  };

  const handleSaveWorkflow = async (updatedWf: Workflow) => {
    const actorInfo = {
      uid: user?.uid || 'usr-demo-admin',
      name: user?.displayName || 'Ahmed Zain',
      email: user?.email || 'ahmed@zainauto.io'
    };
    const saved = await workflowService.saveWorkflow({
      ...updatedWf,
      workspaceId: activeWorkspace?.id || updatedWf.workspaceId || 'ws-primary'
    }, actorInfo);

    setWorkflows(prev => {
      const idx = prev.findIndex(w => w.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    
    // Refresh audit logs
    if (activeWorkspace) {
      const logs = await auditLogService.getAuditLogs(activeWorkspace.id);
      setAuditLogs(logs);
    }

    setActiveTab('workflows');
  };

  const handleDeleteWorkflow = async (id: string) => {
    const actorInfo = {
      uid: user?.uid || 'usr-demo-admin',
      name: user?.displayName || 'Ahmed Zain',
      email: user?.email || 'ahmed@zainauto.io'
    };
    await workflowService.deleteWorkflow(id, activeWorkspace?.id, actorInfo);
    setWorkflows(prev => prev.filter(w => w.id !== id));
    
    if (activeWorkspace) {
      const logs = await auditLogService.getAuditLogs(activeWorkspace.id);
      setAuditLogs(logs);
    }
  };

  const handleToggleActive = async (wf: Workflow, newStatus?: 'Draft' | 'Active' | 'Paused' | 'Error') => {
    const statusToSet = newStatus || (wf.active ? 'Paused' : 'Active');
    const updated: Workflow = { 
      ...wf, 
      status: statusToSet,
      active: statusToSet === 'Active'
    };
    await handleSaveWorkflow(updated);
  };

  const handleTestRunWorkflow = async (wf: Workflow) => {
    const log = await runWorkflowTest(wf);
    setExecutions(prev => [log, ...prev]);

    // Trigger in-app notification
    await notificationService.addNotification({
      title: `Workflow Execution: ${wf.name}`,
      titleAr: `تم تنفيذ سير العمل: ${wf.nameAr || wf.name}`,
      message: `Execution completed with status ${log.status} in ${log.durationMs}ms`,
      messageAr: `اكتمل التنفيذ بنجاح بحالة ${log.status === 'success' ? 'نجاح' : 'خطأ'} خلال ${log.durationMs} ميلي ثانية.`,
      type: log.status === 'success' ? 'success' : 'error',
      category: 'workflow',
      linkTab: 'logs',
      workspaceId: activeWorkspace?.id
    });

    // Refresh workflows list stats
    if (activeWorkspace) {
      const updatedWfs = await workflowService.getWorkflows(activeWorkspace.id);
      setWorkflows(updatedWfs);
    }
  };

  const handleWorkflowGeneratedByAI = async (newWf: Workflow) => {
    await handleSaveWorkflow(newWf);
    setSelectedWorkflow(newWf);
    setActiveTab('builder');
  };

  const handleAddTeamMember = async (memberData: Omit<TeamMember, 'id' | 'invitedAt'>) => {
    const actorInfo = {
      uid: user?.uid || 'usr-demo-admin',
      name: user?.displayName || 'Ahmed Zain',
      email: user?.email || 'ahmed@zainauto.io'
    };
    const newMember = await teamService.addMember(memberData, actorInfo, activeWorkspace?.id || 'ws-primary');
    setTeamMembers(prev => [newMember, ...prev]);
  };

  const handleUpdateConnection = async (id: string, updates: Partial<AppConnection>) => {
    const updatedConns = await connectionService.updateConnection(id, updates);
    setConnections(updatedConns);
  };

  // Guest vs Authenticated User Check
  const isGuestMode = !user;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <SEOHead activeTab={activeTab} language={language} workflowName={selectedWorkflow?.name} />
      {/* Top Navbar */}
      <Navbar
        user={user}
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAIGenerator={() => {
          setAiPrompt('');
          setIsAIGeneratorOpen(true);
        }}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenInstallPwa={() => setIsInstallPwaOpen(true)}
        activeWorkspace={activeWorkspace}
        workspaces={workspaces}
        onSelectWorkspace={handleSelectWorkspace}
        onOpenWorkspacesView={() => setActiveTab('workspaces')}
        onOpenTeamView={() => setActiveTab('team')}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Workspace Layout */}
      {isGuestMode ? (
        <LandingPage
          language={language}
          onGetStarted={() => setIsAuthOpen(true)}
          onExploreDemo={() => {
            const demoUser = authService.loginDemoUser();
            setUser(demoUser);
          }}
        />
      ) : (
        <div className="flex-1 flex h-[calc(100vh-4rem)] overflow-hidden relative">
          {/* Mobile Sidebar Backdrop Overlay */}
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Sidebar Drawer */}
          <div className={`fixed inset-y-16 rtl:right-0 ltr:left-0 z-40 transform transition-transform duration-300 md:relative md:inset-auto md:translate-x-0 ${
            isMobileSidebarOpen 
              ? 'translate-x-0' 
              : language === 'ar' ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}>
            <Sidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setIsMobileSidebarOpen(false);
              }}
              language={language}
              onNewWorkflow={handleNewWorkflow}
              onOpenAIGenerator={() => {
                setAiPrompt('');
                setIsAIGeneratorOpen(true);
              }}
            />
          </div>

          {/* Tab View Container */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
            {!isGuestMode && (
              <TrialUsageBanner
                language={language}
                workspaceId={activeWorkspace?.id || 'ws-primary'}
                userId={user?.uid || 'usr-demo-admin'}
                userEmail={user?.email || 'ahmed@zainauto.io'}
                onOpenReferralModal={() => setIsReferralModalOpen(true)}
                onOpenUpgradePage={() => setActiveTab('pricing')}
              />
            )}

            <ErrorBoundary>
            {activeTab === 'dashboard' && (
              <DashboardView
                language={language}
                workflows={workflows}
                executions={executions}
                userName={user?.displayName || 'User'}
                onOpenAIGeneratorWithPrompt={(promptText) => {
                  setAiPrompt(promptText);
                  setIsAIGeneratorOpen(true);
                }}
                onNewWorkflow={handleNewWorkflow}
                onViewAllLogs={() => setActiveTab('logs')}
                onViewWorkflows={() => setActiveTab('workflows')}
                onTestRunWorkflow={handleTestRunWorkflow}
              />
            )}

            {activeTab === 'admin_dashboard' && (
              <AdminDashboardView
                language={language}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsCenter
                language={language}
                onNavigateTab={(tab) => setActiveTab(tab)}
                workspaceId={activeWorkspace?.id}
              />
            )}

            {activeTab === 'status' && (
              <StatusView
                language={language}
              />
            )}

            {activeTab === 'usage' && (
              <UsageView
                language={language}
                activeWorkspace={activeWorkspace}
              />
            )}

            {activeTab === 'testing' && (
              <TestingSuiteView
                language={language}
              />
            )}

            {activeTab === 'pricing' && (
              <PricingView
                language={language}
                onSelectPlan={() => setActiveTab('billing')}
              />
            )}

            {activeTab === 'api_keys' && (
              <ApiKeysView
                language={language}
              />
            )}

            {activeTab === 'webhooks' && (
              <WebhooksView
                language={language}
              />
            )}

            {activeTab === 'monitoring' && (
              <MonitoringDashboardView
                language={language}
              />
            )}

            {activeTab === 'developers' && (
              <DevelopersView
                language={language}
              />
            )}

            {activeTab === 'help_center' && (
              <HelpCenterView
                language={language}
              />
            )}

            {activeTab === 'readiness_report' && (
              <ReadinessReportView
                language={language}
              />
            )}

            {activeTab === 'ai_providers' && (
              <AiProvidersView
                language={language}
              />
            )}

            {activeTab === 'ai_diagnostics' && (
              <AIDiagnosticsView
                language={language}
              />
            )}

            {activeTab === 'ai_agents' && (
              <AIAgentsView
                language={language}
                workspaceId={activeWorkspace?.id || 'default'}
              />
            )}

            {activeTab === 'computer_use' && (
              <ComputerUseView
                language={language}
                workspaceId={activeWorkspace?.id || 'default'}
              />
            )}

            {activeTab === 'workspaces' && (
              <WorkspacesView
                language={language}
                user={user}
                workspaces={workspaces}
                activeWorkspace={activeWorkspace}
                onSelectWorkspace={handleSelectWorkspace}
                onCreateWorkspace={handleCreateWorkspace}
                onNavigateToTeam={() => setActiveTab('team')}
              />
            )}

            {activeTab === 'team' && (
              <TeamManagementView
                language={language}
                user={user}
                activeWorkspace={activeWorkspace}
                teamMembers={teamMembers}
                onInviteMember={handleInviteMember}
                onUpdateRole={handleUpdateRole}
                onRemoveMember={handleRemoveMember}
              />
            )}

            {activeTab === 'invitations' && (
              <InvitationsView
                language={language}
                user={user}
                invitations={invitations}
                onAcceptInvitation={handleAcceptInvitation}
                onDeclineInvitation={handleDeclineInvitation}
              />
            )}

            {activeTab === 'audit_log' && (
              <AuditLogView
                language={language}
                activeWorkspace={activeWorkspace}
                logs={auditLogs}
                onRefresh={async () => {
                  if (activeWorkspace) {
                    const logs = await auditLogService.getAuditLogs(activeWorkspace.id);
                    setAuditLogs(logs);
                  }
                }}
              />
            )}

            {activeTab === 'ai_builder' && (
              <AIBuilderView
                language={language}
                onWorkflowGenerated={handleWorkflowGeneratedByAI}
                onOpenCanvas={(wf) => {
                  setSelectedWorkflow(wf);
                  setActiveTab('builder');
                }}
              />
            )}

            {activeTab === 'workflows' && (
              <WorkflowsList
                language={language}
                workflows={workflows}
                onSelectWorkflow={(wf) => {
                  setSelectedWorkflow(wf);
                  setActiveTab('builder');
                }}
                onNewWorkflow={handleNewWorkflow}
                onOpenAIGenerator={() => {
                  setAiPrompt('');
                  setIsAIGeneratorOpen(true);
                }}
                onToggleActive={handleToggleActive}
                onDeleteWorkflow={handleDeleteWorkflow}
                onTestRunWorkflow={handleTestRunWorkflow}
              />
            )}

            {activeTab === 'builder' && (
              selectedWorkflow ? (
                <WorkflowCanvas
                  language={language}
                  workflow={selectedWorkflow}
                  onSaveWorkflow={handleSaveWorkflow}
                  onBack={() => setActiveTab('workflows')}
                />
              ) : (
                <WorkflowsList
                  language={language}
                  workflows={workflows}
                  onSelectWorkflow={(wf) => {
                    setSelectedWorkflow(wf);
                    setActiveTab('builder');
                  }}
                  onNewWorkflow={handleNewWorkflow}
                  onOpenAIGenerator={() => {
                    setAiPrompt('');
                    setIsAIGeneratorOpen(true);
                  }}
                  onToggleActive={handleToggleActive}
                  onDeleteWorkflow={handleDeleteWorkflow}
                  onTestRunWorkflow={handleTestRunWorkflow}
                />
              )
            )}

            {activeTab === 'connections' && (
              <ConnectionsView
                language={language}
                connections={connections}
                onUpdateConnection={handleUpdateConnection}
              />
            )}

            {activeTab === 'marketplace' && (
              <NodeMarketplaceView
                language={language}
                onInstallWorkflow={async (installedWf) => {
                  await handleSaveWorkflow(installedWf);
                  setSelectedWorkflow(installedWf);
                  setActiveTab('builder');
                }}
              />
            )}

            {activeTab === 'vault' && (
              <SecretsVaultView
                language={language}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                language={language}
                workflows={workflows}
                executions={executions}
              />
            )}

            {activeTab === 'inbox' && (
              <InboxView
                language={language}
              />
            )}

            {activeTab === 'logs' && (
              <ExecutionsLogView
                language={language}
                executions={executions}
                workflows={workflows}
                onExecutionUpdate={(newLog) => setExecutions(prev => [newLog, ...prev])}
                onWorkflowUpdate={handleSaveWorkflow}
              />
            )}

            {activeTab === 'users' && (
              <UserManagementView
                language={language}
                teamMembers={teamMembers}
                onAddMember={handleAddTeamMember}
              />
            )}

            {activeTab === 'billing' && (
              <BillingView
                language={language}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                language={language}
                onLanguageChange={handleLanguageChange}
                user={user}
              />
            )}
            </ErrorBoundary>
          </main>

          {/* Mobile Bottom Navigation Bar */}
          <BottomNav
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setIsMobileSidebarOpen(false);
            }}
            language={language}
            onNewWorkflow={handleNewWorkflow}
            onOpenAIGenerator={() => {
              setAiPrompt('');
              setIsAIGeneratorOpen(true);
            }}
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />
        </div>
      )}

      {/* PWA & Network Offline Handlers */}
      <OfflineBanner isRtl={language === 'ar'} />
      <UpdateNotifierToast isRtl={language === 'ar'} />

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        language={language}
        onAuthSuccess={handleAuthSuccess}
      />

      <AIGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        language={language}
        initialPrompt={aiPrompt}
        onWorkflowGenerated={handleWorkflowGeneratedByAI}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        language={language}
        workspaceId={activeWorkspace?.id}
        currentPage={activeTab}
      />

      <InstallPwaModal
        isOpen={isInstallPwaOpen}
        onClose={() => setIsInstallPwaOpen(false)}
        isRtl={language === 'ar'}
      />

      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        language={language}
        workspaceId={activeWorkspace?.id || 'ws-primary'}
        userId={user?.uid || 'usr-demo-admin'}
        userEmail={user?.email || 'ahmed@zainauto.io'}
      />
    </div>
  );
}
