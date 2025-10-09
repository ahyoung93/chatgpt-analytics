// Stripe webhook handler
import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, mapSubscriptionStatus, getTierFromPriceId } from '@/lib/stripe';
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

        // Get user by Stripe customer ID
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!user) {
          console.error('User not found for customer:', customerId);
          return NextResponse.json({ received: true });
        }

        // Get the price ID from the subscription
        const priceId = subscription.items.data[0]?.price.id;
        const tier = getTierFromPriceId(priceId || '');
        const status = mapSubscriptionStatus(subscription.status);

        // Update tier limits based on subscription
        const limits = {
          free: 1000,
          pro: 10000,
          enterprise: 1000000
        };

        await supabase
          .from('users')
          .update({
            subscription_id: subscription.id,
            subscription_tier: tier,
            subscription_status: status,
            api_calls_limit: limits[tier]
          })
          .eq('id', user.id);

        console.log(`Subscription ${event.type} for user ${user.id}: ${tier} (${status})`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!user) {
          console.error('User not found for customer:', customerId);
          return NextResponse.json({ received: true });
        }

        // Downgrade to free tier
        await supabase
          .from('users')
          .update({
            subscription_id: null,
            subscription_tier: 'free',
            subscription_status: 'cancelled',
            api_calls_limit: 1000
          })
          .eq('id', user.id);

        console.log(`Subscription cancelled for user ${user.id}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!user) {
          console.error('User not found for customer:', customerId);
          return NextResponse.json({ received: true });
        }

        // Record billing history
        await supabase.from('billing_history').insert({
          user_id: user.id,
          stripe_invoice_id: invoice.id,
          amount: (invoice.amount_paid || 0) / 100,
          currency: invoice.currency,
          status: 'paid',
          invoice_url: invoice.hosted_invoice_url,
          period_start: invoice.period_start
            ? new Date(invoice.period_start * 1000).toISOString()
            : null,
          period_end: invoice.period_end
            ? new Date(invoice.period_end * 1000).toISOString()
            : null
        });

        console.log(`Payment succeeded for user ${user.id}: $${invoice.amount_paid / 100}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!user) {
          console.error('User not found for customer:', customerId);
          return NextResponse.json({ received: true });
        }

        // Update subscription status
        await supabase
          .from('users')
          .update({ subscription_status: 'past_due' })
          .eq('id', user.id);

        // Record billing history
        await supabase.from('billing_history').insert({
          user_id: user.id,
          stripe_invoice_id: invoice.id,
          amount: (invoice.amount_due || 0) / 100,
          currency: invoice.currency,
          status: 'failed',
          invoice_url: invoice.hosted_invoice_url
        });

        console.log(`Payment failed for user ${user.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);

    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        message: error.message
      },
      { status: 400 }
    );
  }
}
