'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { TrendingUp, TrendingDown, Activity, CheckCircle, XCircle, Zap } from 'lucide-react';

interface Stats {
  total_events: number;
  invoked_count: number;
  completed_count: number;
  error_count: number;
  success_rate: number;
  avg_latency_ms: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch actual stats from API
    // For now, show placeholder data
    setTimeout(() => {
      setStats({
        total_events: 0,
        invoked_count: 0,
        completed_count: 0,
        error_count: 0,
        success_rate: 0,
        avg_latency_ms: 0
      });
      setLoading(false);
    }, 500);
  }, []);

  const statCards = [
    {
      name: 'Total Events',
      value: stats?.total_events?.toLocaleString() || '0',
      icon: Activity,
      color: 'blue',
      change: '+0%'
    },
    {
      name: 'Success Rate',
      value: stats?.success_rate ? `${(stats.success_rate * 100).toFixed(1)}%` : '0%',
      icon: CheckCircle,
      color: 'green',
      change: '+0%'
    },
    {
      name: 'Avg Latency',
      value: stats?.avg_latency_ms ? `${stats.avg_latency_ms.toFixed(0)}ms` : '0ms',
      icon: Zap,
      color: 'purple',
      change: '0%'
    },
    {
      name: 'Error Rate',
      value: stats?.total_events && stats?.error_count
        ? `${((stats.error_count / stats.total_events) * 100).toFixed(1)}%`
        : '0%',
      icon: XCircle,
      color: 'red',
      change: '0%'
    }
  ];

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Overview</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.name}</p>
                  </div>
                );
              })}
            </div>

            {/* Getting Started */}
            {stats && stats.total_events === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🚀 Get Started with Odin</h2>
                <p className="text-gray-700 mb-6">
                  You haven&apos;t tracked any events yet. Follow these steps to start monitoring your ChatGPT app:
                </p>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <div>
                      <p className="font-semibold text-gray-900">Create an App</p>
                      <p className="text-gray-600">Go to the Apps page and create your first app to get an API key</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <div>
                      <p className="font-semibold text-gray-900">Install the SDK</p>
                      <code className="block bg-white px-3 py-2 rounded border border-gray-300 text-sm mt-1">
                        npm install @odin-analytics/sdk
                      </code>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <div>
                      <p className="font-semibold text-gray-900">Start Tracking</p>
                      <code className="block bg-white px-3 py-2 rounded border border-gray-300 text-sm mt-1">
                        await analytics.track(&apos;invoked&apos;)
                      </code>
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {/* Placeholder for charts when we have data */}
            {stats && stats.total_events > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Event Timeline</h2>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart coming soon
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
