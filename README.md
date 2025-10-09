# Odin - Analytics for ChatGPT Apps

A privacy-first analytics platform for tracking ChatGPT App performance. Monitor Custom GPTs, Plugins, and MCP servers with category benchmarks and k-anonymity protection.

## Features

- **Event Tracking**: Track invoked, completed, error, converted, and custom events
- **Category Benchmarks**: Compare your app against others in your category with privacy protection (≥7 apps required)
- **Privacy-First**: No PII collection, no raw prompts, optional prompt hashing for deduplication
- **Plan-Based Retention**: Free (7 days), Pro (90 days), Team (180 days)
- **Rate Limiting**: 10 requests/second per write key
- **Simple SDK**: 3 lines of code to get started
- **Beautiful Dashboard**: Modern UI for visualizing app metrics (coming soon)

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Authentication**: API Key-based (x-app-key header)
- **Deployment**: Vercel

## Project Structure

```
chatgpt-analytics/
├── app/
│   ├── api/
│   │   ├── track/          # Event tracking endpoint
│   │   ├── metrics/        # Get app metrics
│   │   ├── export/         # CSV data export
│   │   ├── billing/        # Stripe billing
│   │   └── webhooks/       # Stripe webhooks
│   ├── dashboard/          # Dashboard UI
│   ├── pricing/            # Pricing page
│   ├── docs/               # Documentation
│   └── page.tsx            # Landing page
├── lib/                    # Utility libraries
│   ├── db.ts              # Database utilities
│   ├── auth.ts            # Authentication
│   ├── stripe.ts          # Stripe integration
│   ├── metrics.ts         # Metrics calculations
│   └── benchmarks.ts      # Category benchmarks
├── packages/
│   └── sdk-js/            # Official JavaScript SDK
├── scripts/
│   └── init_db.sql        # Database schema
└── .env.local             # Environment variables
```

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account
- Stripe account (for payments)
- Vercel account (for deployment)

### 2. Clone and Install

```bash
git clone https://github.com/ahyoung93/chatgpt-analytics
cd chatgpt-analytics
npm install
```

### 3. Set Up Environment Variables

Configure `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# NextAuth
NEXTAUTH_URL=your_app_url
NEXTAUTH_SECRET=random_secret_string

# App
NEXT_PUBLIC_APP_URL=your_app_url
```

### 4. Run Database Migration

Execute the SQL in `scripts/init_db.sql` in your Supabase SQL editor.

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 6. Build for Production

```bash
npm run build
npm start
```

## Using the Odin SDK

### Installation

```bash
npm install @odin-analytics/sdk
```

### Example Usage

```typescript
import { createClient } from '@odin-analytics/sdk';

// Initialize with your app's write key
const analytics = createClient({ appKey: 'sk_...' });

// Track events
await analytics.invoked();
await analytics.completed({ latency_ms: 1200 });
await analytics.error('API timeout');
await analytics.converted('purchase_completed');
await analytics.custom('user_feedback', { rating: 5 });
```

### Event Types

- **invoked** - Your app was called
- **completed** - Your app succeeded (optionally include latency_ms)
- **error** - Your app failed (optionally include error_message)
- **converted** - User achieved a goal (optionally include conversion name)
- **custom** - Your own custom event

## API Documentation

### Authentication

All API endpoints require a write key in the header:

```
x-app-key: sk_your_write_key_here
```

### POST /api/track

Track a ChatGPT app event.

**Request:**
```json
{
  "event": "completed",
  "latency_ms": 1200,
  "properties": {
    "user_tier": "premium"
  }
}
```

**Response:**
```json
{
  "success": true,
  "event_id": "uuid"
}
```

### GET /api/metrics

Get app metrics summary.

**Query Parameters:**
- `app_id` (required): Your app ID
- `start_date` (required): ISO date string
- `end_date` (required): ISO date string

**Response:**
```json
{
  "success": true,
  "metrics": {
    "total_events": 1500,
    "invoked_count": 500,
    "completed_count": 450,
    "error_count": 50,
    "success_rate": 0.90,
    "avg_latency_ms": 1200
  }
}
```

### GET /api/benchmarks

Get category benchmarks (requires Pro or Team plan).

**Query Parameters:**
- `app_id` (required): Your app ID
- `start_date` (required): ISO date string
- `end_date` (required): ISO date string

**Response:**
```json
{
  "success": true,
  "available": true,
  "benchmarks": {
    "category": "productivity",
    "your_success_rate": 0.92,
    "category_avg_success_rate": 0.85,
    "your_avg_latency": 1100,
    "category_avg_latency": 1500
  }
}
```

### POST /api/export

Export analytics data (requires Pro or Team plan).

**Request:**
```json
{
  "app_id": "uuid",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

**Response:**
CSV file download

## Pricing Plans

- **Free** ($0/mo): 7 days retention, 1 app, 10k events/month
- **Pro** ($49/mo): 90 days retention, 5 apps, 100k events/month, category benchmarks, CSV export
- **Team** ($99/mo): 180 days retention, unlimited apps, unlimited events, priority support

## Categories

Your app can be categorized as:
- Travel
- Productivity
- Dev Tools
- Shopping
- Education
- Entertainment
- Customer Support
- Content Generation
- Data Analysis
- Other

Category benchmarks require ≥7 apps for k-anonymity privacy protection.

## Database Schema

Key tables:
- `orgs` - Organizations with subscription plans
- `org_members` - Team members and roles
- `apps` - ChatGPT apps with write keys
- `events` - Individual event records
- `app_daily_metrics` - Aggregated daily metrics
- `category_daily_benchmarks` - Privacy-protected benchmarks
- `subscriptions` - Stripe subscription data

See `scripts/init_db.sql` for the complete schema.

## Privacy

Odin is privacy-first:
- ✅ No PII collection
- ✅ No raw prompts stored
- ✅ Optional prompt hashing for deduplication
- ✅ K-anonymity protection for benchmarks (≥7 apps)
- ✅ Plan-based data retention
- ✅ No cross-app tracking

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import repository on Vercel
3. Add all environment variables
4. Deploy!

### Post-Deployment

1. Run database migration in Supabase
2. Create Stripe products (Pro $49, Team $99)
3. Configure Stripe webhook: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Test with the SDK

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

- Documentation: https://your-domain.com/docs
- Issues: https://github.com/ahyoung93/chatgpt-analytics/issues

---

Built with Next.js, Supabase, and Stripe
