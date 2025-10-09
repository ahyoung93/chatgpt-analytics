export const dynamic = 'force-dynamic';

// GET /api/metrics/summary - Get app metrics summary
import { NextRequest, NextResponse } from 'next/server';
import { getAppMetricsSummary } from '@/lib/metrics';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!appId) {
      return NextResponse.json(
        { error: 'appId is required' },
        { status: 400 }
      );
    }

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days

    const summary = await getAppMetricsSummary(appId, start, end);

    return NextResponse.json({
      success: true,
      summary
    });
  } catch (error: any) {
    console.error('Metrics summary API error:', error);

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
