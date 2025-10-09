# Deployment Guide

## Prerequisites

Before deploying, make sure you've completed:

1. ✅ `.env.local` file configured with all API keys
2. ✅ Supabase database migration run (see `scripts/run-migration.md`)
3. ✅ Supabase Storage bucket `exports` created
4. ✅ All code files created

## Deploy to Vercel

### Option 1: Using Vercel Dashboard (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial ChatGPT Analytics deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/chatgpt-analytics.git
   git push -u origin main
   ```

2. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/new
   - Import your GitHub repository
   - Configure project settings:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variables:**
   Click on "Environment Variables" and add all the variables from your `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hdhacuarajuyujiolaye.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=(leave empty for now, we'll add this after webhook setup)
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=Sxvv3aHx/lGub/lrDDgIGdb7EDkeKeJsM4nvPAmK9Wk=
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-app.vercel.app`

5. **Update Environment Variables with actual URL:**
   - Go to Settings > Environment Variables
   - Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
   - Redeploy

### Option 2: Using Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add environment variables:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add STRIPE_SECRET_KEY
   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   vercel env add STRIPE_WEBHOOK_SECRET
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXT_PUBLIC_APP_URL
   ```

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

## Post-Deployment Steps

### 1. Configure Stripe Webhook

Now that your app is deployed, you need to set up the Stripe webhook:

1. **Go to Stripe Dashboard:**
   - Visit https://dashboard.stripe.com/webhooks
   - Click "+ Add endpoint"

2. **Configure webhook:**
   - Endpoint URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Listen to events on: Your account
   - Select events to listen to:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Click "Add endpoint"

3. **Get the webhook signing secret:**
   - After creating the endpoint, click on it
   - Reveal the "Signing secret"
   - Copy it (starts with `whsec_...`)

4. **Add webhook secret to Vercel:**
   - Go to your Vercel project dashboard
   - Settings > Environment Variables
   - Add/update `STRIPE_WEBHOOK_SECRET` with the signing secret
   - Redeploy your application

### 2. Add Stripe Price IDs

You need to create products and prices in Stripe:

1. **Go to Stripe Dashboard:**
   - Visit https://dashboard.stripe.com/products

2. **Create Pro Plan:**
   - Click "+ Add product"
   - Name: ChatGPT Analytics Pro
   - Description: Professional analytics plan
   - Price: $29/month
   - Recurring: Monthly
   - Click "Save product"
   - Copy the Price ID (starts with `price_...`)

3. **Create Enterprise Plan:**
   - Repeat above steps for Enterprise plan at $99/month
   - Copy the Price ID

4. **Add Price IDs to environment variables:**
   - Go to Vercel > Settings > Environment Variables
   - Add:
     - `STRIPE_PRICE_ID_PRO=price_xxx`
     - `STRIPE_PRICE_ID_ENTERPRISE=price_xxx`
   - Redeploy

### 3. Create Supabase Storage Bucket

1. **Go to Supabase Dashboard:**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Create bucket:**
   - Click "Storage" in sidebar
   - Click "Create bucket"
   - Name: `exports`
   - Public bucket: Yes
   - Click "Create bucket"

3. **Set bucket policies:**
   - Select the `exports` bucket
   - Go to "Policies" tab
   - Add policies for authenticated users to upload/read their own files

### 4. Run Database Migration

Follow the instructions in `scripts/run-migration.md` to run the database migration.

## Verify Deployment

1. **Check homepage:** Visit `https://your-app.vercel.app`
2. **Check dashboard:** Visit `https://your-app.vercel.app/dashboard`
3. **Check API endpoints:**
   - Test with: `curl https://your-app.vercel.app/api/track -H "x-api-key: test"`
   - Should return 401 error (which is correct)

## Troubleshooting

### Build Errors

If you get TypeScript errors during build:

```bash
npm run build
```

Fix any errors shown, commit, and push.

### Environment Variables Not Working

- Make sure all environment variables are set in Vercel
- Redeploy after adding/updating environment variables
- Check Vercel deployment logs for errors

### Database Connection Issues

- Verify Supabase credentials are correct
- Check that database migration has been run
- Ensure RLS policies are correctly set up

## Next Steps

1. Test the tracking API with the SDK
2. Monitor Vercel logs for any errors
3. Set up custom domain (optional)
4. Configure monitoring and alerts
5. Add your first user and start tracking!

## Support

If you encounter issues:
- Check Vercel deployment logs
- Check Supabase logs
- Review error messages carefully
- Ensure all environment variables are set correctly
