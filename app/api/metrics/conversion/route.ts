export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// GET /api/metrics/conversion - Get conversion metrics
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
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

    const supabase = createServerClient();

    // Get conversion metrics from daily aggregates
    const { data, error } = await supabase
      .from('app_daily_metrics')
      .select('*')
      .eq('app_id', appId)
      .gte('date', start.toISOString().split('T')[0])
      .lte('date', end.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      throw new Error('Failed to fetch conversion metrics');
    }

    // Calculate overall conversion metrics
    const totalInvoked = data?.reduce((sum, d) => sum + d.invoked_count, 0) || 0;
    const totalConverted = data?.reduce((sum, d) => sum + d.converted_count, 0) || 0;
    const conversionRate = totalInvoked > 0 ? (totalConverted / totalInvoked) * 100 : 0;

    // Time series for conversion funnel
    const conversionTimeSeries = data?.map(d => ({
      date: d.date,
      invoked: d.invoked_count,
      completed: d.completed_count,
      converted: d.converted_count,
      conversionRate: d.invoked_count > 0
        ? (d.converted_count / d.invoked_count) * 100
        : 0
    })) || [];

    return NextResponse.json({
      success: true,
      conversion: {
        totalInvoked,
        totalConverted,
        conversionRate: Math.round(conversionRate * 100) / 100,
        timeSeries: conversionTimeSeries
      }
    });
  } catch (error: any) {
    console.error('Conversion metrics API error:', error);

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
