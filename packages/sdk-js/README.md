# ChatGPT Analytics SDK

Track and analyze your ChatGPT usage with ease.

## Installation

```bash
npm install @chatgpt-analytics/sdk-js
# or
yarn add @chatgpt-analytics/sdk-js
```

## Quick Start

```typescript
import { ChatGPTAnalytics } from '@chatgpt-analytics/sdk-js';

// Initialize with your API key
const analytics = new ChatGPTAnalytics('your-api-key');

// Track a message
await analytics.track({
  sessionId: 'unique-session-id',
  message: {
    role: 'user',
    content: 'Hello, how are you?',
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
  format: 'csv',
  startDate: new Date('2024-01-01')
});
```

## Features

- Track ChatGPT conversations
- Get detailed analytics and metrics
- Export data in multiple formats (CSV, JSON, PDF)
- Monitor costs and token usage
- Manage subscriptions

## API Reference

### `track(options)`

Track a ChatGPT message.

**Parameters:**
- `sessionId` (string): Unique identifier for the conversation session
- `message` (object):
  - `role` ('user' | 'assistant' | 'system'): Message role
  - `content` (string): Message content
  - `model` (string, optional): Model used (e.g., 'gpt-4')
  - `promptTokens` (number, optional): Number of prompt tokens
  - `completionTokens` (number, optional): Number of completion tokens
  - `totalTokens` (number, optional): Total tokens used
  - `latencyMs` (number, optional): Response latency in milliseconds

### `getMetrics(options)`

Get analytics metrics.

**Parameters:**
- `startDate` (Date, optional): Start date for metrics
- `endDate` (Date, optional): End date for metrics
- `includeSessions` (boolean, optional): Include recent sessions

### `export(options)`

Export analytics data.

**Parameters:**
- `format` ('csv' | 'json' | 'pdf'): Export format
- `startDate` (Date, optional): Start date for export
- `endDate` (Date, optional): End date for export

## License

MIT
