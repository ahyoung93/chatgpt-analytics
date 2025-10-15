export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// GET /api/metrics/prompts - Get prompt pattern analytics
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get app_id from query params
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('app_id');

    if (!appId) {
      return NextResponse.json(
        { error: 'app_id is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this app
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select('id, org_id, orgs!inner(id)')
      .eq('id', appId)
      .single();

    if (appError || !app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Get prompt patterns with aggregated metrics
    const { data: patterns, error: patternsError } = await supabase
      .from('events')
      .select('prompt_hash')
      .eq('app_id', appId)
      .not('prompt_hash', 'is', null)
      .order('timestamp', { ascending: false });

    if (patternsError) {
      throw new Error('Failed to fetch prompt patterns');
    }

    // Aggregate metrics for each unique prompt_hash
    const promptMap = new Map<string, {
      prompt_hash: string;
      total_uses: number;
      completed: number;
      errors: number;
      converted: number;
      total_latency: number;
      latency_count: number;
    }>();

    // Get all events for this app to calculate metrics
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('prompt_hash, event_type, latency_ms')
      .eq('app_id', appId)
      .not('prompt_hash', 'is', null);

    if (eventsError) {
      throw new Error('Failed to fetch events');
    }

    // Build aggregations
    for (const event of events) {
      if (!event.prompt_hash) continue;

      if (!promptMap.has(event.prompt_hash)) {
        promptMap.set(event.prompt_hash, {
          prompt_hash: event.prompt_hash,
          total_uses: 0,
          completed: 0,
          errors: 0,
          converted: 0,
          total_latency: 0,
          latency_count: 0
        });
      }

      const metrics = promptMap.get(event.prompt_hash)!;
      metrics.total_uses++;

      if (event.event_type === 'completed') metrics.completed++;
      if (event.event_type === 'error') metrics.errors++;
      if (event.event_type === 'converted') metrics.converted++;

      if (event.latency_ms) {
        metrics.total_latency += event.latency_ms;
        metrics.latency_count++;
      }
    }

    // Convert to array and calculate rates
    const promptPatterns = Array.from(promptMap.values()).map(metrics => ({
      prompt_hash: metrics.prompt_hash,
      total_uses: metrics.total_uses,
      success_rate: metrics.total_uses > 0
        ? (metrics.completed / metrics.total_uses) * 100
        : 0,
      conversion_rate: metrics.total_uses > 0
        ? (metrics.converted / metrics.total_uses) * 100
        : 0,
      error_rate: metrics.total_uses > 0
        ? (metrics.errors / metrics.total_uses) * 100
        : 0,
      avg_latency_ms: metrics.latency_count > 0
        ? Math.round(metrics.total_latency / metrics.latency_count)
        : 0
    }));

    // Sort by total uses descending
    promptPatterns.sort((a, b) => b.total_uses - a.total_uses);

    return NextResponse.json({
      patterns: promptPatterns
    });
  } catch (error: any) {
    console.error('Prompts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
