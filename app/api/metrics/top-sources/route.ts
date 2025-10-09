export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// GET /api/metrics/top-sources - Get top traffic sources
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '10');

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

    // Get top sources from events table
    const { data, error } = await supabase
      .from('events')
      .select('properties')
      .eq('app_id', appId)
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString());

    if (error) {
      throw new Error('Failed to fetch events');
    }

    // Aggregate sources from properties
    const sourceCounts: Record<string, number> = {};

    data?.forEach((event) => {
      const source = event.properties?.source || 'direct';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    // Convert to array and sort by count
    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      topSources
    });
  } catch (error: any) {
    console.error('Top sources API error:', error);

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
