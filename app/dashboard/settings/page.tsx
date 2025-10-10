'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Building2, Shield, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface App {
  id: string;
  name: string;
  category: string;
}

export default function SettingsPage() {
  const { orgId } = useAuth();
  const [orgName, setOrgName] = useState('My Organization');
  const [selectedApp, setSelectedApp] = useState('');
  const [optInBenchmarks, setOptInBenchmarks] = useState(true);
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

  const handleDeleteApp = async () => {
    if (!selectedApp || !selectedAppData) {
      alert('No app selected');
      return;
    }

    if (confirm(`Are you sure you want to delete "${selectedAppData.name}"? This action cannot be undone and will delete all associated event data.`)) {
      try {
        setLoading(true);
        const response = await fetch(`/api/apps/${selectedApp}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          // Remove the deleted app from the list
          const updatedApps = apps.filter(app => app.id !== selectedApp);
          setApps(updatedApps);

          // Select the first remaining app, or clear selection if no apps left
          if (updatedApps.length > 0) {
            setSelectedApp(updatedApps[0].id);
          } else {
            setSelectedApp('');
          }

          alert('App deleted successfully');
        } else {
          const data = await response.json();
          alert('Failed to delete app: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('An error occurred while deleting the app');
      } finally {
        setLoading(false);
      }
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
                  disabled={loading || !selectedApp}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold whitespace-nowrap ml-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Deleting...' : 'Delete App'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
