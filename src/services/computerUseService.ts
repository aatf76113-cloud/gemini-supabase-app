import { 
  ComputerUseSession, 
  ComputerUsePlan, 
  ComputerUseStep, 
  HumanApprovalRequest, 
  ComputerUseAuditEntry, 
  DetectedElement,
  BrowserTab
} from '../types';
import { db } from './firebase';
import { collection, doc, setDoc, getDocs, getDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { telemetry } from './telemetryService';

export const SENSITIVE_ACTION_TYPES = [
  'send_email',
  'delete_data',
  'make_payment',
  'publish_post',
  'upload_file',
  'submit_form'
] as const;

export class ComputerUseService {
  private sessionsCollection = 'computer_use_sessions';
  private approvalsCollection = 'human_approvals';
  private auditCollection = 'computer_use_audit_logs';

  /**
   * Generates an AI execution plan based on user goal and target URL
   */
  async generateAIPlan(goal: string, url: string): Promise<ComputerUsePlan> {
    const isLoginGoal = goal.toLowerCase().includes('login') || goal.toLowerCase().includes('تسجيل دخول');
    const isExtractGoal = goal.toLowerCase().includes('extract') || goal.toLowerCase().includes('جدول') || goal.toLowerCase().includes('تصدير');
    const isPaymentOrEmail = goal.toLowerCase().includes('pay') || goal.toLowerCase().includes('دفع') || goal.toLowerCase().includes('إرسال') || goal.toLowerCase().includes('email');

    const steps: ComputerUseStep[] = [
      {
        id: `step_1_${Date.now()}`,
        stepNumber: 1,
        action: 'navigate',
        description: `Navigate to target URL: ${url}`,
        targetSelector: 'window.location',
        value: url,
        status: 'pending',
        executionTimeMs: 120
      },
      {
        id: `step_2_${Date.now()}`,
        stepNumber: 2,
        action: 'read_content',
        description: 'Analyze page layout and detect interactive elements using Visual AI',
        targetSelector: 'body',
        status: 'pending'
      }
    ];

    if (isLoginGoal) {
      steps.push(
        {
          id: `step_3_${Date.now()}`,
          stepNumber: 3,
          action: 'type',
          description: 'Auto-fill login credentials from Vault (Encrypted)',
          targetSelector: 'input[type="email"], input[name="username"]',
          value: 'vault:encrypted_cred_user',
          status: 'pending'
        },
        {
          id: `step_4_${Date.now()}`,
          stepNumber: 4,
          action: 'type',
          description: 'Auto-fill password from Vault (Hidden Masked)',
          targetSelector: 'input[type="password"]',
          value: 'vault:encrypted_cred_pass',
          status: 'pending'
        },
        {
          id: `step_5_${Date.now()}`,
          stepNumber: 5,
          action: 'click',
          description: 'Click Login Button',
          targetSelector: 'button[type="submit"], #login-btn',
          status: 'pending'
        }
      );
    } else if (isExtractGoal) {
      steps.push(
        {
          id: `step_3_${Date.now()}`,
          stepNumber: 3,
          action: 'scroll',
          description: 'Scroll down page to render all dynamic data tables',
          targetSelector: 'window.scrollTo(0, document.body.scrollHeight)',
          status: 'pending'
        },
        {
          id: `step_4_${Date.now()}`,
          stepNumber: 4,
          action: 'extract_table',
          description: 'Extract data grid table content into structured JSON',
          targetSelector: 'table.data-grid, .data-table',
          status: 'pending'
        },
        {
          id: `step_5_${Date.now()}`,
          stepNumber: 5,
          action: 'download_file',
          description: 'Download extracted dataset as CSV / Excel',
          targetSelector: '.btn-export',
          status: 'pending'
        }
      );
    } else {
      steps.push(
        {
          id: `step_3_${Date.now()}`,
          stepNumber: 3,
          action: 'click',
          description: 'Locate primary action button and click',
          targetSelector: 'button.primary-btn, .cta-button',
          status: 'pending'
        },
        {
          id: `step_4_${Date.now()}`,
          stepNumber: 4,
          action: 'type',
          description: 'Fill form input fields',
          targetSelector: 'input[name="query"], .search-input',
          value: goal,
          status: 'pending'
        }
      );
    }

    if (isPaymentOrEmail) {
      steps.push({
        id: `step_sensitive_${Date.now()}`,
        stepNumber: steps.length + 1,
        action: 'sensitive_approval',
        description: `Execute sensitive operation: ${goal}`,
        targetSelector: '#submit-form',
        status: 'requires_approval',
        requiresHumanApproval: true,
        approvalType: goal.toLowerCase().includes('pay') ? 'make_payment' : 'send_email'
      });
    }

    return {
      id: `plan_${Date.now()}`,
      goal,
      initialUrl: url,
      createdAt: new Date().toISOString(),
      steps,
      status: 'draft'
    };
  }

  /**
   * Detects visual elements on current screen/DOM
   */
  detectVisualElements(url: string): DetectedElement[] {
    const isEcommerce = url.includes('shop') || url.includes('cart') || url.includes('store');
    const isPortal = url.includes('portal') || url.includes('admin') || url.includes('dashboard');

    return [
      {
        id: 'elem_1',
        type: 'button',
        label: isEcommerce ? 'Add to Cart / Buy Now' : 'Submit Application',
        selector: 'button.btn-primary',
        confidence: 0.98,
        boundingBox: { x: 120, y: 240, width: 140, height: 42 }
      },
      {
        id: 'elem_2',
        type: 'input',
        label: 'Search / Filter Query',
        selector: 'input#search-field',
        confidence: 0.95,
        boundingBox: { x: 300, y: 110, width: 220, height: 38 }
      },
      {
        id: 'elem_3',
        type: 'dialog',
        label: 'Confirmation Modal Dialog',
        selector: '.modal-dialog',
        confidence: 0.89,
        boundingBox: { x: 200, y: 150, width: 400, height: 280 },
        isSensitive: true
      },
      {
        id: 'elem_4',
        type: 'chart',
        label: 'Analytics Trend Visualization Chart',
        selector: '.recharts-wrapper, canvas#analyticsChart',
        confidence: 0.92,
        boundingBox: { x: 50, y: 350, width: 500, height: 220 }
      },
      {
        id: 'elem_5',
        type: 'pdf_link',
        label: 'Download Invoice / Report PDF',
        selector: 'a[href$=".pdf"]',
        confidence: 0.96,
        boundingBox: { x: 580, y: 110, width: 120, height: 36 }
      }
    ];
  }

  /**
   * Starts a new Computer Use Session
   */
  async createSession(workspaceId: string, title: string, initialUrl: string, goal: string): Promise<ComputerUseSession> {
    const plan = await this.generateAIPlan(goal, initialUrl);
    
    const session: ComputerUseSession = {
      id: `cusession_${Date.now()}`,
      workspaceId,
      title: title || `Automation: ${goal.slice(0, 30)}`,
      initialUrl,
      activeUrl: initialUrl,
      tabs: [
        { id: 'tab_1', title: 'Main Tab - ' + initialUrl, url: initialUrl, active: true }
      ],
      activeTabId: 'tab_1',
      plan,
      status: 'idle',
      currentStepIndex: 0,
      recordedSteps: [],
      startTime: new Date().toISOString(),
      auditLogs: [],
      mobileRemoteEnabled: true
    };

    try {
      if (db) {
        await setDoc(doc(db, this.sessionsCollection, session.id), session);
      }
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }

    return session;
  }

  /**
   * Self-Healing Recovery Engine: attempts to find updated element if selector changed
   */
  healAndLocateElement(selector: string, stepDescription: string): { healedSelector: string; recoveryAttempted: boolean; success: boolean } {
    console.log(`[Recovery Engine] Checking DOM stability for selector: ${selector}`);
    // Simulate smart AI recovery matching visual label or fallback attribute
    const fallbackSelectors = [
      selector,
      `[aria-label*="${stepDescription.slice(0, 10)}"]`,
      `button:contains("${stepDescription.split(' ')[0]}")`,
      `.btn-${stepDescription.slice(0, 4)}`,
      `input[name*="query"]`
    ];

    return {
      healedSelector: fallbackSelectors[1] || selector,
      recoveryAttempted: true,
      success: true
    };
  }

  /**
   * Executes a single step with Recovery Engine & Sensitive Action Check
   */
  async executeStep(
    session: ComputerUseSession, 
    stepIndex: number, 
    userApprovalGiven: boolean = false
  ): Promise<{ updatedSession: ComputerUseSession; requiresApproval?: HumanApprovalRequest }> {
    const step = session.plan.steps[stepIndex];
    if (!step) return { updatedSession: session };

    const timestamp = new Date().toISOString();

    // Check if step is sensitive and needs approval
    if (step.requiresHumanApproval && !userApprovalGiven) {
      const approvalReq: HumanApprovalRequest = {
        id: `appr_${Date.now()}`,
        sessionId: session.id,
        stepId: step.id,
        actionType: step.approvalType || 'submit_form',
        target: step.targetSelector || 'Form Submission',
        description: step.description,
        status: 'pending',
        requestedAt: timestamp
      };

      step.status = 'requires_approval';
      session.status = 'paused_approval';

      const auditEntry: ComputerUseAuditEntry = {
        id: `audit_${Date.now()}`,
        timestamp,
        sessionId: session.id,
        action: `PAUSED: Sensitive Action (${step.approvalType})`,
        selector: step.targetSelector,
        details: `Human approval required before executing: ${step.description}`,
        status: 'pending_approval'
      };

      session.auditLogs.unshift(auditEntry);

      return { updatedSession: session, requiresApproval: approvalReq };
    }

    // Run Recovery Engine
    let targetSel = step.targetSelector;
    let recoveryAttempts = 0;
    if (targetSel) {
      const recovery = this.healAndLocateElement(targetSel, step.description);
      if (recovery.recoveryAttempted) {
        targetSel = recovery.healedSelector;
        recoveryAttempts = 1;
      }
    }

    // Execute simulated action
    step.status = 'running';
    step.executionTimeMs = Math.floor(Math.random() * 200) + 100;
    step.recoveryAttempts = recoveryAttempts;

    // Simulate multi-tab or navigation update
    if (step.action === 'navigate' && step.value) {
      session.activeUrl = step.value;
      if (session.tabs.length > 0) {
        session.tabs[0].url = step.value;
        session.tabs[0].title = 'Tab: ' + step.value;
      }
    } else if (step.action === 'multi_tab') {
      const newTab: BrowserTab = {
        id: `tab_${Date.now()}`,
        title: 'Secondary Window',
        url: step.value || 'https://external-service.org',
        active: true
      };
      session.tabs.forEach(t => t.active = false);
      session.tabs.push(newTab);
      session.activeTabId = newTab.id;
      session.activeUrl = newTab.url;
    }

    step.status = 'completed';
    step.approved = userApprovalGiven;

    session.recordedSteps.push({ ...step });
    session.currentStepIndex = stepIndex + 1;

    const auditEntry: ComputerUseAuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp,
      sessionId: session.id,
      action: step.action.toUpperCase(),
      selector: targetSel,
      details: step.description,
      status: 'success',
      userApproved: userApprovalGiven
    };

    session.auditLogs.unshift(auditEntry);

    if (session.currentStepIndex >= session.plan.steps.length) {
      session.status = 'completed';
      session.endTime = new Date().toISOString();
    } else {
      session.status = 'executing';
    }

    try {
      if (db) {
        await setDoc(doc(db, this.sessionsCollection, session.id), session, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore update error:', e);
    }

    return { updatedSession: session };
  }

  /**
   * Replays recorded session
   */
  async replaySession(session: ComputerUseSession): Promise<ComputerUseSession> {
    const replayedSession: ComputerUseSession = {
      ...session,
      id: `replay_${Date.now()}`,
      title: `[Replay] ${session.title}`,
      currentStepIndex: 0,
      recordedSteps: [],
      status: 'executing',
      startTime: new Date().toISOString(),
      auditLogs: []
    };

    return replayedSession;
  }

  /**
   * Exports recorded session steps as JSON / HAR
   */
  exportSessionJSON(session: ComputerUseSession): string {
    return JSON.stringify({
      zainComputerUseVersion: '2.5.0',
      sessionId: session.id,
      title: session.title,
      initialUrl: session.initialUrl,
      executedSteps: session.recordedSteps,
      auditTrail: session.auditLogs,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Fetch session list from Firestore
   */
  async getSessions(workspaceId: string): Promise<ComputerUseSession[]> {
    try {
      if (db) {
        const q = query(
          collection(db, this.sessionsCollection),
          where('workspaceId', '==', workspaceId),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const results: ComputerUseSession[] = [];
        snapshot.forEach(doc => {
          results.push(doc.data() as ComputerUseSession);
        });
        if (results.length > 0) return results;
      }
    } catch (e) {
      console.warn('Firestore read fallback:', e);
    }

    // Default mock sessions if empty
    return [
      {
        id: 'cusession_demo_1',
        workspaceId,
        title: 'E-commerce Price Extraction & Export',
        initialUrl: 'https://store.zain.ai/products',
        activeUrl: 'https://store.zain.ai/products',
        tabs: [{ id: 'tab_1', title: 'Products Overview', url: 'https://store.zain.ai/products', active: true }],
        activeTabId: 'tab_1',
        plan: {
          id: 'plan_demo_1',
          goal: 'Extract table data and export CSV',
          initialUrl: 'https://store.zain.ai/products',
          createdAt: new Date().toISOString(),
          status: 'completed',
          steps: [
            { id: 's1', stepNumber: 1, action: 'navigate', description: 'Navigate to products store', status: 'completed' },
            { id: 's2', stepNumber: 2, action: 'extract_table', description: 'Extract catalog table', status: 'completed' },
            { id: 's3', stepNumber: 3, action: 'download_file', description: 'Export products.csv', status: 'completed' }
          ]
        },
        status: 'completed',
        currentStepIndex: 3,
        recordedSteps: [
          { id: 's1', stepNumber: 1, action: 'navigate', description: 'Navigate to products store', status: 'completed' },
          { id: 's2', stepNumber: 2, action: 'extract_table', description: 'Extract catalog table', status: 'completed' },
          { id: 's3', stepNumber: 3, action: 'download_file', description: 'Export products.csv', status: 'completed' }
        ],
        startTime: new Date(Date.now() - 3600000).toISOString(),
        auditLogs: [
          { id: 'a1', timestamp: new Date().toISOString(), sessionId: 'cusession_demo_1', action: 'EXPORT', details: 'Downloaded CSV file', status: 'success' }
        ],
        mobileRemoteEnabled: true
      }
    ];
  }
}

export const computerUseService = new ComputerUseService();
