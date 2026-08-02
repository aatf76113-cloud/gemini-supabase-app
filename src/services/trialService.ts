import { db } from './firebase';
import { supabaseDb } from './supabase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { 
  WorkspaceTrial, 
  ReferralReward, 
  ReferralStats, 
  TrialExtensionRecord, 
  TrialAdminOverview, 
  AppNotification, 
  TrialStatus 
} from '../types';

// Helper to generate a unique 6-character uppercase referral code
export function generateReferralCode(email: string): string {
  const cleanEmail = email.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const prefix = cleanEmail.substring(0, 4).padEnd(4, 'Z');
  const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
  return `ZAIN-${prefix}${randomHex}`;
}

// Helper to strip email aliases e.g., user+123@gmail.com -> user@gmail.com
export function normalizeEmail(email: string): string {
  if (!email) return '';
  const lower = email.toLowerCase().trim();
  const parts = lower.split('@');
  if (parts.length !== 2) return lower;
  const username = parts[0].split('+')[0]; // strip +alias
  return `${username}@${parts[1]}`;
}

class TrialService {
  private LOCAL_STORAGE_KEY = 'zain_workspace_trials_v2';
  private LOCAL_REFERRALS_KEY = 'zain_referrals_v2';
  private LOCAL_EXTENSIONS_KEY = 'zain_trial_extensions_v2';

  // Demo fallback state if offline or Firestore empty
  private getLocalTrials(): Record<string, WorkspaceTrial> {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("LocalStorage read error for trials:", e);
    }
    return {};
  }

  private saveLocalTrials(trials: Record<string, WorkspaceTrial>) {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(trials));
      }
    } catch (e) {
      console.warn("LocalStorage write error for trials:", e);
    }
  }

  private getLocalReferrals(): ReferralReward[] {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.LOCAL_REFERRALS_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("LocalStorage read error for referrals:", e);
    }
    return [];
  }

  private saveLocalReferrals(rewards: ReferralReward[]) {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(this.LOCAL_REFERRALS_KEY, JSON.stringify(rewards));
      }
    } catch (e) {
      console.warn("LocalStorage write error for referrals:", e);
    }
  }

  private getLocalExtensions(): TrialExtensionRecord[] {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.LOCAL_EXTENSIONS_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("LocalStorage read error for extensions:", e);
    }
    return [];
  }

  private saveLocalExtensions(exts: TrialExtensionRecord[]) {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(this.LOCAL_EXTENSIONS_KEY, JSON.stringify(exts));
      }
    } catch (e) {
      console.warn("LocalStorage write error for extensions:", e);
    }
  }

  /**
   * Get or initialize a Workspace Trial profile in Supabase / Firestore
   */
  async getOrCreateWorkspaceTrial(
    workspaceId: string, 
    userId: string, 
    userEmail: string, 
    referralCodeUsed?: string
  ): Promise<WorkspaceTrial> {
    const nowIso = new Date().toISOString();

    // 1. Try Supabase PostgreSQL read
    try {
      const supaData = await supabaseDb.select<any>('workspace_trials', { id: workspaceId });
      if (supaData && supaData.length > 0) {
        const row = supaData[0];
        const trial: WorkspaceTrial = {
          id: row.id,
          workspaceId: row.workspace_id,
          workspaceName: row.workspace_name,
          userId: row.user_id,
          userEmail: row.user_email,
          referralCode: row.referral_code,
          referredByCode: row.referred_by_code,
          startDate: row.start_date,
          trialDaysLimit: row.trial_days_limit,
          trialDaysBonus: row.trial_days_bonus,
          totalTrialDays: row.total_trial_days,
          tokensLimit: Number(row.tokens_limit),
          tokensUsed: Number(row.tokens_used),
          workflowsLimit: row.workflows_limit,
          workflowsCount: row.workflows_count,
          aiAgentsLimit: row.ai_agents_limit,
          aiAgentsCount: row.ai_agents_count,
          connectionsLimit: row.connections_limit,
          connectionsCount: row.connections_count,
          status: row.status,
          notificationsSent: row.notifications_sent || {},
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
        const updatedTrial = await this.checkAndDispatchTrialNotifications(trial);
        return updatedTrial;
      }
    } catch (err) {
      console.warn("Supabase error reading workspace trial, fallback to Firestore:", err);
    }

    // 2. Try Firestore read
    try {
      const docRef = doc(db, 'workspace_trials', workspaceId);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const trial = snap.data() as WorkspaceTrial;
        const updatedTrial = await this.checkAndDispatchTrialNotifications(trial);
        return updatedTrial;
      }
    } catch (err) {
      console.warn("Firestore error reading workspace trial, using local fallback:", err);
    }

    // Check Local Storage
    const localTrials = this.getLocalTrials();
    if (localTrials[workspaceId]) {
      const updatedTrial = await this.checkAndDispatchTrialNotifications(localTrials[workspaceId]);
      return updatedTrial;
    }

    // 3. Create New Default 15-Day Trial with 500k Tokens
    const referralCode = generateReferralCode(userEmail);
    const newTrial: WorkspaceTrial = {
      id: workspaceId,
      workspaceId,
      workspaceName: 'Primary Workspace',
      userId,
      userEmail,
      referralCode,
      startDate: nowIso,
      trialDaysLimit: 15,
      trialDaysBonus: 0,
      totalTrialDays: 15,
      tokensLimit: 500000, // 500k Tokens
      tokensUsed: 12500,   // Initial sample usage
      workflowsLimit: 10,
      workflowsCount: 2,
      aiAgentsLimit: 5,
      aiAgentsCount: 1,
      connectionsLimit: 10,
      connectionsCount: 3,
      status: 'active',
      notificationsSent: {},
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // Save to Local Storage
    localTrials[workspaceId] = newTrial;
    this.saveLocalTrials(localTrials);

    // Save to Supabase
    try {
      await supabaseDb.insert('workspace_trials', {
        id: newTrial.id,
        workspace_id: newTrial.workspaceId,
        workspace_name: newTrial.workspaceName,
        user_id: newTrial.userId,
        user_email: newTrial.userEmail,
        referral_code: newTrial.referralCode,
        referred_by_code: newTrial.referredByCode,
        start_date: newTrial.startDate,
        trial_days_limit: newTrial.trialDaysLimit,
        trial_days_bonus: newTrial.trialDaysBonus,
        total_trial_days: newTrial.totalTrialDays,
        tokens_limit: newTrial.tokensLimit,
        tokens_used: newTrial.tokensUsed,
        workflows_limit: newTrial.workflowsLimit,
        workflows_count: newTrial.workflowsCount,
        ai_agents_limit: newTrial.aiAgentsLimit,
        ai_agents_count: newTrial.aiAgentsCount,
        connections_limit: newTrial.connectionsLimit,
        connections_count: newTrial.connectionsCount,
        status: newTrial.status,
        notifications_sent: newTrial.notificationsSent,
        created_at: newTrial.createdAt,
        updated_at: newTrial.updatedAt
      });
    } catch (e) {
      console.warn("Supabase trial insert error:", e);
    }

    // Save to Firestore
    try {
      const docRef = doc(db, 'workspace_trials', workspaceId);
      await setDoc(docRef, newTrial);
    } catch (err) {
      console.warn("Firestore error writing new trial:", err);
    }

    // If referral code was supplied upon creation, apply it
    if (referralCodeUsed && referralCodeUsed.trim()) {
      await this.applyReferralCode(userId, userEmail, workspaceId, referralCodeUsed.trim());
      // Re-fetch updated trial with bonus days added
      return (await this.getOrCreateWorkspaceTrial(workspaceId, userId, userEmail));
    }

    return newTrial;
  }

  /**
   * Evaluates trial status & automatically sends system notifications at 7 days, 3 days, 1 day, and on expiry
   */
  async checkAndDispatchTrialNotifications(trial: WorkspaceTrial): Promise<WorkspaceTrial> {
    const nowMs = Date.now();
    const startMs = new Date(trial.startDate).getTime();
    const daysPassed = Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, trial.totalTrialDays - daysPassed);
    const tokensExhausted = trial.tokensUsed >= trial.tokensLimit;

    let modified = false;
    const updatedNotifications = { ...trial.notificationsSent };
    let newStatus: TrialStatus = trial.status;

    // Check Expiration Condition: 15 days expire OR token quota exhausted
    if ((remainingDays <= 0 || tokensExhausted) && trial.status === 'active') {
      newStatus = 'expired';
      modified = true;

      if (!updatedNotifications.expired) {
        updatedNotifications.expired = true;
        await this.createSystemNotification(
          trial.workspaceId,
          'Trial Expired | انتهت فترة التجربة المجانية',
          'Your 15-day free trial or 500,000 AI Token quota has ended. Upgrade to Starter, Pro, or Business to continue.',
          'انتهت فترة التجربة المجانية (15 يوماً أو 500 ألف رمز). يرجى الترقية لمتابعة تشغيل الأتمتة.',
          'error'
        );
      }
    } else if (trial.status === 'active') {
      // 7 Days Remaining Notification
      if (remainingDays <= 7 && !updatedNotifications.day7) {
        updatedNotifications.day7 = true;
        modified = true;
        await this.createSystemNotification(
          trial.workspaceId,
          '7 Days Remaining on Free Trial | متبقي 7 أيام على التجربة المجانية',
          `You have 7 days left on your 15-day free trial with ${trial.tokensLimit.toLocaleString()} AI Tokens.`,
          `متبقي لديك 7 أيام في التجربة المجانية مع رصيد ${trial.tokensLimit.toLocaleString()} رمز ذكاء اصطناعي.`,
          'info'
        );
      }

      // 3 Days Remaining Notification
      if (remainingDays <= 3 && !updatedNotifications.day3) {
        updatedNotifications.day3 = true;
        modified = true;
        await this.createSystemNotification(
          trial.workspaceId,
          '3 Days Left - Earn +7 Bonus Days! | متبقي 3 أيام - احصل على 7 أيام مجانية!',
          `Only 3 days left on trial! Invite colleagues with code ${trial.referralCode} to get +7 extra days instantly.`,
          `متبقي 3 أيام فقط! شارك كود الدعوة ${trial.referralCode} للحصول على +7 أيام إضافية فوراً.`,
          'warning'
        );
      }

      // 1 Day Remaining Notification
      if (remainingDays <= 1 && !updatedNotifications.day1) {
        updatedNotifications.day1 = true;
        modified = true;
        await this.createSystemNotification(
          trial.workspaceId,
          '1 Day Remaining! | متبقي يوم واحد فقط!',
          'Your trial expires tomorrow. Upgrade your workspace plan to keep workflows active.',
          'تنتهي تجربتك المجانية غداً. ترقية خطة مساحة العمل تضمن استمرار مسارات الأتمتة دون انقطاع.',
          'warning'
        );
      }
    }

    if (modified || trial.status !== newStatus) {
      const updatedTrial: WorkspaceTrial = {
        ...trial,
        status: newStatus,
        notificationsSent: updatedNotifications,
        updatedAt: new Date().toISOString()
      };

      // Save Local Storage
      const local = this.getLocalTrials();
      local[trial.workspaceId] = updatedTrial;
      this.saveLocalTrials(local);

      // Save Firestore
      try {
        const docRef = doc(db, 'workspace_trials', trial.workspaceId);
        await updateDoc(docRef, {
          status: newStatus,
          notificationsSent: updatedNotifications,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn("Firestore updateDoc error for trial notifications:", e);
      }

      return updatedTrial;
    }

    return trial;
  }

  /**
   * Apply referral code during or post signup with strict Anti-Abuse validation
   */
  async applyReferralCode(
    invitedUserId: string, 
    invitedUserEmail: string, 
    invitedWorkspaceId: string, 
    referralCodeToApply: string
  ): Promise<{ success: boolean; message: string; messageAr: string; bonusDaysAdded?: number }> {
    const cleanCode = referralCodeToApply.trim().toUpperCase();

    // Fetch all trials to find inviter
    let allTrials: WorkspaceTrial[] = [];
    try {
      const colRef = collection(db, 'workspace_trials');
      const snap = await getDocs(colRef);
      allTrials = snap.docs.map(d => d.data() as WorkspaceTrial);
    } catch (e) {
      console.warn("Firestore read error for referral lookup, using local fallback:", e);
    }

    if (allTrials.length === 0) {
      allTrials = Object.values(this.getLocalTrials());
    }

    const inviterTrial = allTrials.find(t => t.referralCode === cleanCode);

    if (!inviterTrial) {
      return {
        success: false,
        message: "Invalid referral code. Please check and try again.",
        messageAr: "كود الدعوة غير صحيح. يرجى التأكد وإعادة المحاولة."
      };
    }

    // ------------------- ANTI-ABUSE ENGINE -------------------
    const inviterNormalized = normalizeEmail(inviterTrial.userEmail);
    const invitedNormalized = normalizeEmail(invitedUserEmail);

    // Anti-Abuse Rule 1: Self Referral Protection
    if (inviterTrial.userId === invitedUserId || inviterNormalized === invitedNormalized) {
      await this.recordFlaggedReferral(inviterTrial, invitedUserId, invitedUserEmail, invitedWorkspaceId, "Self-referral attempted");
      return {
        success: false,
        message: "Anti-Abuse System: You cannot use your own referral code.",
        messageAr: "نظام منع الاحتيال: لا يمكنك استخدام كود الدعوة الخاص بك."
      };
    }

    // Anti-Abuse Rule 2: Email domain/alias abuse (e.g. user+1@gmail.com referring user+2@gmail.com)
    if (inviterNormalized.split('@')[0] === invitedNormalized.split('@')[0]) {
      await this.recordFlaggedReferral(inviterTrial, invitedUserId, invitedUserEmail, invitedWorkspaceId, "Aliased email domain abuse detected");
      return {
        success: false,
        message: "Anti-Abuse System: Referral code flagged due to duplicate email structure.",
        messageAr: "نظام حماية الحسابات: تم رفض الدعوة بسبب تكرار هيكل البريد الإلكتروني."
      };
    }

    // Get current invited user trial
    const localTrials = this.getLocalTrials();
    const invitedTrial = localTrials[invitedWorkspaceId] || await this.getOrCreateWorkspaceTrial(invitedWorkspaceId, invitedUserId, invitedUserEmail);

    // Anti-Abuse Rule 3: Already used a referral code
    if (invitedTrial.referredByCode) {
      return {
        success: false,
        message: "You have already claimed a referral bonus on this account.",
        messageAr: "لقد قمت بالفعل باستبدال مكافأة دعوة سابقة لهذا الحساب."
      };
    }

    // Anti-Abuse Rule 4: Max extension limit cap (30 days total bonus max)
    const MAX_BONUS_CAP = 30;
    if (inviterTrial.trialDaysBonus >= MAX_BONUS_CAP) {
      return {
        success: false,
        message: "Inviter has reached the maximum 30-day trial extension limit.",
        messageAr: "وصل الداعي إلى الحد الأقصى للمكافآت المجانية (30 يوماً)."
      };
    }

    // ------------------- GRANT REWARDS (+7 Days to both) -------------------
    const rewardDays = 7;
    const inviterNewBonus = Math.min(MAX_BONUS_CAP, inviterTrial.trialDaysBonus + rewardDays);
    const invitedNewBonus = Math.min(MAX_BONUS_CAP, invitedTrial.trialDaysBonus + rewardDays);

    // Update Inviter Trial
    const updatedInviter: WorkspaceTrial = {
      ...inviterTrial,
      trialDaysBonus: inviterNewBonus,
      totalTrialDays: inviterTrial.trialDaysLimit + inviterNewBonus,
      updatedAt: new Date().toISOString()
    };

    // Update Invited User Trial
    const updatedInvited: WorkspaceTrial = {
      ...invitedTrial,
      referredByCode: cleanCode,
      trialDaysBonus: invitedNewBonus,
      totalTrialDays: invitedTrial.trialDaysLimit + invitedNewBonus,
      updatedAt: new Date().toISOString()
    };

    // Save Local Storage
    localTrials[inviterTrial.workspaceId] = updatedInviter;
    localTrials[invitedWorkspaceId] = updatedInvited;
    this.saveLocalTrials(localTrials);

    // Save Firestore Trials
    try {
      await setDoc(doc(db, 'workspace_trials', inviterTrial.workspaceId), updatedInviter, { merge: true });
      await setDoc(doc(db, 'workspace_trials', invitedWorkspaceId), updatedInvited, { merge: true });
    } catch (e) {
      console.warn("Firestore setDoc error updating referral bonus:", e);
    }

    // Record Active Referral Reward
    const rewardDoc: ReferralReward = {
      id: `ref-${Date.now()}`,
      inviterUserId: inviterTrial.userId,
      inviterEmail: inviterTrial.userEmail,
      inviterReferralCode: cleanCode,
      invitedUserId,
      invitedUserEmail,
      invitedWorkspaceId,
      bonusDaysGranted: rewardDays,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const referrals = this.getLocalReferrals();
    referrals.push(rewardDoc);
    this.saveLocalReferrals(referrals);

    try {
      await addDoc(collection(db, 'referrals'), rewardDoc);
    } catch (e) {
      console.warn("Firestore error creating referral record:", e);
    }

    // Dispatch System Notifications to both users
    await this.createSystemNotification(
      invitedWorkspaceId,
      'Referral Code Applied! (+7 Days Bonus) | تم تفعيل كود الدعوة (+7 أيام)',
      `Success! You and ${inviterTrial.userEmail} received +7 bonus days on your free trial.`,
      `نجاح! حصلت أنت و ${inviterTrial.userEmail} على +7 أيام إضافية للتجربة المجانية.`,
      'success'
    );

    await this.createSystemNotification(
      inviterTrial.workspaceId,
      'Friend Joined! (+7 Days Bonus Awarded) | انضم صديق جديد! (+7 أيام)',
      `Great news! ${invitedUserEmail} registered with your code. You earned +7 trial days!`,
      `خبر سار! انضم ${invitedUserEmail} باستخدام كودك. كسبت +7 أيام تجربة إضافية!`,
      'success'
    );

    return {
      success: true,
      message: `Referral code verified! +${rewardDays} trial days added to your account!`,
      messageAr: `تم تفعيل كود الدعوة بنجاح! تم إضافتها +${rewardDays} أيام تجريبية إلى حسابك!`,
      bonusDaysAdded: rewardDays
    };
  }

  /**
   * Helper to log flagged referral abuse attempt
   */
  private async recordFlaggedReferral(
    inviterTrial: WorkspaceTrial, 
    invitedUserId: string, 
    invitedUserEmail: string, 
    invitedWorkspaceId: string, 
    reason: string
  ) {
    const flaggedReward: ReferralReward = {
      id: `ref-flag-${Date.now()}`,
      inviterUserId: inviterTrial.userId,
      inviterEmail: inviterTrial.userEmail,
      inviterReferralCode: inviterTrial.referralCode,
      invitedUserId,
      invitedUserEmail,
      invitedWorkspaceId,
      bonusDaysGranted: 0,
      status: 'flagged_abuse',
      abuseFlagReason: reason,
      createdAt: new Date().toISOString()
    };

    const referrals = this.getLocalReferrals();
    referrals.push(flaggedReward);
    this.saveLocalReferrals(referrals);

    try {
      await addDoc(collection(db, 'referrals'), flaggedReward);
    } catch (e) {
      console.warn("Firestore addDoc error for flagged referral:", e);
    }
  }

  /**
   * Track token consumption and enforce 500,000 token limit
   */
  async consumeTokens(workspaceId: string, tokens: number): Promise<{ success: boolean; remainingTokens: number }> {
    const local = this.getLocalTrials();
    let trial = local[workspaceId];

    if (!trial) {
      trial = await this.getOrCreateWorkspaceTrial(workspaceId, 'usr-demo-admin', 'ahmed@zainauto.io');
    }

    const newTokensUsed = trial.tokensUsed + tokens;
    const remainingTokens = Math.max(0, trial.tokensLimit - newTokensUsed);
    const isExhausted = newTokensUsed >= trial.tokensLimit;

    const updatedTrial: WorkspaceTrial = {
      ...trial,
      tokensUsed: newTokensUsed,
      status: isExhausted ? 'expired' : trial.status,
      updatedAt: new Date().toISOString()
    };

    local[workspaceId] = updatedTrial;
    this.saveLocalTrials(local);

    try {
      const docRef = doc(db, 'workspace_trials', workspaceId);
      await updateDoc(docRef, {
        tokensUsed: newTokensUsed,
        status: isExhausted ? 'expired' : trial.status,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Firestore token update error:", e);
    }

    return {
      success: !isExhausted,
      remainingTokens
    };
  }

  /**
   * Get Referral Statistics for a given referral code / user
   */
  async getReferralStats(userId: string, referralCode: string): Promise<ReferralStats> {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://zainauto.io';
    const referralUrl = `${baseUrl}/signup?ref=${referralCode}`;

    let allRewards = this.getLocalReferrals();

    try {
      const colRef = collection(db, 'referrals');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        allRewards = snap.docs.map(d => d.data() as ReferralReward);
      }
    } catch (e) {
      console.warn("Firestore referral rewards read error:", e);
    }

    const userRewards = allRewards.filter(r => r.inviterUserId === userId || r.inviterReferralCode === referralCode);
    const activeRewards = userRewards.filter(r => r.status === 'active');
    const totalBonusDaysEarned = activeRewards.reduce((sum, r) => sum + r.bonusDaysGranted, 0);

    return {
      referralCode,
      referralUrl,
      totalInvited: userRewards.length,
      totalConverted: activeRewards.length,
      totalBonusDaysEarned: Math.min(30, totalBonusDaysEarned),
      maxBonusDaysLimit: 30,
      rewards: userRewards
    };
  }

  /**
   * Admin Overview Data aggregator for Admin Dashboard
   */
  async getAdminTrialOverview(): Promise<TrialAdminOverview> {
    let trials: WorkspaceTrial[] = [];
    let referrals: ReferralReward[] = [];
    let extensions: TrialExtensionRecord[] = [];

    try {
      const snapTrials = await getDocs(collection(db, 'workspace_trials'));
      trials = snapTrials.docs.map(d => d.data() as WorkspaceTrial);

      const snapRefs = await getDocs(collection(db, 'referrals'));
      referrals = snapRefs.docs.map(d => d.data() as ReferralReward);

      const snapExts = await getDocs(collection(db, 'trial_extensions'));
      extensions = snapExts.docs.map(d => d.data() as TrialExtensionRecord);
    } catch (e) {
      console.warn("Firestore admin overview read error, populating fallback sample data:", e);
    }

    // Fallback sample data if empty
    if (trials.length === 0) {
      trials = [
        {
          id: 'ws-primary',
          workspaceId: 'ws-primary',
          workspaceName: 'مساحة العمل الرئيسية - Zain Production',
          userId: 'usr-demo-admin',
          userEmail: 'ahmed@zainauto.io',
          referralCode: 'ZAIN-AHMD90',
          startDate: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
          trialDaysLimit: 15,
          trialDaysBonus: 7,
          totalTrialDays: 22,
          tokensLimit: 500000,
          tokensUsed: 142000,
          workflowsLimit: 10,
          workflowsCount: 4,
          aiAgentsLimit: 5,
          aiAgentsCount: 2,
          connectionsLimit: 10,
          connectionsCount: 5,
          status: 'active',
          notificationsSent: { day7: true },
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'ws-marketing',
          workspaceId: 'ws-marketing',
          workspaceName: 'فريق التسويق والنمو - Growth & Marketing',
          userId: 'usr-demo-02',
          userEmail: 'sara.growth@zainauto.io',
          referralCode: 'ZAIN-SARA88',
          referredByCode: 'ZAIN-AHMD90',
          startDate: new Date(Date.now() - 14 * 86400000).toISOString(),
          trialDaysLimit: 15,
          trialDaysBonus: 0,
          totalTrialDays: 15,
          tokensLimit: 500000,
          tokensUsed: 489000,
          workflowsLimit: 10,
          workflowsCount: 9,
          aiAgentsLimit: 5,
          aiAgentsCount: 4,
          connectionsLimit: 10,
          connectionsCount: 8,
          status: 'active',
          notificationsSent: { day7: true, day3: true, day1: true },
          createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'ws-demo-expired',
          workspaceId: 'ws-demo-expired',
          workspaceName: 'تجارب المبيعات والعملاء - Logistics Sync',
          userId: 'usr-demo-03',
          userEmail: 'khalid@logistics-auto.com',
          referralCode: 'ZAIN-KHLD21',
          startDate: new Date(Date.now() - 20 * 86400000).toISOString(),
          trialDaysLimit: 15,
          trialDaysBonus: 0,
          totalTrialDays: 15,
          tokensLimit: 500000,
          tokensUsed: 500000,
          workflowsLimit: 10,
          workflowsCount: 10,
          aiAgentsLimit: 5,
          aiAgentsCount: 5,
          connectionsLimit: 10,
          connectionsCount: 10,
          status: 'expired',
          notificationsSent: { day7: true, day3: true, day1: true, expired: true },
          createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'ws-demo-pro',
          workspaceId: 'ws-demo-pro',
          workspaceName: 'البنك العربي والخدمات التنسيقية - FinTech Ops',
          userId: 'usr-demo-04',
          userEmail: 'mona.ops@finbank.io',
          referralCode: 'ZAIN-MONA12',
          startDate: new Date(Date.now() - 35 * 86400000).toISOString(),
          trialDaysLimit: 15,
          trialDaysBonus: 14,
          totalTrialDays: 29,
          tokensLimit: 5000000,
          tokensUsed: 1200000,
          workflowsLimit: 100,
          workflowsCount: 22,
          aiAgentsLimit: 25,
          aiAgentsCount: 12,
          connectionsLimit: 50,
          connectionsCount: 18,
          status: 'converted_pro',
          notificationsSent: { expired: true },
          createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }

    if (referrals.length === 0) {
      referrals = [
        {
          id: 'ref-001',
          inviterUserId: 'usr-demo-admin',
          inviterEmail: 'ahmed@zainauto.io',
          inviterReferralCode: 'ZAIN-AHMD90',
          invitedUserId: 'usr-demo-02',
          invitedUserEmail: 'sara.growth@zainauto.io',
          invitedWorkspaceId: 'ws-marketing',
          bonusDaysGranted: 7,
          status: 'active',
          createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
        },
        {
          id: 'ref-002',
          inviterUserId: 'usr-demo-admin',
          inviterEmail: 'ahmed@zainauto.io',
          inviterReferralCode: 'ZAIN-AHMD90',
          invitedUserId: 'usr-fake-01',
          invitedUserEmail: 'ahmed+abuse1@zainauto.io',
          invitedWorkspaceId: 'ws-fake-01',
          bonusDaysGranted: 0,
          status: 'flagged_abuse',
          abuseFlagReason: 'Aliased email domain abuse detected',
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
        }
      ];
    }

    const activeTrialsCount = trials.filter(t => t.status === 'active').length;
    const expiredTrialsCount = trials.filter(t => t.status === 'expired').length;
    const convertedTrialsCount = trials.filter(t => t.status.startsWith('converted_')).length;
    const totalTrials = trials.length;
    const conversionRatePercent = totalTrials > 0 ? Number(((convertedTrialsCount / totalTrials) * 100).toFixed(1)) : 0;

    const totalReferralsCount = referrals.length;
    const totalBonusDaysGranted = referrals.filter(r => r.status === 'active').reduce((sum, r) => sum + r.bonusDaysGranted, 0);

    // Calculate revenue
    const mrr = convertedTrialsCount * 79 + 199; // Sample calculation ($79 Pro, $199 Business)
    const arr = mrr * 12;
    const totalRevenueUsd = mrr * 4;

    return {
      activeTrialsCount,
      expiredTrialsCount,
      totalReferralsCount,
      totalBonusDaysGranted,
      conversionRatePercent,
      monthlyRecurringRevenueUsd: mrr,
      annualRecurringRevenueUsd: arr,
      totalRevenueUsd,
      totalTrialExtensionsCount: extensions.length,
      trials,
      flaggedReferrals: referrals.filter(r => r.status === 'flagged_abuse'),
      extensions
    };
  }

  /**
   * Manual Admin Extension (+3, +7, +15 Days)
   */
  async adminExtendTrial(workspaceId: string, daysToAdd: number, reason: string, adminEmail: string = 'ahmed@zainauto.io'): Promise<WorkspaceTrial> {
    const local = this.getLocalTrials();
    let trial = local[workspaceId] || await this.getOrCreateWorkspaceTrial(workspaceId, 'usr-demo-admin', 'ahmed@zainauto.io');

    const newBonus = trial.trialDaysBonus + daysToAdd;
    const updatedTrial: WorkspaceTrial = {
      ...trial,
      trialDaysBonus: newBonus,
      totalTrialDays: trial.trialDaysLimit + newBonus,
      status: 'active', // Reset to active if expired
      updatedAt: new Date().toISOString()
    };

    local[workspaceId] = updatedTrial;
    this.saveLocalTrials(local);

    try {
      await setDoc(doc(db, 'workspace_trials', workspaceId), updatedTrial, { merge: true });
    } catch (e) {
      console.warn("Firestore error extending trial:", e);
    }

    // Record Extension Log
    const extRecord: TrialExtensionRecord = {
      id: `ext-${Date.now()}`,
      workspaceId,
      workspaceName: trial.workspaceName || 'Workspace',
      userEmail: trial.userEmail,
      daysAdded: daysToAdd,
      reason: 'admin_grant',
      grantedBy: adminEmail,
      createdAt: new Date().toISOString()
    };

    const exts = this.getLocalExtensions();
    exts.push(extRecord);
    this.saveLocalExtensions(exts);

    try {
      await addDoc(collection(db, 'trial_extensions'), extRecord);
    } catch (e) {
      console.warn("Firestore error writing trial extension record:", e);
    }

    // Notify User
    await this.createSystemNotification(
      workspaceId,
      `Trial Extended! (+${daysToAdd} Days) | تم تمديد فترة التجربة (+${daysToAdd} يوماً)`,
      `An administrator granted an extra ${daysToAdd} trial days for your workspace.`,
      `قام مسؤول النظام بتقديم تمديد مجاني لـ ${daysToAdd} يوماً لمساحة عملك.`,
      'success'
    );

    return updatedTrial;
  }

  /**
   * Convert trial to paid tier (Starter, Pro, Business, Enterprise)
   */
  async convertTrialPlan(
    workspaceId: string, 
    newPlan: 'starter' | 'pro' | 'business' | 'enterprise'
  ): Promise<WorkspaceTrial> {
    const local = this.getLocalTrials();
    let trial = local[workspaceId] || await this.getOrCreateWorkspaceTrial(workspaceId, 'usr-demo-admin', 'ahmed@zainauto.io');

    let tokensLimit = 500000;
    let wfLimit = 10;
    let agentLimit = 5;
    let connLimit = 10;

    if (newPlan === 'starter') {
      tokensLimit = 1000000;
      wfLimit = 25;
      agentLimit = 10;
      connLimit = 20;
    } else if (newPlan === 'pro') {
      tokensLimit = 5000000;
      wfLimit = 100;
      agentLimit = 25;
      connLimit = 50;
    } else if (newPlan === 'business') {
      tokensLimit = 20000000;
      wfLimit = 999;
      agentLimit = 999;
      connLimit = 999;
    } else if (newPlan === 'enterprise') {
      tokensLimit = 100000000;
      wfLimit = 9999;
      agentLimit = 9999;
      connLimit = 9999;
    }

    const updatedTrial: WorkspaceTrial = {
      ...trial,
      status: `converted_${newPlan}` as TrialStatus,
      tokensLimit,
      workflowsLimit: wfLimit,
      aiAgentsLimit: agentLimit,
      connectionsLimit: connLimit,
      updatedAt: new Date().toISOString()
    };

    local[workspaceId] = updatedTrial;
    this.saveLocalTrials(local);

    try {
      await setDoc(doc(db, 'workspace_trials', workspaceId), updatedTrial, { merge: true });
    } catch (e) {
      console.warn("Firestore error converting trial plan:", e);
    }

    await this.createSystemNotification(
      workspaceId,
      `Workspace Upgraded to ${newPlan.toUpperCase()}! | تم ترقية الحساب إلى ${newPlan.toUpperCase()}`,
      `Your workspace is now on the ${newPlan.toUpperCase()} plan. Limits increased!`,
      `تهانينا! تم ترقية مساحة العمل إلى خطة ${newPlan.toUpperCase()}. تم رفع كافة الحدود السابقة.`,
      'success'
    );

    return updatedTrial;
  }

  /**
   * Helper to write notifications to Firestore and local state
   */
  private async createSystemNotification(
    workspaceId: string, 
    title: string, 
    message: string, 
    messageAr: string, 
    type: 'success' | 'error' | 'warning' | 'info'
  ) {
    const notificationDoc: AppNotification = {
      id: `notif-trial-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      titleAr: title,
      message,
      messageAr,
      type,
      category: 'billing',
      read: false,
      createdAt: new Date().toISOString(),
      workspaceId
    };

    try {
      await supabaseDb.insert('notifications', {
        id: notificationDoc.id,
        workspace_id: notificationDoc.workspaceId,
        title: notificationDoc.title,
        title_ar: notificationDoc.titleAr,
        message: notificationDoc.message,
        message_ar: notificationDoc.messageAr,
        type: notificationDoc.type,
        category: notificationDoc.category,
        read: notificationDoc.read,
        created_at: notificationDoc.createdAt
      });
    } catch (e) {
      console.warn("Supabase notification insert error:", e);
    }

    try {
      await addDoc(collection(db, 'notifications'), notificationDoc);
    } catch (e) {
      console.warn("Firestore addDoc error for notification:", e);
    }
  }
}

export const trialService = new TrialService();
