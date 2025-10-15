export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// GET /api/metrics/conversations - Get conversation analytics
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

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

    // Get all events with user_hash
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('user_hash, event_type, timestamp')
      .eq('app_id', appId)
      .not('user_hash', 'is', null)
      .order('timestamp', { ascending: true });

    if (eventsError) {
      throw new Error('Failed to fetch conversation data');
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
        metrics: {
          totalConversations: 0,
          avgMessagesPerConversation: 0,
          singleMessageConversations: 0,
          singleMessagePercentage: 0,
          activeConversationsToday: 0,
          totalMessages: 0,
          errorRate: 0
        },
        messageDistribution: [],
        hourlyUsage: [],
        dailyConversations: []
      });
    }

    // Build conversation map
    const conversationMap = new Map<string, {
      user_hash: string;
      messages: number;
      invoked: number;
      completed: number;
      errors: number;
      firstSeen: Date;
      lastSeen: Date;
      hours: Set<number>;
      dates: Set<string>;
    }>();

    for (const event of events) {
      if (!event.user_hash) continue;

      const timestamp = new Date(event.timestamp);
      const hour = timestamp.getHours();
      const dateKey = timestamp.toISOString().split('T')[0];

      if (!conversationMap.has(event.user_hash)) {
        conversationMap.set(event.user_hash, {
          user_hash: event.user_hash,
          messages: 0,
          invoked: 0,
          completed: 0,
          errors: 0,
          firstSeen: timestamp,
          lastSeen: timestamp,
          hours: new Set([hour]),
          dates: new Set([dateKey])
        });
      }

      const conv = conversationMap.get(event.user_hash)!;

      if (event.event_type === 'invoked') {
        conv.messages++;
        conv.invoked++;
      }
      if (event.event_type === 'completed') conv.completed++;
      if (event.event_type === 'error') conv.errors++;

      if (timestamp < conv.firstSeen) conv.firstSeen = timestamp;
      if (timestamp > conv.lastSeen) conv.lastSeen = timestamp;
      conv.hours.add(hour);
      conv.dates.add(dateKey);
    }

    const conversations = Array.from(conversationMap.values());
    const totalConversations = conversations.length;
    const totalMessages = conversations.reduce((sum, c) => sum + c.messages, 0);
    const totalErrors = conversations.reduce((sum, c) => sum + c.errors, 0);
    const totalInvoked = conversations.reduce((sum, c) => sum + c.invoked, 0);

    const singleMessageConversations = conversations.filter(c => c.messages === 1).length;
    const avgMessagesPerConversation = totalConversations > 0
      ? totalMessages / totalConversations
      : 0;

    // Today's active conversations
    const today = new Date().toISOString().split('T')[0];
    const activeConversationsToday = conversations.filter(c =>
      c.dates.has(today)
    ).length;

    // Error rate
    const errorRate = totalInvoked > 0
      ? (totalErrors / totalInvoked) * 100
      : 0;

    // Message distribution
    const distributionBuckets = [
      { label: '1 message', min: 1, max: 1, count: 0 },
      { label: '2-5 messages', min: 2, max: 5, count: 0 },
      { label: '6-10 messages', min: 6, max: 10, count: 0 },
      { label: '11-20 messages', min: 11, max: 20, count: 0 },
      { label: '20+ messages', min: 21, max: Infinity, count: 0 }
    ];

    for (const conv of conversations) {
      for (const bucket of distributionBuckets) {
        if (conv.messages >= bucket.min && conv.messages <= bucket.max) {
          bucket.count++;
          break;
        }
      }
    }

    const messageDistribution = distributionBuckets.map(b => ({
      label: b.label,
      count: b.count,
      percentage: totalConversations > 0 ? (b.count / totalConversations) * 100 : 0
    }));

    // Hourly usage (24 hours)
    const hourlyUsage = Array.from({ length: 24 }, (_, hour) => {
      const count = conversations.filter(c => c.hours.has(hour)).length;
      return {
        hour,
        label: `${hour.toString().padStart(2, '0')}:00`,
        conversations: count
      };
    });

    // Daily conversations (last 30 days)
    const dailyMap = new Map<string, number>();
    for (const conv of conversations) {
      for (const date of Array.from(conv.dates)) {
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
      }
    }

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyConversations = last30Days.map(date => ({
      date,
      conversations: dailyMap.get(date) || 0
    }));

    return NextResponse.json({
      metrics: {
        totalConversations,
        avgMessagesPerConversation: Math.round(avgMessagesPerConversation * 10) / 10,
        singleMessageConversations,
        singleMessagePercentage: totalConversations > 0
          ? Math.round((singleMessageConversations / totalConversations) * 100 * 10) / 10
          : 0,
        activeConversationsToday,
        totalMessages,
        errorRate: Math.round(errorRate * 10) / 10
      },
      messageDistribution,
      hourlyUsage,
      dailyConversations
    });
  } catch (error: any) {
    console.error('Conversations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
