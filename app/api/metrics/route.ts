// API route to get analytics metrics
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getUserMetrics, getRecentSessions } from '@/lib/metrics';
import { logApiCall } from '@/lib/db';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate request
    const { user, error: authError } = await authenticateRequest(request);

    if (authError || !user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const includeSessionsParam = searchParams.get('includeSessions');

    // Default to last 30 days if not specified
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get metrics
    const metrics = await getUserMetrics(user.id, startDate, endDate);

    // Optionally include recent sessions
    let sessions = null;
    if (includeSessionsParam === 'true') {
      sessions = await getRecentSessions(user.id, 20);
    }

    // Log API call
    await logApiCall(
      user.id,
      '/api/metrics',
      'GET',
      200,
      Date.now() - startTime,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      metrics,
      sessions
    });
  } catch (error: any) {
    console.error('Metrics API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}
