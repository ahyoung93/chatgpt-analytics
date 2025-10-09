export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Documentation</h1>

        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
            <p className="mb-4">Install the SDK and start tracking your ChatGPT app events.</p>

            <h3 className="text-xl font-semibold mb-2">Installation</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4">
              <code>npm install @odin-analytics/sdk</code>
            </pre>

            <h3 className="text-xl font-semibold mb-2">Usage</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg">
              <code>{`import { createClient } from '@odin-analytics/sdk';

const analytics = createClient({ appKey: 'sk_...' });

await analytics.track('invoked');
await analytics.track('completed', { latency_ms: 1200 });`}</code>
            </pre>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold mb-4">Event Types</h2>
            <ul className="space-y-2">
              <li><strong>invoked:</strong> Your app was called</li>
              <li><strong>completed:</strong> Your app succeeded</li>
              <li><strong>error:</strong> Your app failed</li>
              <li><strong>converted:</strong> User achieved a goal</li>
              <li><strong>custom:</strong> Your own event</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
