import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

// GET /api/events - Fetch events for the authenticated user's org
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's org_id from org_members
    const { data: orgMember, error: orgError } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !orgMember) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Fetch events for all apps in the org
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        event_type,
        event_name,
        timestamp,
        latency_ms,
        error_message,
        properties,
        app:apps!inner(
          id,
          name,
          org_id
        )
      `)
      .eq('app.org_id', orgMember.org_id)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (eventsError) {
      console.error('Events fetch error:', eventsError);
      throw new Error('Failed to fetch events');
    }

    // Transform the data to match the Events page interface
    const transformedEvents = (events || []).map((event: any) => ({
      id: event.id,
      timestamp: event.timestamp,
      event_type: event.event_type,
      app_name: event.app?.name || 'Unknown',
      latency_ms: event.latency_ms,
      error_message: event.error_message,
      properties: event.properties || {}
    }));

    return NextResponse.json({ events: transformedEvents });
  } catch (error: any) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
