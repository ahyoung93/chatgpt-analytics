// API route for billing operations
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { createServerClient } from '@/lib/db';
import {
  createCheckoutSession,
  createBillingPortalSession,
  PRICING_PLANS
} from '@/lib/stripe';
import { z } from 'zod';

const checkoutRequestSchema = z.object({
  tier: z.enum(['pro', 'enterprise']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
});

// Create checkout session
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);

    if (authError || !user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tier, successUrl, cancelUrl } = checkoutRequestSchema.parse(body);

    const supabase = createServerClient();

    // Get user's Stripe customer ID
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id, email, name')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let customerId = userData.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const { createStripeCustomer } = await import('@/lib/stripe');
      const customer = await createStripeCustomer(
        userData.email,
        userData.name || undefined,
        { userId: user.id }
      );

      customerId = customer.id;

      // Update user with customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const priceId = PRICING_PLANS[tier].priceId;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid pricing plan' },
        { status: 400 }
      );
    }

    // Create checkout session
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
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// Get billing portal
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);

    if (authError || !user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();

    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!userData?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found' },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const portalSession = await createBillingPortalSession(
      userData.stripe_customer_id,
      `${appUrl}/dashboard`
    );

    return NextResponse.json({
      success: true,
      url: portalSession.url
    });
  } catch (error: any) {
    console.error('Billing portal API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}
