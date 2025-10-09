'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';

interface PricingCardProps {
  name: string;
  price: number;
  features: string[];
  tier: 'free' | 'pro' | 'enterprise';
  currentTier?: 'free' | 'pro' | 'enterprise';
  apiKey?: string;
}

export function PricingCard({ name, price, features, tier, currentTier, apiKey }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isCurrent = currentTier === tier;
  const isUpgrade = currentTier && tier !== 'free' && currentTier !== tier;

  const handleSubscribe = async () => {
    if (!apiKey || tier === 'free') return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({ tier })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 p-8 ${
        tier === 'pro'
          ? 'border-blue-600 shadow-xl scale-105'
          : 'border-gray-200'
      }`}
    >
      {tier === 'pro' && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>

      <div className="mb-6">
        <span className="text-5xl font-bold text-gray-900">${price}</span>
        <span className="text-gray-600">/month</span>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubscribe}
        disabled={isCurrent || isLoading || !apiKey}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
          isCurrent
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : tier === 'pro'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {isLoading
          ? 'Loading...'
          : isCurrent
          ? 'Current Plan'
          : isUpgrade
          ? 'Upgrade'
          : tier === 'free'
          ? 'Get Started'
          : 'Subscribe'}
      </button>
    </div>
  );
}
