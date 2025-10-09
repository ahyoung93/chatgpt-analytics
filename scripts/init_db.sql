-- ChatGPT Analytics Platform Database Schema
-- This script creates all necessary tables, functions, and policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    stripe_customer_id TEXT UNIQUE,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
    subscription_id TEXT,
    api_key TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64'),
    api_calls_limit INTEGER DEFAULT 1000,
    api_calls_used INTEGER DEFAULT 0,
    api_calls_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CHAT_SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    title TEXT,
    model TEXT,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 6) DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, session_id)
);

-- ============================================
-- CHAT_MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    model TEXT,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0,
    latency_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USAGE_METRICS TABLE (Aggregated Daily Stats)
-- ============================================
CREATE TABLE IF NOT EXISTS usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_sessions INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 6) DEFAULT 0,
    avg_latency_ms INTEGER,
    models_used JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ============================================
-- BILLING_HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS billing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_invoice_id TEXT UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    invoice_url TEXT,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- API_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EXPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    format TEXT NOT NULL CHECK (format IN ('csv', 'json', 'pdf')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_url TEXT,
    file_size INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_id ON usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_date ON usage_metrics(date);

CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_stripe_invoice_id ON billing_history(stripe_invoice_id);

CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_exports_user_id ON exports(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON exports(status);

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

-- Function to aggregate daily metrics
CREATE OR REPLACE FUNCTION aggregate_daily_metrics(target_user_id UUID, target_date DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO usage_metrics (user_id, date, total_sessions, total_messages, total_tokens, total_cost, avg_latency_ms, models_used)
    SELECT
        target_user_id,
        target_date,
        COUNT(DISTINCT cs.id) as total_sessions,
        COUNT(cm.id) as total_messages,
        COALESCE(SUM(cm.total_tokens), 0) as total_tokens,
        COALESCE(SUM(cm.cost), 0) as total_cost,
        COALESCE(AVG(cm.latency_ms)::INTEGER, 0) as avg_latency_ms,
        COALESCE(
            jsonb_object_agg(
                cm.model,
                COUNT(*)
            ) FILTER (WHERE cm.model IS NOT NULL),
            '{}'::jsonb
        ) as models_used
    FROM chat_sessions cs
    LEFT JOIN chat_messages cm ON cs.id = cm.session_id
    WHERE cs.user_id = target_user_id
        AND DATE(cm.timestamp) = target_date
    GROUP BY target_user_id, target_date
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        total_sessions = EXCLUDED.total_sessions,
        total_messages = EXCLUDED.total_messages,
        total_tokens = EXCLUDED.total_tokens,
        total_cost = EXCLUDED.total_cost,
        avg_latency_ms = EXCLUDED.avg_latency_ms,
        models_used = EXCLUDED.models_used,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to reset API call limits monthly
CREATE OR REPLACE FUNCTION reset_api_limits()
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET
        api_calls_used = 0,
        api_calls_reset_at = NOW() + INTERVAL '1 month'
    WHERE api_calls_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at for users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for chat_sessions
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for usage_metrics
DROP TRIGGER IF EXISTS update_usage_metrics_updated_at ON usage_metrics;
CREATE TRIGGER update_usage_metrics_updated_at
    BEFORE UPDATE ON usage_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

-- Chat sessions policies
CREATE POLICY chat_sessions_select_own ON chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY chat_sessions_insert_own ON chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY chat_sessions_update_own ON chat_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY chat_messages_select_own ON chat_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY chat_messages_insert_own ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usage metrics policies
CREATE POLICY usage_metrics_select_own ON usage_metrics
    FOR SELECT USING (auth.uid() = user_id);

-- Billing history policies
CREATE POLICY billing_history_select_own ON billing_history
    FOR SELECT USING (auth.uid() = user_id);

-- API logs policies
CREATE POLICY api_logs_select_own ON api_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Exports policies
CREATE POLICY exports_select_own ON exports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY exports_insert_own ON exports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY exports_update_own ON exports
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- INITIAL DATA / SEED
-- ============================================

-- Create a sample free tier configuration
-- (This can be customized based on your pricing model)

COMMENT ON TABLE users IS 'Stores user accounts and subscription information';
COMMENT ON TABLE chat_sessions IS 'Stores ChatGPT conversation sessions';
COMMENT ON TABLE chat_messages IS 'Stores individual messages within chat sessions';
COMMENT ON TABLE usage_metrics IS 'Aggregated daily usage metrics for analytics';
COMMENT ON TABLE billing_history IS 'Stripe billing and invoice history';
COMMENT ON TABLE api_logs IS 'API request logs for monitoring and debugging';
COMMENT ON TABLE exports IS 'Data export requests and status';
