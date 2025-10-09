export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// GET /api/metrics/benchmarks - Get category benchmarks (Pro/Team only)
import { NextRequest, NextResponse } from 'next/server';
import { getCategoryBenchmarks } from '@/lib/metrics';
import { hasFeatureAccess } from '@/lib/auth';
import { AppCategory } from '@/lib/database.types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as AppCategory | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const plan = searchParams.get('plan') as 'free' | 'pro' | 'team' | null;

    if (!category) {
      return NextResponse.json(
        { error: 'category is required' },
        { status: 400 }
      );
    }

    // Check if user has benchmarks feature
    if (!plan || !hasFeatureAccess(plan, 'benchmarks')) {
      return NextResponse.json(
        {
          available: false,
          message: 'Upgrade to Pro or Team plan to access category benchmarks'
        },
        { status: 403 }
      );
    }

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days

    const benchmarks = await getCategoryBenchmarks(category, start, end);

    return NextResponse.json({
      success: true,
      benchmarks
    });
  } catch (error: any) {
    console.error('Metrics benchmarks API error:', error);

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
