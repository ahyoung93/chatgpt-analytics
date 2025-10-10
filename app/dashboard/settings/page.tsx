'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Building2, Code, Shield, Trash2, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface App {
  id: string;
  name: string;
  category: string;
  write_key?: string;
}

export default function SettingsPage() {
  const { orgId } = useAuth();
  const [orgName, setOrgName] = useState('My Organization');
  const [selectedApp, setSelectedApp] = useState('');
  const [optInBenchmarks, setOptInBenchmarks] = useState(true);
  const [copied, setCopied] = useState(false);
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch apps
        const appsResponse = await fetch('/api/apps');
        if (appsResponse.ok) {
          const appsData = await appsResponse.json();
          setApps(appsData.apps || []);
          if (appsData.apps && appsData.apps.length > 0) {
            setSelectedApp(appsData.apps[0].id);
          }
        }

        // Fetch org details
        if (orgId) {
          const orgResponse = await fetch(`/api/orgs/${orgId}`);
          if (orgResponse.ok) {
            const orgData = await orgResponse.json();
            setOrgName(orgData.org?.name || 'My Organization');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orgId]);

  const selectedAppData = apps.find(app => app.id === selectedApp);

  const sdkCode = `import { createClient } from '@odin-analytics/sdk';

// Initialize with your app's write key
const analytics = createClient({
  appKey: '${selectedAppData?.write_key || 'sk_your_write_key_here'}'
});

// Track events
await analytics.invoked();
await analytics.completed({ latency_ms: 1200 });
await analytics.error('API timeout');
await analytics.converted('purchase_completed');`;

  const copyCode = () => {
    navigator.clipboard.writeText(sdkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteApp = () => {
    if (confirm('Are you sure you want to delete this app? This action cannot be undone.')) {
      // TODO: Implement delete
      console.log('Deleting app:', selectedApp);
    }
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

          {/* SDK Integration */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Code className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">SDK Integration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="appSelect" className="block text-sm font-medium text-gray-700 mb-2">
                  Select App
                </label>
                {loading ? (
                  <div className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400">
                    Loading apps...
                  </div>
                ) : apps.length === 0 ? (
                  <div className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400">
                    No apps found. Create an app first.
                  </div>
                ) : (
                  <select
                    id="appSelect"
                    value={selectedApp}
                    onChange={(e) => setSelectedApp(e.target.value)}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    {apps.map(app => (
                      <option key={app.id} value={app.id}>{app.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Integration Code
                  </label>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{sdkCode}</pre>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Installation:</strong> Run <code className="bg-white px-2 py-0.5 rounded">npm install @odin-analytics/sdk</code> to get started.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Privacy Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start justify-between py-3 border-b border-gray-100">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    Opt-in to Anonymous Benchmarks
                  </h3>
                  <p className="text-sm text-gray-600">
                    Include your app&apos;s anonymized data in category benchmarks. Requires Pro plan. Your data is protected with k-anonymity (k ≥ 7).
                  </p>
                </div>
                <button
                  onClick={() => setOptInBenchmarks(!optInBenchmarks)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ml-4 ${
                    optInBenchmarks ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      optInBenchmarks ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Privacy Guarantee:</strong> We never collect PII, raw prompts, or user data. Only aggregate metrics (success rate, latency) are used for benchmarks.
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg border-2 border-red-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    Delete App: {selectedAppData?.name}
                  </h3>
                  <p className="text-sm text-gray-600 max-w-xl">
                    Permanently delete this app and all associated event data. This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleDeleteApp}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold whitespace-nowrap ml-4"
                >
                  Delete App
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
