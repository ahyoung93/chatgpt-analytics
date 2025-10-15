export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// GET /api/metrics/retention - Get user retention analytics
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

    // Get all events with user_hash
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('user_hash, timestamp')
      .eq('app_id', appId)
      .not('user_hash', 'is', null)
      .order('timestamp', { ascending: true });

    if (eventsError) {
      throw new Error('Failed to fetch retention data');
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
        metrics: {
          day1Retention: 0,
          day7Retention: 0,
          day30Retention: 0,
          totalUsers: 0
        },
        cohorts: []
      });
    }

    // Calculate unique users and their first/last seen dates
    const userActivity = new Map<string, { firstSeen: Date; lastSeen: Date; days: Set<string> }>();

    for (const event of events) {
      if (!event.user_hash) continue;

      const timestamp = new Date(event.timestamp);
      const dayKey = timestamp.toISOString().split('T')[0];

      if (!userActivity.has(event.user_hash)) {
        userActivity.set(event.user_hash, {
          firstSeen: timestamp,
          lastSeen: timestamp,
          days: new Set([dayKey])
        });
      } else {
        const activity = userActivity.get(event.user_hash)!;
        if (timestamp < activity.firstSeen) activity.firstSeen = timestamp;
        if (timestamp > activity.lastSeen) activity.lastSeen = timestamp;
        activity.days.add(dayKey);
      }
    }

    const totalUsers = userActivity.size;

    // Calculate retention rates
    let day1Retained = 0;
    let day7Retained = 0;
    let day30Retained = 0;
    let usersOldEnough1 = 0;
    let usersOldEnough7 = 0;
    let usersOldEnough30 = 0;

    const now = new Date();

    for (const [userHash, activity] of userActivity) {
      const daysSinceFirst = Math.floor(
        (now.getTime() - activity.firstSeen.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Day 1 retention: returned at least 1 day after first visit
      if (daysSinceFirst >= 1) {
        usersOldEnough1++;
        const daysActive = Array.from(activity.days).map(d => new Date(d));
        const hasDay1Return = daysActive.some(d => {
          const daysSince = Math.floor(
            (d.getTime() - activity.firstSeen.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSince >= 1 && daysSince <= 2;
        });
        if (hasDay1Return) day1Retained++;
      }

      // Day 7 retention: returned at least 7 days after first visit
      if (daysSinceFirst >= 7) {
        usersOldEnough7++;
        const daysActive = Array.from(activity.days).map(d => new Date(d));
        const hasDay7Return = daysActive.some(d => {
          const daysSince = Math.floor(
            (d.getTime() - activity.firstSeen.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSince >= 7 && daysSince <= 14;
        });
        if (hasDay7Return) day7Retained++;
      }

      // Day 30 retention: returned at least 30 days after first visit
      if (daysSinceFirst >= 30) {
        usersOldEnough30++;
        const daysActive = Array.from(activity.days).map(d => new Date(d));
        const hasDay30Return = daysActive.some(d => {
          const daysSince = Math.floor(
            (d.getTime() - activity.firstSeen.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSince >= 30 && daysSince <= 60;
        });
        if (hasDay30Return) day30Retained++;
      }
    }

    // Calculate cohorts (by week)
    const cohortMap = new Map<string, {
      cohort_date: string;
      users: Set<string>;
      day1Retained: Set<string>;
      day7Retained: Set<string>;
      day30Retained: Set<string>;
    }>();

    for (const [userHash, activity] of userActivity) {
      // Get Monday of the week for cohort
      const firstSeen = activity.firstSeen;
      const monday = new Date(firstSeen);
      monday.setDate(monday.getDate() - monday.getDay() + 1);
      const cohortKey = monday.toISOString().split('T')[0];

      if (!cohortMap.has(cohortKey)) {
        cohortMap.set(cohortKey, {
          cohort_date: cohortKey,
          users: new Set(),
          day1Retained: new Set(),
          day7Retained: new Set(),
          day30Retained: new Set()
        });
      }

      const cohort = cohortMap.get(cohortKey)!;
      cohort.users.add(userHash);

      const daysActive = Array.from(activity.days).map(d => new Date(d));

      // Check day 1 retention
      if (daysActive.some(d => {
        const days = Math.floor((d.getTime() - firstSeen.getTime()) / (1000 * 60 * 60 * 24));
        return days >= 1 && days <= 2;
      })) {
        cohort.day1Retained.add(userHash);
      }

      // Check day 7 retention
      if (daysActive.some(d => {
        const days = Math.floor((d.getTime() - firstSeen.getTime()) / (1000 * 60 * 60 * 24));
        return days >= 7 && days <= 14;
      })) {
        cohort.day7Retained.add(userHash);
      }

      // Check day 30 retention
      if (daysActive.some(d => {
        const days = Math.floor((d.getTime() - firstSeen.getTime()) / (1000 * 60 * 60 * 24));
        return days >= 30 && days <= 60;
      })) {
        cohort.day30Retained.add(userHash);
      }
    }

    // Convert cohorts to array
    const cohorts = Array.from(cohortMap.values())
      .map(cohort => ({
        cohort_date: cohort.cohort_date,
        cohort_size: cohort.users.size,
        day_1_retention_rate: cohort.users.size > 0
          ? (cohort.day1Retained.size / cohort.users.size) * 100
          : 0,
        day_7_retention_rate: cohort.users.size > 0
          ? (cohort.day7Retained.size / cohort.users.size) * 100
          : 0,
        day_30_retention_rate: cohort.users.size > 0
          ? (cohort.day30Retained.size / cohort.users.size) * 100
          : 0
      }))
      .sort((a, b) => b.cohort_date.localeCompare(a.cohort_date));

    return NextResponse.json({
      metrics: {
        day1Retention: usersOldEnough1 > 0 ? (day1Retained / usersOldEnough1) * 100 : 0,
        day7Retention: usersOldEnough7 > 0 ? (day7Retained / usersOldEnough7) * 100 : 0,
        day30Retention: usersOldEnough30 > 0 ? (day30Retained / usersOldEnough30) * 100 : 0,
        totalUsers
      },
      cohorts
    });
  } catch (error: any) {
    console.error('Retention API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
