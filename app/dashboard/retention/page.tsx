'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, TrendingUp, Calendar, Target } from 'lucide-react';

interface RetentionMetrics {
  day1Retention: number;
  day7Retention: number;
  day30Retention: number;
  totalUsers: number;
}

interface CohortData {
  cohort_date: string;
  cohort_size: number;
  day_1_retention_rate: number;
  day_7_retention_rate: number;
  day_30_retention_rate: number;
}

export default function RetentionPage() {
  const [metrics, setMetrics] = useState<RetentionMetrics>({
    day1Retention: 0,
    day7Retention: 0,
    day30Retention: 0,
    totalUsers: 0
  });
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRetentionMetrics();
  }, []);

  const fetchRetentionMetrics = async () => {
    // TODO: Fetch actual retention metrics from API
    setLoading(false);
    setMetrics({
      day1Retention: 0,
      day7Retention: 0,
      day30Retention: 0,
      totalUsers: 0
    });
    setCohorts([]);
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Retention Analytics</h1>
          <p className="text-gray-600">
            Track user retention with privacy-preserving hashes. See who returns to your ChatGPT app.
          </p>
        </div>

        {/* Retention Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Users</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{metrics.totalUsers.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-2">Unique user hashes</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Day 1 Retention</span>
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{metrics.day1Retention.toFixed(1)}%</div>
            <p className="text-sm text-gray-500 mt-2">Return next day</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Day 7 Retention</span>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{metrics.day7Retention.toFixed(1)}%</div>
            <p className="text-sm text-gray-500 mt-2">Return within week</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Day 30 Retention</span>
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{metrics.day30Retention.toFixed(1)}%</div>
            <p className="text-sm text-gray-500 mt-2">Return within month</p>
          </div>
        </div>

        {/* Setup Guide */}
        {metrics.totalUsers === 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-indigo-900 mb-3">Start Tracking User Retention</h3>
            <p className="text-indigo-800 mb-4">
              Hash user IDs on your end and send the hash to Odin for privacy-preserving retention analysis.
            </p>
            <div className="bg-white rounded-lg p-4 font-mono text-sm mb-4">
              <pre className="text-gray-900">{`// Example: Hash and track a user
import crypto from 'crypto';

const userId = "user_123456";  // Your internal user ID
const userHash = crypto
  .createHash('sha256')
  .update(userId)
  .digest('hex');

await fetch('https://your-odin-domain.com/api/track', {
  method: 'POST',
  headers: {
    'x-app-key': 'your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    event: 'invoked',
    user_hash: userHash  // Privacy-preserving hash
  })
});`}</pre>
            </div>
            <div className="bg-indigo-100 rounded p-3 text-sm text-indigo-900">
              <strong>Privacy Note:</strong> User hashes are one-way - Odin cannot reverse them to see the original user IDs.
              You can track the same user across sessions by using the same hash.
            </div>
          </div>
        )}

        {/* Retention Curve Placeholder */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Retention Curve</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Retention curve will appear here when you start tracking users
          </div>
        </div>

        {/* Cohort Analysis Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Cohort Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">Weekly cohorts and their retention rates over time</p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : cohorts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No retention data yet</p>
              <p className="text-sm mt-2">Start sending <code className="bg-gray-100 px-2 py-1 rounded">user_hash</code> with your events</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cohort Week
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day 1
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day 7
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day 30
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cohorts.map((cohort, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(cohort.cohort_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cohort.cohort_size.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${cohort.day_1_retention_rate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{cohort.day_1_retention_rate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${cohort.day_7_retention_rate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{cohort.day_7_retention_rate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-orange-600 h-2 rounded-full"
                              style={{ width: `${cohort.day_30_retention_rate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{cohort.day_30_retention_rate.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
