import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Odin</span>
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Privacy Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
          <section>
            <p className="text-sm text-gray-600 mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>
            <p className="text-gray-700">
              Odin Analytics ("we", "our", or "us") provides analytics services for Custom GPT applications.
              This Privacy Policy explains how we collect, use, and protect information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Account Information</h3>
                <p>When you create an account, we collect your email address and authentication credentials managed by Supabase Auth.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Analytics Events</h3>
                <p>When your Custom GPT sends events to our API, we collect:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Event type (invoked, completed, error, converted)</li>
                  <li>Timestamp</li>
                  <li>Optional: Revenue data, latency metrics</li>
                  <li>Optional: Hashed user IDs (SHA-256) for retention tracking</li>
                  <li>Optional: Hashed prompts (SHA-256) for pattern analysis</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
                <p>Payment processing is handled by Stripe. We do not store your credit card details. We only receive confirmation of successful payments and subscription status.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Provide analytics dashboards showing your GPT's performance</li>
              <li>Calculate aggregate category benchmarks (with k-anonymity ≥ 5 apps)</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send service-related communications</li>
              <li>Improve our service and develop new features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Privacy-First Design</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>User Privacy:</strong> We never collect raw user IDs or personally identifiable information.
                If you track retention, you must hash user IDs with SHA-256 before sending them to our API.
              </p>
              <p>
                <strong>Prompt Privacy:</strong> We never collect actual prompt text. If you track prompts,
                you must hash them with SHA-256 before sending to our API.
              </p>
              <p>
                <strong>Benchmarks:</strong> Category benchmarks are only shown when at least 5 apps exist
                in a category (k-anonymity protection), preventing identification of individual apps.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
            <div className="space-y-4 text-gray-700">
              <p>We do not sell your data. We only share data in these limited circumstances:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Service Providers:</strong> Supabase (database), Stripe (payments), Vercel (hosting)</li>
                <li><strong>Aggregate Benchmarks:</strong> Anonymous category-level statistics (k-anonymity ≥ 5)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Free Plan:</strong> Events are retained for 7 days</p>
              <p><strong>Pro Plan:</strong> Events are retained for 90 days</p>
              <p>After canceling your account, all your data is permanently deleted within 30 days.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
            <p className="text-gray-700">
              We implement industry-standard security measures including encryption in transit (HTTPS),
              Row Level Security in our database, API key authentication, and regular security updates.
              However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li><strong>Access:</strong> View all your data in the dashboard</li>
              <li><strong>Export:</strong> Download your events as CSV (Pro plan)</li>
              <li><strong>Delete:</strong> Delete individual apps or your entire account</li>
              <li><strong>Correct:</strong> Update your account information in settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Supabase:</strong> Database and authentication - <a href="https://supabase.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
              <p><strong>Stripe:</strong> Payment processing - <a href="https://stripe.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
              <p><strong>Vercel:</strong> Hosting - <a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700">
              Our service is not intended for users under 13 years of age. We do not knowingly collect
              information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:privacy@odinanalytics.com" className="text-blue-600 hover:underline">
                privacy@odinanalytics.com
              </a>
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>&copy; 2024 Odin Analytics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
