# ChatGPT Analytics SaaS Platform

A comprehensive analytics platform for tracking ChatGPT usage, costs, and performance metrics.

## Features

- **Real-time Analytics**: Track every ChatGPT conversation with detailed metrics
- **Cost Monitoring**: Monitor token usage and associated costs across different models
- **Session Management**: Organize conversations into sessions with metadata
- **Data Export**: Export analytics data in CSV, JSON, or PDF formats
- **Subscription Tiers**: Free, Pro, and Enterprise plans with Stripe integration
- **API Rate Limiting**: Built-in rate limiting per subscription tier
- **Secure Authentication**: API key-based authentication
- **Beautiful Dashboard**: Modern, responsive UI built with Next.js and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Authentication**: API Key-based
- **Deployment**: Vercel

## Project Structure

```
chatgpt-analytics/
├── app/
│   ├── api/
│   │   ├── track/          # Track ChatGPT messages
│   │   ├── metrics/        # Get analytics data
│   │   ├── billing/        # Stripe billing
│   │   ├── export/         # Data export
│   │   └── webhooks/       # Stripe webhooks
│   ├── dashboard/          # Analytics dashboard
│   ├── pricing/            # Pricing page
│   ├── docs/               # Documentation
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── ExportButton.tsx
│   ├── MetricsChart.tsx
│   ├── StatsCard.tsx
│   ├── PricingCard.tsx
│   └── SessionsList.tsx
├── lib/                    # Utility libraries
│   ├── db.ts              # Database utilities
│   ├── auth.ts            # Authentication
│   ├── stripe.ts          # Stripe integration
│   ├── metrics.ts         # Analytics calculations
│   └── export.ts          # Data export
├── packages/
│   └── sdk-js/            # JavaScript SDK
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
git clone <your-repo-url>
cd chatgpt-analytics
npm install
```

### 3. Set Up Environment Variables

Your `.env.local` file is already configured. Make sure all values are correct.

### 4. Run Database Migration

Follow the instructions in `scripts/run-migration.md` to set up your Supabase database.

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

## Deployment

Follow the comprehensive deployment guide in `DEPLOYMENT.md`.

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add all environment variables from `.env.local`
4. Deploy!

## API Documentation

### Authentication

All API endpoints require an API key in the header:

```
x-api-key: your_api_key_here
```

### POST /api/track

Track a ChatGPT message.

**Request:**
```json
{
  "sessionId": "unique-session-id",
  "message": {
    "role": "user",
    "content": "Hello, ChatGPT!",
    "model": "gpt-4",
    "promptTokens": 10,
    "completionTokens": 20,
    "totalTokens": 30,
    "latencyMs": 1500
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "uuid",
  "sessionId": "uuid",
  "cost": 0.0015,
  "remainingCalls": 999
}
```

### GET /api/metrics

Get analytics metrics.

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `includeSessions` (optional): boolean

**Response:**
```json
{
  "success": true,
  "dateRange": {
    "start": "2024-01-01T00:00:00.000Z",
    "end": "2024-01-31T23:59:59.999Z"
  },
  "metrics": {
    "totalSessions": 150,
    "totalMessages": 1200,
    "totalTokens": 45000,
    "totalCost": 2.50,
    "avgLatency": 1200,
    "modelBreakdown": {
      "gpt-4": 800,
      "gpt-3.5-turbo": 400
    },
    "timeSeriesData": [...]
  }
}
```

### POST /api/export

Export analytics data.

**Request:**
```json
{
  "format": "csv",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response:**
```json
{
  "success": true,
  "exportId": "uuid",
  "message": "Export created successfully"
}
```

### POST /api/billing

Create a checkout session.

**Request:**
```json
{
  "tier": "pro",
  "successUrl": "https://your-app.com/success",
  "cancelUrl": "https://your-app.com/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "stripe_session_id",
  "url": "https://checkout.stripe.com/..."
}
```

## Using the SDK

### Installation

```bash
npm install @chatgpt-analytics/sdk-js
```

### Example Usage

```typescript
import { ChatGPTAnalytics } from '@chatgpt-analytics/sdk-js';

const analytics = new ChatGPTAnalytics('your-api-key');

// Track a message
await analytics.track({
  sessionId: 'user-123-session-abc',
  message: {
    role: 'user',
    content: 'Hello, ChatGPT!',
    model: 'gpt-4',
    totalTokens: 15
  }
});

// Get metrics
const metrics = await analytics.getMetrics({
  startDate: new Date('2024-01-01'),
  endDate: new Date()
});

// Export data
const exportResult = await analytics.export({
  format: 'csv'
});
```

## Pricing Plans

- **Free**: 1,000 API calls/month, 30 days retention, JSON export
- **Pro** ($29/mo): 10,000 API calls/month, 365 days retention, CSV & JSON export
- **Enterprise** ($99/mo): Unlimited calls, unlimited retention, all formats

## Database Schema

The platform uses the following main tables:

- `users` - User accounts and subscription info
- `chat_sessions` - ChatGPT conversation sessions
- `chat_messages` - Individual messages within sessions
- `usage_metrics` - Aggregated daily usage statistics
- `billing_history` - Stripe billing records
- `api_logs` - API request logs
- `exports` - Data export records

See `scripts/init_db.sql` for the complete schema.

## Environment Variables

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_PRICE_ID_ENTERPRISE=price_xxx

# NextAuth
NEXTAUTH_URL=your_app_url
NEXTAUTH_SECRET=random_secret_string

# App
NEXT_PUBLIC_APP_URL=your_app_url
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions:
- Check the documentation in `/docs`
- Review the deployment guide in `DEPLOYMENT.md`
- Open an issue on GitHub

## Next Steps

1. Complete the Supabase database migration
2. Deploy to Vercel
3. Set up Stripe webhook
4. Create Stripe products and price IDs
5. Test the API with the SDK
6. Monitor your first tracked conversations!

---

Built with ❤️ using Next.js, Supabase, and Stripe
