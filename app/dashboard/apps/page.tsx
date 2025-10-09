'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
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
  const [newApp, setNewApp] = useState({
    name: '',
    category: 'other' as string
  });

  const categories = [
    'travel',
    'productivity',
    'dev_tools',
    'shopping',
    'education',
    'entertainment',
    'customer_support',
    'content_generation',
    'data_analysis',
    'other'
  ];

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    // TODO: Fetch actual apps from API
    setLoading(false);
    setApps([]);
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to create app
    console.log('Creating app:', newApp);
    setShowModal(false);
    setNewApp({ name: '', category: 'other' });
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
          <h1 className="text-3xl font-bold text-gray-900">Your Apps</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create App
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No apps yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first app to get started with Odin analytics
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First App
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
                  <button className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
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
                  <code className="text-sm text-gray-900 font-mono">
                    {visibleKeys.has(app.id)
                      ? app.write_key
                      : app.write_key.substring(0, 12) + '••••••••••••••••••••'}
                  </code>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  Created {new Date(app.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create App Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New App</h2>
              <form onSubmit={handleCreateApp} className="space-y-4">
                <div>
                  <label htmlFor="appName" className="block text-sm font-medium text-gray-700 mb-2">
                    App Name
                  </label>
                  <input
                    id="appName"
                    type="text"
                    value={newApp.name}
                    onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                      setNewApp({ name: '', category: 'other' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create App
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
