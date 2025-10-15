'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { TrendingUp, TrendingDown, Activity, CheckCircle, XCircle, Zap, Clock, DollarSign, MessageSquare, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface Stats {
  total_events: number;
  invoked_count: number;
  completed_count: number;
  error_count: number;
  success_rate: number;
  avg_latency_ms: number;
  errors_today: number;
  total_users: number;
}

interface TimeSeriesData {
  date: string;
  invoked: number;
  completed: number;
  error: number;
  converted: number;
}

interface ActivityItem {
  id: string;
  type: 'invoked' | 'completed' | 'error' | 'converted';
  app_name: string;
  timestamp: string;
  latency_ms?: number;
}

interface TopPrompt {
  prompt_hash: string;
  count: number;
  last_seen: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [topPrompts, setTopPrompts] = useState<TopPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasApps, setHasApps] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // TODO: Replace with actual API calls
    // Check if user has apps - for now, simulate no apps for first-time users
    const userHasApps = false; // TODO: Fetch from API
    setHasApps(userHasApps);

    // Simulating API response with sample data
    setTimeout(() => {
      if (userHasApps) {
        setStats({
          total_events: 12547,
          invoked_count: 3892,
          completed_count: 3654,
          error_count: 238,
          success_rate: 0.939,
          avg_latency_ms: 1240,
          errors_today: 12,
          total_users: 1243
        });
      } else {
        // First-time user - no data yet
        setStats({
          total_events: 0,
          invoked_count: 0,
          completed_count: 0,
          error_count: 0,
          success_rate: 0,
          avg_latency_ms: 0,
          errors_today: 0,
          total_users: 0
        });
      }

      // Sample time series data for the last 7 days
      const sampleTimeSeriesData: TimeSeriesData[] = [
        { date: '2024-01-01', invoked: 450, completed: 420, error: 30, converted: 85 },
        { date: '2024-01-02', invoked: 520, completed: 495, error: 25, converted: 92 },
        { date: '2024-01-03', invoked: 610, completed: 580, error: 30, converted: 110 },
        { date: '2024-01-04', invoked: 580, completed: 545, error: 35, converted: 98 },
        { date: '2024-01-05', invoked: 670, completed: 635, error: 35, converted: 115 },
        { date: '2024-01-06', invoked: 720, completed: 685, error: 35, converted: 128 },
        { date: '2024-01-07', invoked: 690, completed: 654, error: 36, converted: 120 },
      ];
      setTimeSeriesData(sampleTimeSeriesData);

      // Sample recent activity
      const sampleActivity: ActivityItem[] = [
        { id: '1', type: 'completed', app_name: 'Travel Assistant', timestamp: new Date(Date.now() - 60000).toISOString(), latency_ms: 1200 },
        { id: '2', type: 'invoked', app_name: 'Code Helper', timestamp: new Date(Date.now() - 120000).toISOString() },
        { id: '3', type: 'error', app_name: 'Travel Assistant', timestamp: new Date(Date.now() - 180000).toISOString() },
        { id: '4', type: 'completed', app_name: 'Shopping Bot', timestamp: new Date(Date.now() - 240000).toISOString(), latency_ms: 980 },
        { id: '5', type: 'converted', app_name: 'Shopping Bot', timestamp: new Date(Date.now() - 300000).toISOString() },
      ];
      setRecentActivity(sampleActivity);

      // Sample top prompts
      const samplePrompts: TopPrompt[] = [
        { prompt_hash: 'a7f3c...', count: 847, last_seen: new Date(Date.now() - 3600000).toISOString() },
        { prompt_hash: 'b2e91...', count: 623, last_seen: new Date(Date.now() - 7200000).toISOString() },
        { prompt_hash: 'c9d54...', count: 451, last_seen: new Date(Date.now() - 10800000).toISOString() },
        { prompt_hash: 'd1a82...', count: 389, last_seen: new Date(Date.now() - 14400000).toISOString() },
        { prompt_hash: 'e6f23...', count: 321, last_seen: new Date(Date.now() - 18000000).toISOString() },
      ];
      setTopPrompts(samplePrompts);

      setLoading(false);
    }, 500);
  };

  const statCards = [
    {
      name: 'Total Invocations',
      value: stats?.invoked_count?.toLocaleString() || '0',
      icon: Activity,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      change: '+12.5%'
    },
    {
      name: 'Total Users',
      value: stats?.total_users?.toLocaleString() || '0',
      icon: CheckCircle,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      change: '+8.7%'
    },
    {
      name: 'Success Rate',
      value: stats?.success_rate ? `${(stats.success_rate * 100).toFixed(1)}%` : '0%',
      icon: Zap,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      change: '+2.3%'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'invoked': return <Activity className="w-4 h-4 text-blue-600" />;
      case 'converted': return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      case 'invoked': return 'Invoked';
      case 'converted': return 'Converted';
      default: return type;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return format(date, 'MMM d, h:mm a');
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Overview</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !hasApps || (stats && stats.total_events === 0) ? (
          <>
            {/* Stats Grid - Empty State */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.name === 'Success Rate' ? '0%' : '0'}
                    </p>
                    <p className="text-sm text-gray-600">{stat.name}</p>
                  </div>
                );
              })}
            </div>

            {/* Simple Call to Action */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to track your ChatGPT app?</h2>
              <p className="text-xl mb-8 text-blue-50">
                Create your first app and let the data flow in. It takes just 2 minutes.
              </p>
              <a
                href="/dashboard/apps"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold"
              >
                Create Your First App
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                      </div>
                      <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.name}</p>
                  </div>
                );
              })}
            </div>

            {/* Event Timeline Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Events Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => format(new Date(value as string), 'MMM d, yyyy')}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="invoked" stroke="#3b82f6" strokeWidth={2} name="Invoked" />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" />
                  <Line type="monotone" dataKey="error" stroke="#ef4444" strokeWidth={2} name="Errors" />
                  <Line type="monotone" dataKey="converted" stroke="#8b5cf6" strokeWidth={2} name="Converted" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Activity & Top Prompts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getActivityLabel(activity.type)}
                          </p>
                          <p className="text-sm text-gray-600">{activity.app_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                        {activity.latency_ms && (
                          <p className="text-xs text-gray-400">{activity.latency_ms}ms</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Prompts */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Top Prompt Patterns</h2>
                <div className="space-y-4">
                  {topPrompts.map((prompt, idx) => (
                    <div key={prompt.prompt_hash} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{idx + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 font-mono">
                            {prompt.prompt_hash}
                          </p>
                          <p className="text-xs text-gray-500">Last seen {formatTimestamp(prompt.last_seen)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{prompt.count.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">uses</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
