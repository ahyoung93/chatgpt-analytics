-- Automatic Cleanup System for Old Events
-- Deletes events based on plan retention limits

-- ============================================
-- 1. CREATE CLEANUP LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS cleanup_logs (
  id BIGSERIAL PRIMARY KEY,
  run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  events_deleted INTEGER NOT NULL DEFAULT 0,
  free_tier_deleted INTEGER NOT NULL DEFAULT 0,
  pro_tier_deleted INTEGER NOT NULL DEFAULT 0,
  team_tier_deleted INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_cleanup_logs_run_at ON cleanup_logs(run_at DESC);

COMMENT ON TABLE cleanup_logs IS 'Logs for automatic cleanup jobs tracking deleted events';

-- ============================================
-- 2. CREATE CLEANUP FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_old_events(dry_run BOOLEAN DEFAULT FALSE)
RETURNS TABLE(
  events_deleted INTEGER,
  free_tier_deleted INTEGER,
  pro_tier_deleted INTEGER,
  team_tier_deleted INTEGER
) AS $$
DECLARE
  free_deleted INTEGER := 0;
  pro_deleted INTEGER := 0;
  team_deleted INTEGER := 0;
  total_deleted INTEGER := 0;
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  duration INTEGER;
BEGIN
  start_time := clock_timestamp();

  -- ============================================
  -- Delete events older than 7 days for FREE tier apps
  -- ============================================
  IF dry_run THEN
    -- Just count, don't delete
    SELECT COUNT(*) INTO free_deleted
    FROM events
    WHERE timestamp < NOW() - INTERVAL '7 days'
    AND app_id IN (
      SELECT apps.id FROM apps
      JOIN orgs ON apps.org_id = orgs.id
      WHERE orgs.plan = 'free'
    );
  ELSE
    -- Actually delete
    WITH deleted_free AS (
      DELETE FROM events
      WHERE timestamp < NOW() - INTERVAL '7 days'
      AND app_id IN (
        SELECT apps.id FROM apps
        JOIN orgs ON apps.org_id = orgs.id
        WHERE orgs.plan = 'free'
      )
      RETURNING *
    )
    SELECT COUNT(*) INTO free_deleted FROM deleted_free;
  END IF;

  -- ============================================
  -- Delete events older than 90 days for PRO tier apps
  -- ============================================
  IF dry_run THEN
    SELECT COUNT(*) INTO pro_deleted
    FROM events
    WHERE timestamp < NOW() - INTERVAL '90 days'
    AND app_id IN (
      SELECT apps.id FROM apps
      JOIN orgs ON apps.org_id = orgs.id
      WHERE orgs.plan = 'pro'
    );
  ELSE
    WITH deleted_pro AS (
      DELETE FROM events
      WHERE timestamp < NOW() - INTERVAL '90 days'
      AND app_id IN (
        SELECT apps.id FROM apps
        JOIN orgs ON apps.org_id = orgs.id
        WHERE orgs.plan = 'pro'
      )
      RETURNING *
    )
    SELECT COUNT(*) INTO pro_deleted FROM deleted_pro;
  END IF;

  -- ============================================
  -- Delete events older than 180 days for TEAM tier apps
  -- ============================================
  IF dry_run THEN
    SELECT COUNT(*) INTO team_deleted
    FROM events
    WHERE timestamp < NOW() - INTERVAL '180 days'
    AND app_id IN (
      SELECT apps.id FROM apps
      JOIN orgs ON apps.org_id = orgs.id
      WHERE orgs.plan = 'team'
    );
  ELSE
    WITH deleted_team AS (
      DELETE FROM events
      WHERE timestamp < NOW() - INTERVAL '180 days'
      AND app_id IN (
        SELECT apps.id FROM apps
        JOIN orgs ON apps.org_id = orgs.id
        WHERE orgs.plan = 'team'
      )
      RETURNING *
    )
    SELECT COUNT(*) INTO team_deleted FROM deleted_team;
  END IF;

  total_deleted := free_deleted + pro_deleted + team_deleted;

  -- Calculate duration
  end_time := clock_timestamp();
  duration := EXTRACT(MILLISECONDS FROM (end_time - start_time))::INTEGER;

  -- Log the cleanup (only if not dry run)
  IF NOT dry_run THEN
    INSERT INTO cleanup_logs (
      events_deleted,
      free_tier_deleted,
      pro_tier_deleted,
      team_tier_deleted,
      duration_ms,
      success
    ) VALUES (
      total_deleted,
      free_deleted,
      pro_deleted,
      team_deleted,
      duration,
      true
    );
  END IF;

  -- Log to server
  RAISE NOTICE 'Cleanup complete (dry_run=%): % total (Free: %, Pro: %, Team: %) in % ms',
    dry_run, total_deleted, free_deleted, pro_deleted, team_deleted, duration;

  RETURN QUERY SELECT total_deleted, free_deleted, pro_deleted, team_deleted;

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    IF NOT dry_run THEN
      INSERT INTO cleanup_logs (
        events_deleted,
        free_tier_deleted,
        pro_tier_deleted,
        team_tier_deleted,
        success,
        error_message
      ) VALUES (
        0, 0, 0, 0, false, SQLERRM
      );
    END IF;

    RAISE EXCEPTION 'Cleanup failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_events IS 'Deletes old events based on org plan retention limits. Pass dry_run=true to preview without deleting.';

-- ============================================
-- 3. OPTIONAL: CREATE CRON JOB (if pg_cron available)
-- ============================================

-- Uncomment if using Supabase with pg_cron extension:
-- Run daily at 3 AM UTC
-- SELECT cron.schedule(
--   'cleanup-old-events',
--   '0 3 * * *',
--   $$SELECT cleanup_old_events();$$
-- );
