import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PricingCard } from '@/components/PricingCard';
import { PRICING_PLANS } from '@/lib/stripe';

export default function PricingPage() {
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
            Choose the plan that works best for you. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard
            name={PRICING_PLANS.free.name}
            price={PRICING_PLANS.free.price}
            features={[...PRICING_PLANS.free.features]}
            tier="free"
          />
          <PricingCard
            name={PRICING_PLANS.pro.name}
            price={PRICING_PLANS.pro.price}
            features={[...PRICING_PLANS.pro.features]}
            tier="pro"
          />
          <PricingCard
            name={PRICING_PLANS.enterprise.name}
            price={PRICING_PLANS.enterprise.price}
            features={[...PRICING_PLANS.enterprise.features]}
            tier="enterprise"
          />
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time from your dashboard.
                Changes take effect immediately.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens if I exceed my API call limit?
              </h3>
              <p className="text-gray-600">
                If you reach your monthly API call limit, tracking will pause until the next
                billing cycle or you can upgrade to a higher tier immediately.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely. We use industry-standard encryption and security practices. Your
                data is stored securely and never shared with third parties.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                Yes, we offer a 30-day money-back guarantee. If you&apos;re not satisfied with our
                service, contact support for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
