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
  const [selectedApp, setSelectedApp] = useState<string>('');
  const [apps, setApps] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    if (selectedApp) {
      fetchRetentionMetrics();
    }
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

  const fetchRetentionMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/metrics/retention?app_id=${selectedApp}`);
      const data = await response.json();
      setMetrics(data.metrics || {
        day1Retention: 0,
        day7Retention: 0,
        day30Retention: 0,
        totalUsers: 0
      });
      setCohorts(data.cohorts || []);
    } catch (error) {
      console.error('Error fetching retention metrics:', error);
      setMetrics({
        day1Retention: 0,
        day7Retention: 0,
        day30Retention: 0,
        totalUsers: 0
      });
      setCohorts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">User Retention Analytics</h1>
            {apps.length > 0 && (
              <select
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-900"
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


        {/* Retention Curve Placeholder */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Retention Curve</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Your retention curve will appear here once data starts flowing
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
              <p className="text-sm mt-2">Data will appear here once you connect your app</p>
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
