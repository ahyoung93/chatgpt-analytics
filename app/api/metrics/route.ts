// GET /api/metrics - Get app metrics
import { NextRequest, NextResponse } from 'next/server';
import { getAppMetricsSummary, getAppTimeSeriesData, getCategoryBenchmarks } from '@/lib/metrics';
import { hasFeatureAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeBenchmarks = searchParams.get('includeBenchmarks') === 'true';
    const category = searchParams.get('category');
    const plan = searchParams.get('plan') as 'free' | 'pro' | 'team' | null;

    if (!appId) {
      return NextResponse.json(
        { error: 'appId is required' },
        { status: 400 }
      );
    }

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get summary metrics
    const summary = await getAppMetricsSummary(appId, start, end);

    // Get time series data
    const timeSeries = await getAppTimeSeriesData(appId, start, end);

    const response: any = {
      success: true,
      summary,
      timeSeries
    };

    // Include benchmarks if requested and user has Pro/Team plan
    if (includeBenchmarks && category && plan) {
      if (hasFeatureAccess(plan, 'benchmarks')) {
        const benchmarks = await getCategoryBenchmarks(category as any, start, end);
        response.benchmarks = benchmarks;
      } else {
        response.benchmarks = {
          available: false,
          message: 'Upgrade to Pro or Team plan to access category benchmarks'
        };
      }
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Metrics API error:', error);

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
