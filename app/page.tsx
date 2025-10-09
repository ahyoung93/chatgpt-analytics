import Link from 'next/link';
import { BarChart3, Zap, Shield, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Odin</span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Docs
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">Odin</span>
            <br />
            Analytics for ChatGPT Apps
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Track performance, reliability, and user adoption of your Custom GPTs,
            Plugins, and MCP servers. Privacy-first analytics with category benchmarks.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              Start Free
            </Link>
            <Link
              href="/docs"
              className="px-8 py-4 bg-white text-gray-900 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors text-lg font-semibold"
            >
              View Docs
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              App Performance
            </h3>
            <p className="text-gray-600">
              Track invoked, completed, error, and conversion events for your ChatGPT apps.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Category Benchmarks
            </h3>
            <p className="text-gray-600">
              Compare your app against others in your category with privacy-protected benchmarks.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Privacy-First
            </h3>
            <p className="text-gray-600">
              No PII, no raw prompts. K-anonymity protection for benchmarks (≥7 apps required).
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Simple SDK
            </h3>
            <p className="text-gray-600">
              Just 3 lines of code. Works with Custom GPTs, Plugins, and MCP servers.
            </p>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-24 bg-gray-900 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Get Started in Seconds</h2>
          <pre className="bg-black/30 p-6 rounded-lg overflow-x-auto">
            <code>{`import { createClient } from '@odin-analytics/sdk';

const analytics = createClient({ appKey: 'sk_...' });

await analytics.track('invoked');
await analytics.track('completed', { latency_ms: 1200 });
await analytics.track('converted', { name: 'purchase' });`}</code>
          </pre>
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to track your ChatGPT app?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Start free with 7 days retention. Upgrade for benchmarks and more.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold"
          >
            Start Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Odin Analytics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
