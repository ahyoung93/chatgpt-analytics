# ChatGPT App Analytics SDK

Official SDK for tracking ChatGPT App performance. Works with Custom GPTs, ChatGPT Plugins, and MCP servers.

## Installation

```bash
npm install @chatgpt-app-analytics/sdk
# or
yarn add @chatgpt-app-analytics/sdk
```

## Quick Start

```typescript
import { createClient } from '@chatgpt-app-analytics/sdk';

// Initialize with your app's write key
const analytics = createClient({ appKey: 'sk_...' });

// Track when your app is invoked
await analytics.track('invoked');

// Track successful completion
await analytics.track('completed', { latency_ms: 1200 });

// Track errors
await analytics.track('error', { error_message: 'API timeout' });

// Track conversions
await analytics.track('converted', {
  name: 'purchase_completed',
  properties: { amount: 99.99 }
});
```

## Event Types

- **invoked** - Your app was called
- **completed** - Your app succeeded
- **error** - Your app failed
- **converted** - User achieved a goal
- **custom** - Your own custom event

## Helper Methods

```typescript
// Shorthand methods for common events
await analytics.invoked();
await analytics.completed({ latency_ms: 1200 });
await analytics.error('Database connection failed');
await analytics.converted('purchase_completed');
await analytics.custom('user_feedback', { rating: 5 });
```

## Advanced Usage

### With Properties

```typescript
await analytics.track('invoked', {
  properties: {
    source: 'suggestion',
    user_tier: 'premium'
  }
});
```

### With Latency Tracking

```typescript
const startTime = Date.now();
// ... your app logic ...
const latency = Date.now() - startTime;

await analytics.completed({ latency_ms: latency });
```

### With Prompt Hashing (Privacy-Safe)

```typescript
import crypto from 'crypto';

const promptHash = crypto
  .createHash('sha256')
  .update(userPrompt)
  .digest('hex');

await analytics.invoked({ prompt_hash: promptHash });
```

## Configuration

```typescript
const analytics = createClient({
  appKey: 'sk_...',           // Required: Your app write key
  baseUrl: 'https://...',     // Optional: Custom API URL
  timeout: 5000               // Optional: Request timeout (ms)
});
```

## Error Handling

The SDK fails silently by default to not break your app. Errors are logged to console but won't throw.

## Privacy

- No PII is collected
- No raw prompts are stored
- Optional prompt hashing for deduplication
- All data retention follows your plan tier

## Support

- Documentation: https://your-docs-url
- Issues: https://github.com/ahyoung93/chatgpt-analytics/issues

## License

MIT
