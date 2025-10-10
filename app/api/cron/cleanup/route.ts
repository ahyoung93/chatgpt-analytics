import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/cron/cleanup - Automatic cleanup of old events (triggered by Vercel Cron)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (prevent unauthorized access)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const startTime = Date.now();
    console.log('[Cron] Starting cleanup job...');

    const supabase = createServiceClient();

    // Run cleanup function
    const { data, error } = await supabase.rpc('cleanup_old_events', {
      dry_run: false
    });

    if (error) {
      console.error('[Cron] Cleanup failed:', error);
      return NextResponse.json(
        {
          error: error.message,
          success: false
        },
        { status: 500 }
      );
    }

    const result = data[0];
    const duration = Date.now() - startTime;

    console.log('[Cron] Cleanup successful:', {
      total: result.events_deleted,
      free: result.free_tier_deleted,
      pro: result.pro_tier_deleted,
      team: result.team_tier_deleted,
      duration_ms: duration
    });

    return NextResponse.json({
      success: true,
      deleted: result.events_deleted,
      breakdown: {
        free: result.free_tier_deleted,
        pro: result.pro_tier_deleted,
        team: result.team_tier_deleted
      },
      duration_ms: duration
    });
  } catch (error: any) {
    console.error('[Cron] Cleanup error:', error);
    return NextResponse.json(
      {
        error: error.message,
        success: false
      },
      { status: 500 }
    );
  }
}
