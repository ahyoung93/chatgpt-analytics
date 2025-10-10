# Free External Cron Setup for Odin

Since Vercel Cron requires a paid plan, we'll use a free external cron service to trigger daily cleanup.

## Option A: cron-job.org (Recommended - Easiest)

### Step 1: Add CRON_SECRET to Vercel

1. Go to your Vercel Dashboard → Project Settings → Environment Variables
2. Add new variable:
   - **Name**: `CRON_SECRET`
   - **Value**: `JRozipvON1IhKJYoG0ZzIUAflKJiF+ndW83KWg1XtsI=`
   - **Environments**: Select all (Production, Preview, Development)
3. Click Save
4. Redeploy your project

### Step 2: Get Your Cleanup URL

Your cleanup endpoint is:
```
https://your-domain.vercel.app/api/cron/cleanup
```

Replace `your-domain` with your actual Vercel domain (e.g., `odin-analytics.vercel.app`)

### Step 3: Set Up cron-job.org

1. **Go to**: https://cron-job.org/en/
2. **Click**: "Sign up" (free account)
3. **Verify** your email
4. **Click**: "Create cronjob"

5. **Fill in the form**:
   - **Title**: `Odin Cleanup Job`
   - **Address**: `https://your-domain.vercel.app/api/cron/cleanup`
   - **Schedule**:
     - Click "Every day"
     - Set time to `03:00` (3 AM UTC)
   - **Request method**: `GET`
   - **Headers** (click "Add header"):
     - **Header name**: `Authorization`
     - **Header value**: `Bearer JRozipvON1IhKJYoG0ZzIUAflKJiF+ndW83KWg1XtsI=`

6. **Click**: "Create cronjob"

### Step 4: Test It

1. In cron-job.org dashboard, find your job
2. Click the "▶" (play) button to run it immediately
3. Check the response:
   - **Status 200** = Success! ✅
   - **Status 401** = Check CRON_SECRET in Vercel
   - **Status 500** = Check Vercel logs for errors

### Step 5: Verify Cleanup

After running, check if it worked:

```bash
# Check cleanup logs in Supabase SQL Editor
SELECT * FROM cleanup_logs ORDER BY run_at DESC LIMIT 5;
```

---

## Option B: EasyCron (Alternative)

1. **Go to**: https://www.easycron.com/
2. **Sign up** for free account (allows 2 cron jobs)
3. **Create cron job**:
   - **URL**: `https://your-domain.vercel.app/api/cron/cleanup`
   - **Cron Expression**: `0 3 * * *` (daily at 3 AM)
   - **HTTP Headers**: `Authorization: Bearer JRozipvON1IhKJYoG0ZzIUAflKJiF+ndW83KWg1XtsI=`
4. **Save and enable**

---

## Option C: Supabase pg_cron (If Available)

If your Supabase plan includes the `pg_cron` extension:

### Check if pg_cron is available:

```sql
SELECT * FROM pg_available_extensions WHERE name = 'pg_cron';
```

### If available, enable it:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Schedule the cleanup job:

```sql
-- Run cleanup daily at 3 AM UTC
SELECT cron.schedule(
  'odin-cleanup-job',
  '0 3 * * *',
  $$SELECT cleanup_old_events(false);$$
);
```

### View scheduled jobs:

```sql
SELECT * FROM cron.job;
```

### View job run history:

```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### To remove the job (if needed):

```sql
SELECT cron.unschedule('odin-cleanup-job');
```

---

## Monitoring & Troubleshooting

### Check Recent Cleanup Runs

Via Supabase SQL Editor:
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

### Manual Test via curl

```bash
curl -X GET "https://your-domain.vercel.app/api/cron/cleanup" \
  -H "Authorization: Bearer JRozipvON1IhKJYoG0ZzIUAflKJiF+ndW83KWg1XtsI="
```

Expected response:
```json
{
  "success": true,
  "deleted": 0,
  "breakdown": {
    "free": 0,
    "pro": 0,
    "team": 0
  },
  "duration_ms": 123
}
```

### Common Issues

**Issue: 401 Unauthorized**
- Solution: Check CRON_SECRET is set in Vercel environment variables
- Solution: Ensure Authorization header has `Bearer ` prefix

**Issue: 500 Internal Server Error**
- Check Vercel logs: `vercel logs --follow`
- Check cleanup_logs table for error_message

**Issue: Cron job not running**
- Verify cron-job.org job is "enabled" (green toggle)
- Check execution history in cron-job.org dashboard
- Verify the URL is correct (no typos)

---

## Cost Comparison

| Service | Free Tier | Paid Plan |
|---------|-----------|-----------|
| **cron-job.org** | Unlimited jobs, 1-min resolution | €2.50/month for advanced features |
| **EasyCron** | 2 jobs, 1-day interval | $0.99/month for daily jobs |
| **Supabase pg_cron** | Included (if available) | N/A |
| **Vercel Cron** | ❌ Not available | $20/month (Pro plan) |

**Recommendation**: Use **cron-job.org** - it's free, reliable, and has the best free tier.

---

## Security Notes

### Is CRON_SECRET secure?

✅ **Yes**, as long as:
- You use a strong random secret (which we generated)
- You don't commit it to Git (use environment variables)
- You use HTTPS (which Vercel provides automatically)

### What if someone finds my CRON_SECRET?

- They can only trigger the cleanup endpoint (not harmful)
- They cannot access your database or user data
- They cannot modify any settings
- Worst case: Extra cleanup runs (which is idempotent/safe)

### Can I rotate the secret?

Yes! Generate a new one and update:
1. Vercel environment variables
2. cron-job.org header
3. Redeploy Vercel

```bash
# Generate new secret
openssl rand -base64 32
```

---

## Next Steps After Setup

1. ✅ Add CRON_SECRET to Vercel
2. ✅ Create cron-job.org account
3. ✅ Set up the cron job
4. ✅ Test it manually
5. ✅ Wait 24 hours and verify it ran automatically
6. ✅ Check cleanup_logs table

Done! Your cleanup system is now running on a free plan! 🎉
