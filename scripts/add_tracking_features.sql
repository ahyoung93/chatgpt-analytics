-- Add revenue tracking, prompt_hash, and user_hash to events table

-- Add revenue and currency columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='events' AND column_name='revenue') THEN
        ALTER TABLE events ADD COLUMN revenue DECIMAL(10, 2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='events' AND column_name='currency') THEN
        ALTER TABLE events ADD COLUMN currency TEXT DEFAULT 'USD';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='events' AND column_name='user_hash') THEN
        ALTER TABLE events ADD COLUMN user_hash TEXT;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_revenue ON events(revenue) WHERE revenue IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_user_hash ON events(user_hash) WHERE user_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_prompt_hash ON events(prompt_hash) WHERE prompt_hash IS NOT NULL;

-- Create retention metrics table for cohort analysis
CREATE TABLE IF NOT EXISTS retention_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    cohort_date DATE NOT NULL,
    cohort_size INTEGER NOT NULL,
    day_1_retained INTEGER DEFAULT 0,
    day_7_retained INTEGER DEFAULT 0,
    day_30_retained INTEGER DEFAULT 0,
    day_1_retention_rate DECIMAL(5, 2),
    day_7_retention_rate DECIMAL(5, 2),
    day_30_retention_rate DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(app_id, cohort_date)
);

CREATE INDEX IF NOT EXISTS idx_retention_metrics_app_id ON retention_metrics(app_id);
CREATE INDEX IF NOT EXISTS idx_retention_metrics_cohort_date ON retention_metrics(cohort_date);

-- Enable RLS on retention_metrics
ALTER TABLE retention_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS retention_metrics_select_own ON retention_metrics;
CREATE POLICY retention_metrics_select_own ON retention_metrics FOR SELECT USING (
    app_id IN (
        SELECT a.id FROM apps a
        JOIN org_members om ON a.org_id = om.org_id
        WHERE om.user_id = auth.uid()
    )
);

-- Function to calculate retention metrics (run via cron)
CREATE OR REPLACE FUNCTION calculate_retention_metrics(target_app_id UUID, target_cohort_date DATE)
RETURNS VOID AS $$
DECLARE
    cohort_users TEXT[];
    cohort_count INTEGER;
    day1_count INTEGER;
    day7_count INTEGER;
    day30_count INTEGER;
BEGIN
    -- Get all unique user_hashes that had their first event on cohort_date
    SELECT ARRAY_AGG(DISTINCT user_hash) INTO cohort_users
    FROM events
    WHERE app_id = target_app_id
        AND user_hash IS NOT NULL
        AND DATE(timestamp) = target_cohort_date
        AND NOT EXISTS (
            SELECT 1 FROM events e2
            WHERE e2.app_id = target_app_id
                AND e2.user_hash = events.user_hash
                AND DATE(e2.timestamp) < target_cohort_date
        );

    cohort_count := COALESCE(array_length(cohort_users, 1), 0);

    IF cohort_count > 0 THEN
        -- Day 1 retention: users who returned the next day
        SELECT COUNT(DISTINCT user_hash) INTO day1_count
        FROM events
        WHERE app_id = target_app_id
            AND user_hash = ANY(cohort_users)
            AND DATE(timestamp) = target_cohort_date + INTERVAL '1 day';

        -- Day 7 retention: users who returned within 7 days
        SELECT COUNT(DISTINCT user_hash) INTO day7_count
        FROM events
        WHERE app_id = target_app_id
            AND user_hash = ANY(cohort_users)
            AND DATE(timestamp) > target_cohort_date
            AND DATE(timestamp) <= target_cohort_date + INTERVAL '7 days';

        -- Day 30 retention: users who returned within 30 days
        SELECT COUNT(DISTINCT user_hash) INTO day30_count
        FROM events
        WHERE app_id = target_app_id
            AND user_hash = ANY(cohort_users)
            AND DATE(timestamp) > target_cohort_date
            AND DATE(timestamp) <= target_cohort_date + INTERVAL '30 days';

        -- Insert or update retention metrics
        INSERT INTO retention_metrics (
            app_id,
            cohort_date,
            cohort_size,
            day_1_retained,
            day_7_retained,
            day_30_retained,
            day_1_retention_rate,
            day_7_retention_rate,
            day_30_retention_rate
        )
        VALUES (
            target_app_id,
            target_cohort_date,
            cohort_count,
            day1_count,
            day7_count,
            day30_count,
            (day1_count::DECIMAL / cohort_count * 100),
            (day7_count::DECIMAL / cohort_count * 100),
            (day30_count::DECIMAL / cohort_count * 100)
        )
        ON CONFLICT (app_id, cohort_date)
        DO UPDATE SET
            cohort_size = EXCLUDED.cohort_size,
            day_1_retained = EXCLUDED.day_1_retained,
            day_7_retained = EXCLUDED.day_7_retained,
            day_30_retained = EXCLUDED.day_30_retained,
            day_1_retention_rate = EXCLUDED.day_1_retention_rate,
            day_7_retention_rate = EXCLUDED.day_7_retention_rate,
            day_30_retention_rate = EXCLUDED.day_30_retention_rate,
            updated_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for retention_metrics updated_at
DROP TRIGGER IF EXISTS update_retention_metrics_updated_at ON retention_metrics;
CREATE TRIGGER update_retention_metrics_updated_at
    BEFORE UPDATE ON retention_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE retention_metrics IS 'User retention cohort analysis (privacy-preserving with hashes)';
COMMENT ON COLUMN events.revenue IS 'Revenue in decimal for converted events';
COMMENT ON COLUMN events.currency IS 'Currency code (default USD)';
COMMENT ON COLUMN events.user_hash IS 'SHA-256 hash of user ID for anonymous retention tracking';
COMMENT ON COLUMN events.prompt_hash IS 'SHA-256 hash of prompt for pattern analysis';
