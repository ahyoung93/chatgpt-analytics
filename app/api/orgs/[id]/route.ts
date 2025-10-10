import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

// GET /api/orgs/[id] - Fetch organization details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Fetch org details
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .select('id, name, plan, subscription_status, subscription_id, stripe_customer_id, created_at')
      .eq('id', params.id)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Verify user is a member of this org
    const { data: membership, error: memberError } = await supabase
      .from('org_members')
      .select('role')
      .eq('org_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // If user has a subscription, fetch the next billing date from Stripe
    let nextBillingDate = null;
    if (stripe && org.subscription_id && org.plan !== 'free') {
      try {
        const subscription = await stripe.subscriptions.retrieve(org.subscription_id);
        if (subscription.current_period_end) {
          nextBillingDate = new Date(subscription.current_period_end * 1000).toISOString();
        }
      } catch (stripeError) {
        console.error('Error fetching subscription from Stripe:', stripeError);
        // Continue without billing date if Stripe fails
      }
    }

    return NextResponse.json({
      org: {
        ...org,
        next_billing_date: nextBillingDate
      }
    });
  } catch (error: any) {
    console.error('Get org error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
