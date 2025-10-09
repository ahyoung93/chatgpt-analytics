// Stripe integration for ChatGPT App Analytics
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Pricing plans for App Analytics
export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '7 days data retention',
      '1 ChatGPT app',
      'Basic metrics dashboard',
      'Up to 10,000 events/month'
    ]
  },
  pro: {
    name: 'Pro',
    price: 49,
    priceId: process.env.STRIPE_PRICE_ID_PRO,
    features: [
      '90 days data retention',
      'Up to 5 ChatGPT apps',
      'Category benchmarks',
      'CSV data export',
      'Up to 100,000 events/month',
      'Email support'
    ]
  },
  team: {
    name: 'Team',
    price: 99,
    priceId: process.env.STRIPE_PRICE_ID_TEAM,
    features: [
      '180 days data retention',
      'Unlimited ChatGPT apps',
      'Category benchmarks',
      'CSV data export',
      'Unlimited events',
      'Priority support',
      'Team collaboration'
    ]
  }
} as const;

export async function createStripeCustomer(
  email: string,
  name?: string,
  orgId?: string
) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: orgId ? { org_id: orgId } : {}
  });

  return customer;
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return session;
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export function getPlanFromPriceId(priceId: string): 'free' | 'pro' | 'team' {
  if (priceId === PRICING_PLANS.pro.priceId) return 'pro';
  if (priceId === PRICING_PLANS.team.priceId) return 'team';
  return 'free';
}
