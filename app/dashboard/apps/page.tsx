'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import IntegrationGuide from '@/components/IntegrationGuide';
import { Plus, Copy, Eye, EyeOff, Trash2 } from 'lucide-react';

interface App {
  id: string;
  name: string;
  category: string;
  write_key: string;
  created_at: string;
}

export default function AppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newApp, setNewApp] = useState({
    name: '',
    category: 'writing' as string
  });

  const categories = [
    'writing',
    'productivity',
    'research_analysis',
    'education',
    'lifestyle',
    'dalle',
    'programming'
  ];

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/apps');

      if (!response.ok) {
        throw new Error('Failed to fetch apps');
      }

      const data = await response.json();
      setApps(data.apps || []);
    } catch (err: any) {
      console.error('Error fetching apps:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setCreating(true);
      setError(null);

      const response = await fetch('/api/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newApp)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create app');
      }

      // Success! Refresh the apps list
      await fetchApps();
      setShowModal(false);
      setNewApp({ name: '', category: 'writing' });
    } catch (err: any) {
      console.error('Error creating app:', err);
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this app? All associated events will be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`/api/apps/${appId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete app');
      }

      // Success! Refresh the apps list
      await fetchApps();
    } catch (err: any) {
      console.error('Error deleting app:', err);
      setError(err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Show toast notification
  };

  const toggleKeyVisibility = (appId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(appId)) {
      newVisible.delete(appId);
    } else {
      newVisible.add(appId);
    }
    setVisibleKeys(newVisible);
  };

  const formatCategory = (category: string) => {
    return category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Connected Apps</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Connect App
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Universal Integration Guide - Only show if apps exist */}
        {!loading && apps.length > 0 && (
          <IntegrationGuide />
        )}

        {!loading && apps.length > 0 && false && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Integration Guide</h2>
            <p className="text-gray-700 mb-4">
              Follow these simple steps to connect your Custom GPT. Takes about 2 minutes!
            </p>
            <p className="text-sm text-gray-600 mb-6">
              💡 Tip: Click each step to expand detailed instructions
            </p>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">1. Copy your API key</h3>
                <p className="text-sm text-gray-600">
                  Each app has its own unique API key shown in the card above. Click the copy icon to copy it. You&apos;ll paste this in step 3.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">2. Add this OpenAPI schema to your Custom GPT</h3>
                <p className="text-sm text-gray-600 mb-3">
                  In ChatGPT → Configure → Actions → Create new action → paste this schema:
                </p>
                <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
                  <pre>{`{
  "openapi": "3.1.0",
  "info": {
    "title": "Odin Analytics API",
    "description": "Track events for ChatGPT analytics",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://chatgpt-analytics-plum.vercel.app"
    }
  ],
  "paths": {
    "/api/track-gpt": {
      "post": {
        "summary": "Track an analytics event from GPT",
        "operationId": "trackEvent",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["event"],
                "properties": {
                  "event": {
                    "type": "string",
                    "enum": ["invoked", "completed", "error", "converted"],
                    "description": "Type of event to track"
                  },
                  "name": {
                    "type": "string",
                    "description": "Custom event name"
                  },
                  "prompt": {
                    "type": "string",
                    "description": "User prompt (will be hashed automatically)"
                  },
                  "user_id": {
                    "type": "string",
                    "description": "User ID (will be hashed automatically)"
                  },
                  "latency_ms": {
                    "type": "number",
                    "description": "Response latency in milliseconds"
                  },
                  "error_message": {
                    "type": "string",
                    "description": "Error message if event type is error"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Event tracked successfully"
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "ApiKeyAuth": {
        "type": "apiKey",
        "in": "header",
        "name": "x-app-key"
      }
    }
  },
  "security": [
    {
      "ApiKeyAuth": []
    }
  ]
}`}</pre>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">3. Configure authentication</h3>
                <p className="text-sm text-gray-600 mb-3">
                  In the Action authentication settings:
                </p>
                <ol className="text-sm text-gray-600 space-y-2 ml-4 list-decimal">
                  <li>Click the Authentication dropdown and select <strong>&quot;API Key&quot;</strong></li>
                  <li>Select <strong>&quot;Custom&quot;</strong> as the Auth Type</li>
                  <li>In the API Key field, paste your API key from step 1</li>
                  <li>In the Custom Header Name field, enter: <code className="bg-gray-100 px-1.5 py-0.5 rounded">x-app-key</code></li>
                </ol>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">4. Update your GPT instructions</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Add these tracking calls to your GPT&apos;s instructions for full analytics:
                </p>
                <div className="bg-gray-50 border border-gray-200 p-3 rounded text-xs space-y-3">
                  <div>
                    <p className="text-gray-700 font-semibold mb-1">Basic tracking:</p>
                    <p className="text-gray-600">
                      When a user starts a conversation, call trackEvent with event=&quot;invoked&quot;, prompt=&quot;[user message]&quot;, user_id=&quot;[user ID]&quot;
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold mb-1">Track completions:</p>
                    <p className="text-gray-600">
                      When you finish helping the user, call trackEvent with event=&quot;completed&quot;, latency_ms=[time taken]
                    </p>
                  </div>
                </div>
                <div className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded text-xs">
                  <p className="text-blue-800">
                    <strong>Note:</strong> The API automatically hashes prompts and user IDs for privacy. You can send raw data safely.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-green-700 mb-2">✓ That&apos;s it!</h3>
                <p className="text-sm text-gray-600">
                  Your Custom GPT will now automatically track events. View your analytics across all dashboard tabs: Events, Prompts, Retention, and Benchmarks.
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No apps connected yet</h2>
            <p className="text-gray-600 mb-6">
              Connect your ChatGPT app to get your API key and start tracking analytics
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Connect Your First App
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {apps.map((app) => (
              <div key={app.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{app.name}</h3>
                    <p className="text-sm text-gray-600">{formatCategory(app.category)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteApp(app.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">API Write Key</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleKeyVisibility(app.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {visibleKeys.has(app.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(app.write_key)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <code className="text-sm text-gray-900 font-mono block break-all">
                    {visibleKeys.has(app.id)
                      ? app.write_key
                      : app.write_key.substring(0, 12) + '••••••••••••••••••••'}
                  </code>
                </div>


                <div className="text-sm text-gray-500">
                  Created {new Date(app.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Connect App Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your App</h2>
              <p className="text-gray-600 mb-6">Enter your ChatGPT app details to get your tracking API key</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateApp} className="space-y-4">
                <div>
                  <label htmlFor="appName" className="block text-sm font-medium text-gray-700 mb-2">
                    ChatGPT App Name
                  </label>
                  <input
                    id="appName"
                    type="text"
                    value={newApp.name}
                    onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                    placeholder="My ChatGPT App"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={newApp.category}
                    onChange={(e) => setNewApp({ ...newApp, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {formatCategory(cat)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setNewApp({ name: '', category: 'writing' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Connecting...' : 'Connect App'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
