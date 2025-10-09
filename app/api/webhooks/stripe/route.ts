// Stripe webhook handler
import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, getPlanFromPriceId } from '@/lib/stripe';
import { createServerClient } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  try {
    const event = constructWebhookEvent(body, signature, webhookSecret);
    const supabase = createServerClient();

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get org by Stripe customer ID
        const { data: org } = await supabase
          .from('orgs')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!org) {
          console.error('Org not found for customer:', customerId);
          return NextResponse.json({ received: true });
        }

        const priceId = subscription.items.data[0]?.price.id || '';
        const plan = getPlanFromPriceId(priceId);

        // Update org
        await supabase
          .from('orgs')
          .update({
            plan,
            subscription_id: subscription.id,
            subscription_status: subscription.status as any
          })
          .eq('id', org.id);

        // Upsert subscription
        await supabase
          .from('subscriptions')
          .upsert({
            org_id: org.id,
            stripe_subscription_id: subscription.id,
            plan,
            status: subscription.status as any,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          });

        console.log(`Subscription ${event.type} for org ${org.id}: ${plan}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: org } = await supabase
          .from('orgs')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!org) {
          console.error('Org not found for customer:', customerId);
          return NextResponse.json({ received: true });
        }

        // Downgrade to free tier
        await supabase
          .from('orgs')
          .update({
            plan: 'free',
            subscription_status: 'cancelled'
          })
          .eq('id', org.id);

        console.log(`Subscription cancelled for org ${org.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);

    return NextResponse.json(
      { error: 'Webhook handler failed', message: error.message },
      { status: 400 }
    );
  }
}
