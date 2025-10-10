'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Check, Crown, Zap, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function BillingPage() {
  const { orgId } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro'>('free');
  const [loading, setLoading] = useState(false);
  const [appsCount, setAppsCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);

  const plans = {
    free: {
      name: 'Free',
      price: 0,
      description: 'Perfect for trying out Odin',
      features: [
        '7 days data retention',
        '1 ChatGPT app',
        'Basic metrics dashboard',
        'Up to 10,000 events/month'
      ],
      limits: {
        apps: 1,
        retention: '7 days'
      }
    },
    pro: {
      name: 'Pro',
      price: 19,
      description: 'For serious app developers',
      features: [
        '90 days data retention',
        'Up to 3 ChatGPT apps',
        'Category benchmarks',
        'CSV data export',
        'Up to 100,000 events/month',
        'Email support'
      ],
      limits: {
        apps: 3,
        retention: '90 days'
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);

        // Fetch apps count
        const appsResponse = await fetch('/api/apps');
        if (appsResponse.ok) {
          const appsData = await appsResponse.json();
          setAppsCount(appsData.apps?.length || 0);
        }

        // Fetch org to get current plan and billing date
        if (orgId) {
          const orgResponse = await fetch(`/api/orgs/${orgId}`);
          if (orgResponse.ok) {
            const orgData = await orgResponse.json();
            setCurrentPlan(orgData.org?.plan || 'free');
            setNextBillingDate(orgData.org?.next_billing_date || null);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [orgId]);

  const handleUpgrade = async (plan: 'pro') => {
    if (!orgId) {
      alert('Please sign in to upgrade your plan');
      return;
    }

    // Prevent double-clicks
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan,
          orgId: orgId,
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/billing`
        })
      });

      const data = await response.json();
      if (data.success && data.url) {
        // Open Stripe Checkout in new tab
        window.open(data.url, '_blank');
        setLoading(false);
      } else {
        setLoading(false);
        alert('Failed to create checkout session: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      setLoading(false);
      alert('An error occurred. Please try again.');
    }
  };

  const handleManageBilling = async () => {
    if (!orgId) {
      alert('Please sign in to manage billing');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/billing?orgId=${orgId}`, {
        method: 'GET'
      });

      const data = await response.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to open billing portal: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentPlanData = plans[currentPlan];

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing & Subscription</h1>

        {/* Current Plan */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{currentPlanData.name} Plan</h2>
                {currentPlan !== 'free' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-4">{currentPlanData.description}</p>
              <p className="text-3xl font-bold text-gray-900">
                ${currentPlanData.price}
                <span className="text-base font-normal text-gray-600">/month</span>
              </p>
            </div>
            {currentPlan !== 'free' && (
              <button
                onClick={handleManageBilling}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ExternalLink className="w-4 h-4" />
                Manage Billing
              </button>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Apps Used</p>
            <div className="flex items-baseline gap-2 mb-2">
              {loadingData ? (
                <span className="text-3xl font-bold text-gray-400">...</span>
              ) : (
                <>
                  <span className="text-3xl font-bold text-gray-900">{appsCount}</span>
                  <span className="text-gray-600">
                    / {currentPlanData.limits.apps === Infinity ? '∞' : currentPlanData.limits.apps}
                  </span>
                </>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: currentPlanData.limits.apps === Infinity
                    ? `${Math.min((appsCount / 10) * 100, 100)}%`
                    : `${Math.min((appsCount / currentPlanData.limits.apps) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Data Retention</p>
            <p className="text-3xl font-bold text-gray-900">{currentPlanData.limits.retention}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Next Billing Date</p>
            <p className="text-xl font-bold text-gray-900">
              {currentPlan === 'free'
                ? 'N/A'
                : loadingData
                  ? '...'
                  : nextBillingDate
                    ? new Date(nextBillingDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'N/A'
              }
            </p>
          </div>
        </div>

        {/* Plan Comparison - Always visible */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {currentPlan === 'free' ? 'Upgrade Your Plan' : 'Available Plans'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className={`bg-white rounded-lg border-2 p-8 relative ${
              currentPlan === 'free' ? 'border-blue-600' : 'border-gray-200'
            }`}>
              {currentPlan === 'free' && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                    Current Plan
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plans.free.name}</h3>
              <p className="text-gray-600 mb-4">{plans.free.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${plans.free.price}</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plans.free.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              {currentPlan === 'free' ? (
                <div className="w-full py-3 px-6 bg-gray-100 text-gray-600 rounded-lg text-center font-semibold">
                  Current Plan
                </div>
              ) : (
                <div className="w-full py-3 px-6 bg-gray-100 text-gray-500 rounded-lg text-center font-semibold">
                  Basic Features
                </div>
              )}
            </div>

            {/* Pro Plan */}
            <div className={`bg-white rounded-lg border-2 p-8 relative ${
              currentPlan === 'pro' ? 'border-blue-600' : 'border-blue-600'
            }`}>
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  {currentPlan === 'pro' ? 'Current Plan' : 'Recommended'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plans.pro.name}</h3>
              <p className="text-gray-600 mb-4">{plans.pro.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${plans.pro.price}</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plans.pro.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              {currentPlan === 'free' ? (
                <button
                  onClick={() => handleUpgrade('pro')}
                  disabled={loading}
                  className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Upgrade to Pro'}
                </button>
              ) : (
                <div className="w-full py-3 px-6 bg-blue-100 text-blue-700 rounded-lg text-center font-semibold">
                  Current Plan
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">All Plans Include</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Privacy-first analytics</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Real-time event tracking</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Metrics dashboard</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Simple SDK integration</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">No PII collection</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">K-anonymity protection</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
