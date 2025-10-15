'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { MessageCircle, TrendingUp, AlertCircle, Clock, BarChart3 } from 'lucide-react';

interface ConversationMetrics {
  totalConversations: number;
  avgMessagesPerConversation: number;
  singleMessageConversations: number;
  singleMessagePercentage: number;
  activeConversationsToday: number;
  totalMessages: number;
  errorRate: number;
}

interface MessageDistribution {
  label: string;
  count: number;
  percentage: number;
}

interface HourlyUsage {
  hour: number;
  label: string;
  conversations: number;
}

interface DailyConversations {
  date: string;
  conversations: number;
}

export default function ConversationsPage() {
  const [metrics, setMetrics] = useState<ConversationMetrics>({
    totalConversations: 0,
    avgMessagesPerConversation: 0,
    singleMessageConversations: 0,
    singleMessagePercentage: 0,
    activeConversationsToday: 0,
    totalMessages: 0,
    errorRate: 0
  });
  const [messageDistribution, setMessageDistribution] = useState<MessageDistribution[]>([]);
  const [hourlyUsage, setHourlyUsage] = useState<HourlyUsage[]>([]);
  const [dailyConversations, setDailyConversations] = useState<DailyConversations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<string>('');
  const [apps, setApps] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    if (selectedApp) {
      fetchConversationMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApp]);

  const fetchApps = async () => {
    try {
      const response = await fetch('/api/apps');
      const data = await response.json();
      if (data.apps && data.apps.length > 0) {
        setApps(data.apps);
        setSelectedApp(data.apps[0].id);
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    }
  };

  const fetchConversationMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/metrics/conversations?app_id=${selectedApp}`);
      const data = await response.json();
      setMetrics(data.metrics || {
        totalConversations: 0,
        avgMessagesPerConversation: 0,
        singleMessageConversations: 0,
        singleMessagePercentage: 0,
        activeConversationsToday: 0,
        totalMessages: 0,
        errorRate: 0
      });
      setMessageDistribution(data.messageDistribution || []);
      setHourlyUsage(data.hourlyUsage || []);
      setDailyConversations(data.dailyConversations || []);
    } catch (error) {
      console.error('Error fetching conversation metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxHourlyConversations = Math.max(...hourlyUsage.map(h => h.conversations), 1);
  const maxDailyConversations = Math.max(...dailyConversations.map(d => d.conversations), 1);

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Conversation Analytics</h1>
            {apps.length > 0 && (
              <select
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
              >
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Total Conversations</span>
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{metrics.totalConversations.toLocaleString()}</div>
                <p className="text-sm text-gray-500 mt-2">{metrics.totalMessages} total messages</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Avg Messages/Conv</span>
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{metrics.avgMessagesPerConversation}</div>
                <p className="text-sm text-gray-500 mt-2">Per conversation</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Single Message</span>
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{metrics.singleMessagePercentage}%</div>
                <p className="text-sm text-gray-500 mt-2">{metrics.singleMessageConversations} conversations</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Error Rate</span>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{metrics.errorRate}%</div>
                <p className="text-sm text-gray-500 mt-2">Of all invocations</p>
              </div>
            </div>

            {/* Message Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Messages per Conversation</h3>
              <div className="space-y-4">
                {messageDistribution.map((dist, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{dist.label}</span>
                      <span className="text-sm text-gray-600">{dist.count} ({dist.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${dist.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Usage */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Usage by Hour</h3>
              <div className="flex items-end justify-between gap-1 h-48">
                {hourlyUsage.map((hour) => (
                  <div key={hour.hour} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex items-end justify-center h-40">
                      <div
                        className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                        style={{
                          height: `${(hour.conversations / maxHourlyConversations) * 100}%`,
                          minHeight: hour.conversations > 0 ? '4px' : '0'
                        }}
                        title={`${hour.label}: ${hour.conversations} conversations`}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {hour.hour % 6 === 0 ? hour.label : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Trend */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Conversations (Last 30 Days)</h3>
              <div className="flex items-end justify-between gap-1 h-48">
                {dailyConversations.map((day, idx) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex items-end justify-center h-40">
                      <div
                        className="w-full bg-green-600 rounded-t transition-all hover:bg-green-700"
                        style={{
                          height: `${(day.conversations / maxDailyConversations) * 100}%`,
                          minHeight: day.conversations > 0 ? '4px' : '0'
                        }}
                        title={`${day.date}: ${day.conversations} conversations`}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {idx % 5 === 0 ? new Date(day.date).getDate() : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
