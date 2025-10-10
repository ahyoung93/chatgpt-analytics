import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAuthClient } from '@/lib/supabase/server';
import { createServerClient } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST /api/admin/cleanup - Manual cleanup trigger (for testing/admin)
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authSupabase = await createAuthClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body for dry_run option
    const body = await request.json().catch(() => ({}));
    const dryRun = body.dry_run === true;

    console.log(`[Admin] Manual cleanup triggered by ${user.email} (dry_run: ${dryRun})`);

    const startTime = Date.now();

    // Use service client for cleanup function
    const serviceSupabase = createServerClient();

    // Run cleanup function
    const { data, error } = await serviceSupabase.rpc('cleanup_old_events', {
      dry_run: dryRun
    });

    if (error) {
      console.error('[Admin] Cleanup failed:', error);
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

    console.log('[Admin] Cleanup result:', {
      dry_run: dryRun,
      total: result.events_deleted,
      free: result.free_tier_deleted,
      pro: result.pro_tier_deleted,
      team: result.team_tier_deleted,
      duration_ms: duration
    });

    return NextResponse.json({
      success: true,
      dry_run: dryRun,
      deleted: result.events_deleted,
      breakdown: {
        free: result.free_tier_deleted,
        pro: result.pro_tier_deleted,
        team: result.team_tier_deleted
      },
      duration_ms: duration,
      message: dryRun
        ? 'Dry run complete - no events were deleted'
        : 'Cleanup complete'
    });
  } catch (error: any) {
    console.error('[Admin] Cleanup error:', error);
    return NextResponse.json(
      {
        error: error.message,
        success: false
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/cleanup - Get recent cleanup logs
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authSupabase = await createAuthClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use service client to fetch logs
    const serviceSupabase = createServerClient();

    const { data: logs, error } = await serviceSupabase
      .from('cleanup_logs')
      .select('*')
      .order('run_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error('Failed to fetch cleanup logs');
    }

    return NextResponse.json({
      success: true,
      logs
    });
  } catch (error: any) {
    console.error('[Admin] Error fetching logs:', error);
    return NextResponse.json(
      {
        error: error.message,
        success: false
      },
      { status: 500 }
    );
  }
}
