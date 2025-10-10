export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// Billing API routes
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db';
import { createCheckoutSession, createBillingPortalSession, PRICING_PLANS } from '@/lib/stripe';
import { z } from 'zod';

const checkoutRequestSchema = z.object({
  orgId: z.string(),
  plan: z.enum(['pro']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
});

// POST - Create checkout session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, plan, successUrl, cancelUrl } = checkoutRequestSchema.parse(body);

    const supabase = createServerClient();

    const { data: org } = await supabase
      .from('orgs')
      .select('stripe_customer_id, name, plan')
      .eq('id', orgId)
      .single();

    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Prevent upgrading if already on Pro
    if (org.plan === 'pro') {
      return NextResponse.json(
        { error: 'Already subscribed to Pro plan' },
        { status: 400 }
      );
    }

    let customerId = org.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const { createStripeCustomer } = await import('@/lib/stripe');
      const customer = await createStripeCustomer(
        `org-${orgId}@example.com`, // You might want to get actual email
        org.name,
        orgId
      );

      customerId = customer.id;

      await supabase
        .from('orgs')
        .update({ stripe_customer_id: customerId })
        .eq('id', orgId);
    }

    const priceId = PRICING_PLANS[plan].priceId;

    if (!priceId) {
      console.error('Missing Stripe Price ID for plan:', plan);
      console.error('Environment variables check:', {
        hasProPriceId: !!process.env.STRIPE_PRICE_ID_PRO,
        hasTeamPriceId: !!process.env.STRIPE_PRICE_ID_TEAM
      });
      return NextResponse.json(
        {
          error: 'Stripe pricing not configured',
          message: `Missing STRIPE_PRICE_ID_${plan.toUpperCase()} environment variable. Please add it to Vercel.`
        },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await createCheckoutSession(
      customerId,
      priceId,
      successUrl || `${appUrl}/dashboard?success=true`,
      cancelUrl || `${appUrl}/pricing?cancelled=true`
    );

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error: any) {
    console.error('Billing API error:', error);

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// GET - Get billing portal URL
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: org } = await supabase
      .from('orgs')
      .select('stripe_customer_id')
      .eq('id', orgId)
      .single();

    if (!org?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found' },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const portalSession = await createBillingPortalSession(
      org.stripe_customer_id,
      `${appUrl}/dashboard`
    );

    return NextResponse.json({
      success: true,
      url: portalSession.url
    });
  } catch (error: any) {
    console.error('Billing portal API error:', error);

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
