'use client';

import { useEffect, useState } from 'react';
import { BarChart3, MessageSquare, DollarSign, Zap, Download } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { MetricsChart } from '@/components/MetricsChart';
import { SessionsList } from '@/components/SessionsList';
import { ExportButton } from '@/components/ExportButton';

export default function DashboardPage() {
  const [apiKey, setApiKey] = useState('');
  const [metrics, setMetrics] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'sessions' | 'messages' | 'tokens' | 'cost'>('tokens');

  const fetchMetrics = async () => {
    if (!apiKey) return;

    setLoading(true);

    try {
      const response = await fetch('/api/metrics?includeSessions=true', {
        headers: {
          'x-api-key': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiKey) {
      fetchMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">ChatGPT Analytics</h1>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Enter Your API Key
          </h2>

          <p className="text-gray-600 mb-6">
            To view your analytics dashboard, please enter your API key. You can find this
            in your account settings.
          </p>

          <input
            type="text"
            placeholder="cgpt_xxxxxxxxxx"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4"
          />

          <button
            onClick={fetchMetrics}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            View Dashboard
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Don&apos;t have an API key? Contact support to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">ChatGPT Analytics</h1>
            </div>

            <button
              onClick={() => setApiKey('')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && !metrics ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : metrics ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Sessions"
                value={metrics.totalSessions}
                icon={MessageSquare}
              />
              <StatsCard
                title="Total Messages"
                value={metrics.totalMessages}
                icon={MessageSquare}
              />
              <StatsCard
                title="Total Tokens"
                value={metrics.totalTokens.toLocaleString()}
                icon={Zap}
              />
              <StatsCard
                title="Total Cost"
                value={`$${metrics.totalCost.toFixed(2)}`}
                icon={DollarSign}
              />
            </div>

            {/* Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Usage Over Time</h2>

                <div className="flex gap-2">
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="sessions">Sessions</option>
                    <option value="messages">Messages</option>
                    <option value="tokens">Tokens</option>
                    <option value="cost">Cost</option>
                  </select>
                </div>
              </div>

              {metrics.timeSeriesData && metrics.timeSeriesData.length > 0 ? (
                <MetricsChart data={metrics.timeSeriesData} metric={selectedMetric} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No data available yet. Start tracking to see your metrics!
                </div>
              )}
            </div>

            {/* Export Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Data</h2>
              <p className="text-gray-600 mb-6">
                Download your analytics data in your preferred format.
              </p>

              <div className="flex gap-4">
                <ExportButton format="json" apiKey={apiKey} />
                <ExportButton format="csv" apiKey={apiKey} />
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Sessions</h2>
              <SessionsList sessions={sessions} />
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No data available. Start tracking your ChatGPT conversations!</p>
          </div>
        )}
      </div>
    </div>
  );
}
