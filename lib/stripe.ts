// Stripe integration utilities
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Pricing configuration
export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '1,000 API calls/month',
      '30 days data retention',
      'JSON export',
      'Basic analytics'
    ]
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRICE_ID_PRO,
    features: [
      '10,000 API calls/month',
      '365 days data retention',
      'CSV & JSON export',
      'Advanced analytics',
      'Email support'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE,
    features: [
      'Unlimited API calls',
      'Unlimited data retention',
      'All export formats (CSV, JSON, PDF)',
      'Advanced analytics',
      'Priority support',
      'Custom integrations'
    ]
  }
} as const;

// Create a Stripe customer
export async function createStripeCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata
  });

  return customer;
}

// Create a checkout session for subscription
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

// Create a billing portal session
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

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}

// Get invoice
export async function getInvoice(invoiceId: string) {
  const invoice = await stripe.invoices.retrieve(invoiceId);
  return invoice;
}

// List customer invoices
export async function listCustomerInvoices(customerId: string, limit = 10) {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data;
}

// Construct webhook event
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// Map Stripe subscription status to our status
export function mapSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): 'active' | 'inactive' | 'cancelled' | 'past_due' {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
      return 'cancelled';
    default:
      return 'inactive';
  }
}

// Get tier from price ID
export function getTierFromPriceId(priceId: string): 'free' | 'pro' | 'enterprise' {
  if (priceId === PRICING_PLANS.pro.priceId) {
    return 'pro';
  } else if (priceId === PRICING_PLANS.enterprise.priceId) {
    return 'enterprise';
  }
  return 'free';
}
