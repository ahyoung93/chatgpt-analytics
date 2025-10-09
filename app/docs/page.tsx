import Link from 'next/link';
import { ArrowLeft, Code, Book, Zap } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Documentation
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Everything you need to integrate ChatGPT Analytics into your application.
          </p>

          {/* Quick Start */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Quick Start</h2>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Install the SDK</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-6 overflow-x-auto">
                <code>npm install @chatgpt-analytics/sdk-js</code>
              </pre>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Initialize</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-6 overflow-x-auto">
                <code>{`import { ChatGPTAnalytics } from '@chatgpt-analytics/sdk-js';

const analytics = new ChatGPTAnalytics('your-api-key');`}</code>
              </pre>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Track Messages</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>{`await analytics.track({
  sessionId: 'unique-session-id',
  message: {
    role: 'user',
    content: 'Hello, ChatGPT!',
    model: 'gpt-4',
    totalTokens: 15
  }
});`}</code>
              </pre>
            </div>
          </section>

          {/* API Reference */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">API Reference</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">POST /api/track</h3>
                <p className="text-gray-600 mb-4">Track a ChatGPT message.</p>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Headers:</p>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                    <code>x-api-key: your_api_key</code>
                  </pre>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Body:</p>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                    <code>{`{
  "sessionId": "string",
  "message": {
    "role": "user" | "assistant" | "system",
    "content": "string",
    "model": "string",
    "promptTokens": number,
    "completionTokens": number,
    "totalTokens": number,
    "latencyMs": number
  }
}`}</code>
                  </pre>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">GET /api/metrics</h3>
                <p className="text-gray-600 mb-4">Get analytics metrics.</p>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Query Parameters:</p>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                    <code>{`startDate: ISO date string (optional)
endDate: ISO date string (optional)
includeSessions: boolean (optional)`}</code>
                  </pre>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">POST /api/export</h3>
                <p className="text-gray-600 mb-4">Export analytics data.</p>

                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Body:</p>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                    <code>{`{
  "format": "csv" | "json" | "pdf",
  "startDate": "ISO date string",
  "endDate": "ISO date string"
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Examples */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Book className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Examples</h2>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Full Integration Example
              </h3>

              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import OpenAI from 'openai';
import { ChatGPTAnalytics } from '@chatgpt-analytics/sdk-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const analytics = new ChatGPTAnalytics(process.env.ANALYTICS_API_KEY);

const sessionId = 'user-123-session-abc';

async function chat(userMessage: string) {
  const startTime = Date.now();

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: userMessage }]
  });

  const latency = Date.now() - startTime;

  // Track user message
  await analytics.track({
    sessionId,
    message: {
      role: 'user',
      content: userMessage,
      model: 'gpt-4'
    }
  });

  // Track assistant response
  await analytics.track({
    sessionId,
    message: {
      role: 'assistant',
      content: response.choices[0].message.content,
      model: 'gpt-4',
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      totalTokens: response.usage?.total_tokens,
      latencyMs: latency
    }
  });

  return response.choices[0].message.content;
}

// Use it
const reply = await chat('Hello, how are you?');
console.log(reply);`}</code>
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
