'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Building2, CreditCard, Users } from 'lucide-react';

export default function SettingsPage() {
  const [orgName, setOrgName] = useState('My Organization');
  const [plan, setPlan] = useState('free');

  const plans = {
    free: { name: 'Free', price: '$0/month', features: ['7 days retention', '1 app', '10k events/month'] },
    pro: { name: 'Pro', price: '$49/month', features: ['90 days retention', '5 apps', 'Benchmarks', 'CSV export'] },
    team: { name: 'Team', price: '$99/month', features: ['180 days retention', 'Unlimited apps', 'Priority support'] }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Organization Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Organization</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  id="orgName"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Subscription</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans[plan as keyof typeof plans].name}
                  <span className="text-base font-normal text-gray-600 ml-2">
                    {plans[plan as keyof typeof plans].price}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Features</p>
                <ul className="space-y-1">
                  {plans[plan as keyof typeof plans].features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600">✓ {feature}</li>
                  ))}
                </ul>
              </div>
              {plan === 'free' && (
                <a
                  href="/pricing"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upgrade Plan
                </a>
              )}
              {plan !== 'free' && (
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Manage Subscription
                </button>
              )}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Invite Member
              </button>
            </div>
            <div className="text-center py-8 text-gray-500">
              No team members yet. Invite collaborators to join your organization.
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
