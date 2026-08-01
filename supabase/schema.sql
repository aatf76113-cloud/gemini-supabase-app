-- ====================================================================
-- Zain Automation - Supabase PostgreSQL Schema & Row Level Security (RLS)
-- Multi-Tenant Enterprise SaaS Architecture
-- ====================================================================

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE (User profiles synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    photo_url TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'user', 'viewer')),
    language TEXT DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKSPACES TABLE (Multi-tenant workspaces)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    plan TEXT DEFAULT 'pro' CHECK (plan IN ('free', 'starter', 'pro', 'business', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WORKSPACE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'Editor' CHECK (role IN ('Owner', 'Admin', 'Editor', 'Viewer')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'revoked')),
    invited_by TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.invitations (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    workspace_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'Editor',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    invited_by TEXT NOT NULL,
    invited_by_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WORKFLOWS TABLE
CREATE TABLE IF NOT EXISTS public.workflows (
    id TEXT PRIMARY KEY,
    workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    description_ar TEXT,
    category TEXT DEFAULT 'Automation',
    active BOOLEAN DEFAULT TRUE,
    executions_count INT DEFAULT 0,
    success_count INT DEFAULT 0,
    last_run_at TIMESTAMPTZ,
    trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    steps_config JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EXECUTION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.execution_logs (
    id TEXT PRIMARY KEY,
    workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE,
    workflow_id TEXT REFERENCES public.workflows(id) ON DELETE CASCADE,
    workflow_name TEXT NOT NULL,
    workflow_name_ar TEXT,
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'running')),
    duration_ms INT DEFAULT 0,
    triggered_by TEXT,
    error TEXT,
    steps_log JSONB DEFAULT '[]'::jsonb,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AI AGENTS TABLE
CREATE TABLE IF NOT EXISTS public.ai_agents (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL DEFAULT 'ws-primary',
    name TEXT NOT NULL,
    name_ar TEXT,
    avatar TEXT DEFAULT '🤖',
    role TEXT DEFAULT 'Manager',
    description TEXT,
    description_ar TEXT,
    personality JSONB NOT NULL DEFAULT '{}'::jsonb,
    goals JSONB DEFAULT '[]'::jsonb,
    memory JSONB DEFAULT '{}'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    permissions JSONB DEFAULT '{}'::jsonb,
    primary_provider TEXT DEFAULT 'gemini',
    model TEXT DEFAULT 'gemini-2.5-flash',
    fallback_providers JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active',
    stats JSONB DEFAULT '{}'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. APP CONNECTIONS / SECRETS TABLE
CREATE TABLE IF NOT EXISTS public.app_connections (
    id TEXT PRIMARY KEY,
    workspace_id TEXT DEFAULT 'ws-primary',
    user_id TEXT,
    service TEXT NOT NULL,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT,
    icon TEXT,
    category TEXT,
    status TEXT DEFAULT 'connected',
    connection_type TEXT DEFAULT 'api_key',
    auth_type TEXT,
    api_key TEXT,
    access_token TEXT,
    refresh_token TEXT,
    oauth_account TEXT,
    webhook_url TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    workspace_id TEXT DEFAULT 'ws-primary',
    title TEXT NOT NULL,
    title_ar TEXT,
    message TEXT NOT NULL,
    message_ar TEXT,
    type TEXT DEFAULT 'info' CHECK (type IN ('success', 'error', 'warning', 'info')),
    category TEXT DEFAULT 'system',
    read BOOLEAN DEFAULT FALSE,
    link_tab TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    workspace_id TEXT DEFAULT 'ws-primary',
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. WORKSPACE TRIALS TABLE (SaaS 15-Day Free Trial & Tokens)
CREATE TABLE IF NOT EXISTS public.workspace_trials (
    id TEXT PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
    workspace_id TEXT NOT NULL,
    workspace_name TEXT,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by_code TEXT,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    trial_days_limit INT DEFAULT 15,
    trial_days_bonus INT DEFAULT 0,
    total_trial_days INT DEFAULT 15,
    tokens_limit BIGINT DEFAULT 500000,
    tokens_used BIGINT DEFAULT 0,
    workflows_limit INT DEFAULT 10,
    workflows_count INT DEFAULT 0,
    ai_agents_limit INT DEFAULT 5,
    ai_agents_count INT DEFAULT 0,
    connections_limit INT DEFAULT 10,
    connections_count INT DEFAULT 0,
    status TEXT DEFAULT 'active',
    notifications_sent JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
    id TEXT PRIMARY KEY,
    inviter_user_id TEXT NOT NULL,
    inviter_email TEXT NOT NULL,
    inviter_referral_code TEXT NOT NULL,
    invited_user_id TEXT NOT NULL,
    invited_user_email TEXT NOT NULL,
    invited_workspace_id TEXT NOT NULL,
    bonus_days_granted INT DEFAULT 7,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'flagged_abuse', 'expired')),
    abuse_flag_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL,
    workspace_id TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    amount_usd NUMERIC(10, 2) NOT NULL,
    gateway_used TEXT NOT NULL,
    status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percent INT NOT NULL,
    valid_until TIMESTAMPTZ,
    max_uses INT DEFAULT 500,
    current_uses INT DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Allow public read/write policies for application access (or user-scoped authentication)
CREATE POLICY "Public Profiles Access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Workspaces Access" ON public.workspaces FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Workspace Members Access" ON public.workspace_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Invitations Access" ON public.invitations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Workflows Access" ON public.workflows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Execution Logs Access" ON public.execution_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public AI Agents Access" ON public.ai_agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public App Connections Access" ON public.app_connections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Notifications Access" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Audit Logs Access" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Workspace Trials Access" ON public.workspace_trials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Referrals Access" ON public.referrals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Invoices Access" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Coupons Access" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- SUPABASE STORAGE BUCKET CREATION
-- ====================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('zain-assets', 'zain-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Storage Access" ON storage.objects 
FOR ALL USING (bucket_id = 'zain-assets') WITH CHECK (bucket_id = 'zain-assets');
