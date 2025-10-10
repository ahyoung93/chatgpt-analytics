# Stripe Setup Guide for Odin Analytics

Follow these steps to enable paid subscriptions on your platform.

## Step 1: Get Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys (use test mode first)
2. Copy your **Secret key** (starts with `sk_test_`)
3. Copy your **Publishable key** (starts with `pk_test_`)

## Step 2: Create Products in Stripe

1. Go to https://dashboard.stripe.com/test/products
2. Click **+ Add Product**

### Create Pro Plan ($19/month)
- **Name**: Odin Pro
- **Description**: For serious app developers
- **Pricing**: Recurring, $19/month
- Click **Save product**
- **Copy the Price ID** (starts with `price_`) - you'll need this!

### Create Team Plan ($59/month)
- **Name**: Odin Team
- **Description**: For teams building multiple apps
- **Pricing**: Recurring, $59/month
- Click **Save product**
- **Copy the Price ID** (starts with `price_`)

## Step 3: Add Environment Variables to Vercel

1. Go to https://vercel.com/ahyoung93s-projects/chatgpt-analytics/settings/environment-variables
2. Add these variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | Your Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Your Stripe publishable key |
| `STRIPE_PRICE_ID_PRO` | `price_...` | Price ID for Pro plan ($19/mo) |
| `STRIPE_PRICE_ID_TEAM` | `price_...` | Price ID for Team plan ($59/mo) |

3. Click **Save** for each variable
4. Redeploy your app for changes to take effect

## Step 4: Set Up Webhook

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **+ Add endpoint**
3. **Endpoint URL**: `https://chatgpt-analytics-plum.vercel.app/api/webhooks/stripe`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. **Copy the Signing secret** (starts with `whsec_`)

## Step 5: Add Webhook Secret to Vercel

1. Go back to Vercel environment variables
2. Add one more variable:

| Variable Name | Value |
|--------------|-------|
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

3. Save and redeploy

## Step 6: Test the Integration

1. Go to your app's billing page: https://chatgpt-analytics-plum.vercel.app/dashboard/billing
2. Click **Upgrade to Pro**
3. You should be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)
5. Complete checkout
6. Verify you're redirected back and your plan is upgraded

## Step 7: Enable Live Mode (When Ready)

1. Switch Stripe to **Live mode**
2. Create the same products in live mode
3. Get live API keys (start with `sk_live_` and `pk_live_`)
4. Update Vercel environment variables with live keys
5. Create webhook endpoint with live URL
6. Update `STRIPE_WEBHOOK_SECRET` with live webhook secret

## Troubleshooting

### "Stripe billing integration coming soon" message
This means Stripe environment variables are not set. Check that all variables in Step 3 are added to Vercel.

### Webhook not working
1. Check that webhook URL is correct: `https://chatgpt-analytics-plum.vercel.app/api/webhooks/stripe`
2. Verify `STRIPE_WEBHOOK_SECRET` is set in Vercel
3. Check Stripe webhook logs for errors

### Payment succeeds but plan doesn't upgrade
Check the webhook is receiving events. Go to Stripe Dashboard → Webhooks → Click your endpoint → View events log.

## Support

For Stripe support: https://support.stripe.com
For Odin support: Check the webhook handler at `/app/api/webhooks/stripe/route.ts`
