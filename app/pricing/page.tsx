import Link from 'next/link';
import { Check, ArrowLeft } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: 0,
      description: 'Perfect for trying out the platform',
      features: [
        '7 days data retention',
        '1 ChatGPT app',
        'Basic metrics dashboard',
        'Up to 10,000 events/month'
      ]
    },
    {
      name: 'Pro',
      price: 19,
      description: 'For serious app developers',
      popular: true,
      features: [
        '90 days data retention',
        'Up to 5 ChatGPT apps',
        'Category benchmarks',
        'CSV data export',
        'Up to 100,000 events/month',
        'Email support'
      ]
    },
    {
      name: 'Team',
      price: 59,
      description: 'For teams building multiple apps',
      features: [
        '180 days data retention',
        'Unlimited ChatGPT apps',
        'Category benchmarks',
        'CSV data export',
        'Unlimited events',
        'Priority support',
        'Team collaboration'
      ]
    }
  ];

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
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free, upgrade when you need more. All plans include privacy-first analytics.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg border-2 p-8 ${
                plan.popular
                  ? 'border-blue-600 shadow-xl scale-105'
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600">/month</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors block text-center ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {plan.price === 0 ? 'Get Started' : 'Subscribe'}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What counts as an event?
              </h3>
              <p className="text-gray-600">
                Each time your app calls analytics.track() counts as one event. This includes
                invoked, completed, error, converted, and custom events.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What are category benchmarks?
              </h3>
              <p className="text-gray-600">
                Compare your app&apos;s success rate and performance against other apps in the same category
                (e.g., Travel, Productivity). Benchmarks require ≥7 apps for privacy (k-anonymity).
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade anytime?
              </h3>
              <p className="text-gray-600">
                Yes! Changes take effect immediately. When downgrading, older data beyond your new
                retention period will be archived but not deleted.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you collect any PII or raw prompts?
              </h3>
              <p className="text-gray-600">
                No. Odin only collects event metadata (type, timestamp, latency, etc.). You can
                optionally send a prompt hash for deduplication, but never raw user input.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
