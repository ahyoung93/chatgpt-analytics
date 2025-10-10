-- ChatGPT App Analytics Platform Database Schema
-- For tracking ChatGPT App performance

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- APP CATEGORIES (ENUM)
-- ============================================
DO $$ BEGIN
    CREATE TYPE app_category AS ENUM (
        'travel',
        'productivity',
        'dev_tools',
        'shopping',
        'education',
        'entertainment',
        'customer_support',
        'content_generation',
        'data_analysis',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- EVENT TYPES (ENUM)
-- ============================================
DO $$ BEGIN
    CREATE TYPE event_type AS ENUM (
        'invoked',      -- App was called
        'completed',    -- App succeeded
        'error',        -- App failed
        'converted',    -- User achieved goal
        'custom'        -- Developer-defined event
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- PLAN TIERS (ENUM)
-- ============================================
DO $$ BEGIN
    CREATE TYPE plan_tier AS ENUM (
        'free',         -- 7 days retention, 1 app
        'pro',          -- 90 days retention, 5 apps, benchmarks, CSV
        'team'          -- 180 days retention, unlimited apps
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orgs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    plan plan_tier DEFAULT 'free' NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    subscription_id TEXT,
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORG MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS org_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, email)
);

-- Add user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='org_members' AND column_name='user_id') THEN
        ALTER TABLE org_members ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- APPS TABLE (Developer's ChatGPT Apps)
-- ============================================
CREATE TABLE IF NOT EXISTS apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category app_category NOT NULL,
    description TEXT,
    write_key TEXT UNIQUE NOT NULL DEFAULT 'sk_' || encode(gen_random_bytes(32), 'hex'),
    rate_limit_per_sec INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, name)
);

-- ============================================
-- EVENTS TABLE (Raw event data)
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    event_type event_type NOT NULL,
    event_name TEXT,
    properties JSONB DEFAULT '{}',
    prompt_hash TEXT,  -- Optional: SHA-256 hash of prompt for deduplication
    error_message TEXT,
    latency_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- APP DAILY METRICS TABLE (Aggregated stats)
-- ============================================
CREATE TABLE IF NOT EXISTS app_daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    invoked_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    converted_count INTEGER DEFAULT 0,
    custom_count INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    avg_latency_ms INTEGER,
    success_rate DECIMAL(5, 2),  -- Percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(app_id, date)
);

-- ============================================
-- CATEGORY DAILY BENCHMARKS TABLE
-- (Privacy-protected with k-anonymity ≥7)
-- ============================================
CREATE TABLE IF NOT EXISTS category_daily_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category app_category NOT NULL,
    date DATE NOT NULL,
    app_count INTEGER NOT NULL,  -- Must be ≥7 for k-anonymity
    avg_invoked_count DECIMAL(10, 2),
    avg_completed_count DECIMAL(10, 2),
    avg_error_count DECIMAL(10, 2),
    avg_success_rate DECIMAL(5, 2),
    avg_latency_ms INTEGER,
    p50_success_rate DECIMAL(5, 2),
    p75_success_rate DECIMAL(5, 2),
    p90_success_rate DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, date)
);

-- ============================================
-- STRIPE CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stripe_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE UNIQUE,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    plan plan_tier NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON orgs(slug);
CREATE INDEX IF NOT EXISTS idx_orgs_stripe_customer_id ON orgs(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_email ON org_members(email);

CREATE INDEX IF NOT EXISTS idx_apps_org_id ON apps(org_id);
CREATE INDEX IF NOT EXISTS idx_apps_write_key ON apps(write_key);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);

CREATE INDEX IF NOT EXISTS idx_events_app_id ON events(app_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_app_id_timestamp ON events(app_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_app_daily_metrics_app_id ON app_daily_metrics(app_id);
CREATE INDEX IF NOT EXISTS idx_app_daily_metrics_date ON app_daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_app_daily_metrics_app_id_date ON app_daily_metrics(app_id, date);

CREATE INDEX IF NOT EXISTS idx_category_daily_benchmarks_category ON category_daily_benchmarks(category);
CREATE INDEX IF NOT EXISTS idx_category_daily_benchmarks_date ON category_daily_benchmarks(date);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate daily app metrics
CREATE OR REPLACE FUNCTION aggregate_app_daily_metrics(target_app_id UUID, target_date DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO app_daily_metrics (
        app_id,
        date,
        invoked_count,
        completed_count,
        error_count,
        converted_count,
        custom_count,
        total_events,
        avg_latency_ms,
        success_rate
    )
    SELECT
        target_app_id,
        target_date,
        COUNT(*) FILTER (WHERE event_type = 'invoked') as invoked_count,
        COUNT(*) FILTER (WHERE event_type = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE event_type = 'error') as error_count,
        COUNT(*) FILTER (WHERE event_type = 'converted') as converted_count,
        COUNT(*) FILTER (WHERE event_type = 'custom') as custom_count,
        COUNT(*) as total_events,
        AVG(latency_ms)::INTEGER as avg_latency_ms,
        CASE
            WHEN COUNT(*) FILTER (WHERE event_type IN ('invoked', 'completed', 'error')) > 0
            THEN (COUNT(*) FILTER (WHERE event_type = 'completed')::DECIMAL /
                  NULLIF(COUNT(*) FILTER (WHERE event_type IN ('invoked', 'completed', 'error')), 0) * 100)
            ELSE 0
        END as success_rate
    FROM events
    WHERE app_id = target_app_id
        AND DATE(timestamp) = target_date
    ON CONFLICT (app_id, date)
    DO UPDATE SET
        invoked_count = EXCLUDED.invoked_count,
        completed_count = EXCLUDED.completed_count,
        error_count = EXCLUDED.error_count,
        converted_count = EXCLUDED.converted_count,
        custom_count = EXCLUDED.custom_count,
        total_events = EXCLUDED.total_events,
        avg_latency_ms = EXCLUDED.avg_latency_ms,
        success_rate = EXCLUDED.success_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate category benchmarks (with k-anonymity)
CREATE OR REPLACE FUNCTION aggregate_category_benchmarks(target_category app_category, target_date DATE)
RETURNS VOID AS $$
DECLARE
    app_count_in_category INTEGER;
BEGIN
    -- Count apps in category with data on target date
    SELECT COUNT(DISTINCT m.app_id)
    INTO app_count_in_category
    FROM app_daily_metrics m
    JOIN apps a ON m.app_id = a.id
    WHERE a.category = target_category
        AND m.date = target_date;

    -- Only aggregate if k-anonymity requirement met (≥7 apps)
    IF app_count_in_category >= 7 THEN
        INSERT INTO category_daily_benchmarks (
            category,
            date,
            app_count,
            avg_invoked_count,
            avg_completed_count,
            avg_error_count,
            avg_success_rate,
            avg_latency_ms,
            p50_success_rate,
            p75_success_rate,
            p90_success_rate
        )
        SELECT
            target_category,
            target_date,
            app_count_in_category,
            AVG(m.invoked_count) as avg_invoked_count,
            AVG(m.completed_count) as avg_completed_count,
            AVG(m.error_count) as avg_error_count,
            AVG(m.success_rate) as avg_success_rate,
            AVG(m.avg_latency_ms)::INTEGER as avg_latency_ms,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY m.success_rate) as p50_success_rate,
            PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY m.success_rate) as p75_success_rate,
            PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY m.success_rate) as p90_success_rate
        FROM app_daily_metrics m
        JOIN apps a ON m.app_id = a.id
        WHERE a.category = target_category
            AND m.date = target_date
        ON CONFLICT (category, date)
        DO UPDATE SET
            app_count = EXCLUDED.app_count,
            avg_invoked_count = EXCLUDED.avg_invoked_count,
            avg_completed_count = EXCLUDED.avg_completed_count,
            avg_error_count = EXCLUDED.avg_error_count,
            avg_success_rate = EXCLUDED.avg_success_rate,
            avg_latency_ms = EXCLUDED.avg_latency_ms,
            p50_success_rate = EXCLUDED.p50_success_rate,
            p75_success_rate = EXCLUDED.p75_success_rate,
            p90_success_rate = EXCLUDED.p90_success_rate,
            created_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check if org can create more apps based on plan
CREATE OR REPLACE FUNCTION can_create_app(org_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    org_plan plan_tier;
    current_app_count INTEGER;
BEGIN
    SELECT plan INTO org_plan FROM orgs WHERE id = org_uuid;
    SELECT COUNT(*) INTO current_app_count FROM apps WHERE org_id = org_uuid;

    CASE org_plan
        WHEN 'free' THEN RETURN current_app_count < 1;
        WHEN 'pro' THEN RETURN current_app_count < 5;
        WHEN 'team' THEN RETURN true;  -- Unlimited
        ELSE RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to get data retention days for plan
CREATE OR REPLACE FUNCTION get_retention_days(org_plan plan_tier)
RETURNS INTEGER AS $$
BEGIN
    CASE org_plan
        WHEN 'free' THEN RETURN 7;
        WHEN 'pro' THEN RETURN 90;
        WHEN 'team' THEN RETURN 180;
        ELSE RETURN 7;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old events based on org plan
CREATE OR REPLACE FUNCTION cleanup_old_events()
RETURNS VOID AS $$
BEGIN
    DELETE FROM events e
    USING apps a, orgs o
    WHERE e.app_id = a.id
        AND a.org_id = o.id
        AND e.timestamp < NOW() - (get_retention_days(o.plan) || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at for orgs
DROP TRIGGER IF EXISTS update_orgs_updated_at ON orgs;
CREATE TRIGGER update_orgs_updated_at
    BEFORE UPDATE ON orgs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for apps
DROP TRIGGER IF EXISTS update_apps_updated_at ON apps;
CREATE TRIGGER update_apps_updated_at
    BEFORE UPDATE ON apps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for app_daily_metrics
DROP TRIGGER IF EXISTS update_app_daily_metrics_updated_at ON app_daily_metrics;
CREATE TRIGGER update_app_daily_metrics_updated_at
    BEFORE UPDATE ON app_daily_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_daily_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS orgs_select_member ON orgs;
DROP POLICY IF EXISTS org_members_select_own ON org_members;
DROP POLICY IF EXISTS apps_select_own_org ON apps;
DROP POLICY IF EXISTS apps_insert_own_org ON apps;
DROP POLICY IF EXISTS apps_update_own_org ON apps;
DROP POLICY IF EXISTS events_select_own_apps ON events;
DROP POLICY IF EXISTS app_daily_metrics_select_own ON app_daily_metrics;
DROP POLICY IF EXISTS category_benchmarks_select_pro_team ON category_daily_benchmarks;
DROP POLICY IF EXISTS subscriptions_select_own_org ON subscriptions;

-- Orgs: Members can read their own org
CREATE POLICY orgs_select_member ON orgs
    FOR SELECT USING (
        id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    );

-- Org members: Can read members of own org
CREATE POLICY org_members_select_own ON org_members
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    );

-- Apps: Members can manage apps in their org
CREATE POLICY apps_select_own_org ON apps
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    );

CREATE POLICY apps_insert_own_org ON apps
    FOR INSERT WITH CHECK (
        org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    );

CREATE POLICY apps_update_own_org ON apps
    FOR UPDATE USING (
        org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    );

-- Events: Members can read events for their apps
CREATE POLICY events_select_own_apps ON events
    FOR SELECT USING (
        app_id IN (
            SELECT a.id FROM apps a
            JOIN org_members om ON a.org_id = om.org_id
            WHERE om.user_id = auth.uid()
        )
    );

-- App daily metrics: Members can read metrics for their apps
CREATE POLICY app_daily_metrics_select_own ON app_daily_metrics
    FOR SELECT USING (
        app_id IN (
            SELECT a.id FROM apps a
            JOIN org_members om ON a.org_id = om.org_id
            WHERE om.user_id = auth.uid()
        )
    );

-- Category benchmarks: Pro/Team plan members can read (k-anonymity enforced in function)
CREATE POLICY category_benchmarks_select_pro_team ON category_daily_benchmarks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orgs o
            JOIN org_members om ON o.id = om.org_id
            WHERE om.user_id = auth.uid()
                AND o.plan IN ('pro', 'team')
        )
    );

-- Subscriptions: Members can read their org's subscription
CREATE POLICY subscriptions_select_own_org ON subscriptions
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    );

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE orgs IS 'Organizations (teams) that own ChatGPT apps';
COMMENT ON TABLE org_members IS 'Team members with access to org';
COMMENT ON TABLE apps IS 'ChatGPT apps being tracked (Custom GPTs, Plugins, MCP servers)';
COMMENT ON TABLE events IS 'Raw event data: invoked, completed, error, converted, custom';
COMMENT ON TABLE app_daily_metrics IS 'Aggregated daily metrics per app';
COMMENT ON TABLE category_daily_benchmarks IS 'Privacy-protected category benchmarks (k-anonymity ≥7)';
COMMENT ON TABLE subscriptions IS 'Stripe subscription information';

COMMENT ON COLUMN apps.write_key IS 'API key for /api/track endpoint (x-app-key header)';
COMMENT ON COLUMN events.prompt_hash IS 'Optional SHA-256 hash for deduplication (no PII)';
COMMENT ON COLUMN category_daily_benchmarks.app_count IS 'Must be ≥7 for k-anonymity protection';
