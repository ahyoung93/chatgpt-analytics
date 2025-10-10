# Data Retention & Cleanup System

Odin automatically deletes old raw events based on your organization's plan to manage database size and comply with data retention policies.

## Retention Limits by Plan

| Plan | Retention Period | Description |
|------|-----------------|-------------|
| **Free** | 7 days | Events older than 7 days are deleted |
| **Pro** | 90 days | Events older than 90 days are deleted |
| **Team** | 180 days | Events older than 180 days are deleted |

**Note:** Aggregated metrics (`app_daily_metrics`, `retention_metrics`) are kept forever, regardless of plan.

## How It Works

### Automatic Cleanup

- **Schedule**: Runs daily at 3:00 AM UTC
- **Method**: Vercel Cron Job triggers `/api/cron/cleanup`
- **Security**: Protected by `CRON_SECRET` bearer token
- **Logging**: All runs are logged in `cleanup_logs` table

### What Gets Deleted

Only raw events in the `events` table:
- Event data (invoked, completed, error, converted, custom)
- Properties, latency, error messages
- Revenue and user tracking data

### What Is Preserved

- **Aggregated daily metrics** - Summary statistics per app per day
- **Retention cohort data** - User retention analysis
- **Benchmark data** - Category-wide performance metrics
- **App configuration** - API keys and settings

## Manual Cleanup

### Run Cleanup Manually

For testing or immediate cleanup needs:

```bash
# Dry run (preview what will be deleted)
curl -X POST https://your-domain.vercel.app/api/admin/cleanup \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"dry_run": true}'

# Actual cleanup
curl -X POST https://your-domain.vercel.app/api/admin/cleanup \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"dry_run": false}'
```

### View Cleanup Logs

```bash
# Get recent cleanup history
curl https://your-domain.vercel.app/api/admin/cleanup \
  -H "Cookie: your-session-cookie"
```

## Setup Instructions

### 1. Run Database Migration

Execute the cleanup system SQL in Supabase SQL Editor:

```sql
-- Copy and run contents of scripts/add_cleanup_system.sql
```

This creates:
- `cleanup_logs` table
- `cleanup_old_events()` function

### 2. Configure Environment Variable

Add to Vercel environment variables:

```bash
# Generate a secure secret
openssl rand -base64 32

# Add to Vercel:
# CRON_SECRET=<generated-secret>
```

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add `CRON_SECRET` with the generated value
3. Select all environments (Production, Preview, Development)
4. Save and redeploy

### 3. Enable Cron Jobs

The `vercel.json` file already configures the cron:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 3 * * *"
    }
  ]
}
```

Vercel automatically registers this on deployment.

### 4. Verify Setup

After deploying:

1. **Check Cron Registration**
   - Go to Vercel Dashboard → Your Project → Cron Jobs
   - Verify "cleanup-old-events" is listed

2. **Test Manual Cleanup**
   ```bash
   # Run dry-run to test
   curl -X POST https://your-domain.vercel.app/api/admin/cleanup \
     -H "Content-Type: application/json" \
     -d '{"dry_run": true}'
   ```

3. **Monitor Logs**
   - Check Vercel logs at 3 AM UTC for cron execution
   - View cleanup history via `/api/admin/cleanup` GET endpoint

## Monitoring

### Cleanup Logs Table

All cleanup runs are logged:

```sql
SELECT
  run_at,
  events_deleted,
  free_tier_deleted,
  pro_tier_deleted,
  team_tier_deleted,
  duration_ms,
  success,
  error_message
FROM cleanup_logs
ORDER BY run_at DESC
LIMIT 10;
```

### Typical Log Entry

```json
{
  "run_at": "2025-01-15T03:00:00Z",
  "events_deleted": 15234,
  "free_tier_deleted": 12000,
  "pro_tier_deleted": 2500,
  "team_tier_deleted": 734,
  "duration_ms": 1250,
  "success": true,
  "error_message": null
}
```

## Safety Features

### Dry Run Mode

Test cleanup without deleting data:

```javascript
const { data } = await supabase.rpc('cleanup_old_events', {
  dry_run: true
});

// Returns what would be deleted without actually deleting
```

### Error Recovery

- Failed cleanups are logged with error messages
- Database transaction ensures atomic operations
- Errors don't affect aggregated metrics

### Plan-Based Logic

Cleanup only affects events beyond retention period:
- Free tier: Keeps 7 days, deletes older
- Pro tier: Keeps 90 days, deletes older
- Team tier: Keeps 180 days, deletes older

## Troubleshooting

### Cron Job Not Running

1. **Check CRON_SECRET is set**
   ```bash
   vercel env ls
   ```

2. **Verify cron registration**
   - Vercel Dashboard → Cron Jobs
   - Should show `/api/cron/cleanup` with schedule

3. **Check Vercel logs**
   ```bash
   vercel logs --follow
   ```

### No Events Being Deleted

1. **Check if events are old enough**
   ```sql
   SELECT plan, COUNT(*)
   FROM events e
   JOIN apps a ON e.app_id = a.id
   JOIN orgs o ON a.org_id = o.id
   WHERE
     (o.plan = 'free' AND e.timestamp < NOW() - INTERVAL '7 days') OR
     (o.plan = 'pro' AND e.timestamp < NOW() - INTERVAL '90 days') OR
     (o.plan = 'team' AND e.timestamp < NOW() - INTERVAL '180 days')
   GROUP BY plan;
   ```

2. **Run dry-run to preview**
   ```bash
   curl -X POST .../api/admin/cleanup -d '{"dry_run": true}'
   ```

### Database Performance

If cleanup is slow:

1. **Add indexes** (already included in migration):
   ```sql
   CREATE INDEX idx_events_timestamp ON events(timestamp);
   CREATE INDEX idx_events_app_id ON events(app_id);
   ```

2. **Check cleanup logs for duration**:
   ```sql
   SELECT AVG(duration_ms), MAX(duration_ms)
   FROM cleanup_logs
   WHERE success = true;
   ```

## Cost Savings

Automatic cleanup helps reduce:
- **Database storage costs** - Smaller database size
- **Query performance** - Fewer rows to scan
- **Backup size** - Smaller snapshots

Example: If you track 100K events/day on Free plan:
- Without cleanup: 100K × 365 = 36.5M events/year
- With cleanup: 100K × 7 = 700K events maintained

That's a **98% reduction** in event storage! 🎉

## FAQ

**Q: Will I lose historical analytics?**
A: No! Daily aggregated metrics are preserved forever. Only raw event details are deleted.

**Q: Can I change retention periods?**
A: Retention is tied to your plan. Upgrade to Pro or Team for longer retention.

**Q: What happens during cleanup?**
A: Old events are permanently deleted. The operation is logged and takes 1-5 seconds typically.

**Q: Can I disable cleanup?**
A: Not recommended, but you can remove the cron job from `vercel.json`. However, your database will grow indefinitely.

**Q: How do I test before deploying?**
A: Use dry-run mode: `{"dry_run": true}` to preview what would be deleted without actually deleting.
