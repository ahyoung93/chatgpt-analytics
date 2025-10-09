'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Lock, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BenchmarkData {
  available: boolean;
  category: string;
  your_success_rate: number;
  category_avg_success_rate: number;
  your_p50_latency: number;
  your_p75_latency: number;
  category_p50_latency: number;
  category_p75_latency: number;
  app_count: number;
}

export default function BenchmarksPage() {
  const [hasPro, setHasPro] = useState(true); // TODO: Get from user's plan
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasPro) {
      fetchBenchmarks();
    }
  }, [hasPro]);

  const fetchBenchmarks = async () => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      setBenchmarkData({
        available: true,
        category: 'Productivity',
        your_success_rate: 0.94,
        category_avg_success_rate: 0.87,
        your_p50_latency: 1100,
        your_p75_latency: 1450,
        category_p50_latency: 1350,
        category_p75_latency: 1780,
        app_count: 15
      });
      setLoading(false);
    }, 500);
  };

  const latencyComparisonData = benchmarkData ? [
    {
      metric: 'P50 Latency',
      'Your App': benchmarkData.your_p50_latency,
      'Category Avg': benchmarkData.category_p50_latency
    },
    {
      metric: 'P75 Latency',
      'Your App': benchmarkData.your_p75_latency,
      'Category Avg': benchmarkData.category_p75_latency
    }
  ] : [];

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Category Benchmarks</h1>

        {!hasPro ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Upgrade to Pro</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Category benchmarks are available on Pro and Team plans. Compare your app&apos;s performance against others in your category.
            </p>
            <a
              href="/pricing"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              View Pricing
            </a>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !benchmarkData?.available ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Not Enough Data</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Benchmarks require at least 7 apps in your category for privacy protection (k-anonymity).
              Check back as more apps join the {benchmarkData?.category || 'your'} category.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Privacy Protected:</strong> Benchmarks are calculated from {benchmarkData.app_count} apps in the {benchmarkData.category} category.
                All data is anonymized with k-anonymity protection (k ≥ 7).
              </p>
            </div>

            {/* Success Rate Comparison */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Success Rate Comparison</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Your App</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {(benchmarkData.your_success_rate * 100).toFixed(1)}%
                      </span>
                      {benchmarkData.your_success_rate > benchmarkData.category_avg_success_rate ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${benchmarkData.your_success_rate * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Category Average</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {(benchmarkData.category_avg_success_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gray-400 h-3 rounded-full transition-all"
                      style={{ width: `${benchmarkData.category_avg_success_rate * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Your app is{' '}
                  <span className={benchmarkData.your_success_rate > benchmarkData.category_avg_success_rate ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {((benchmarkData.your_success_rate - benchmarkData.category_avg_success_rate) * 100).toFixed(1)}%
                  </span>
                  {' '}{benchmarkData.your_success_rate > benchmarkData.category_avg_success_rate ? 'above' : 'below'} category average
                </p>
              </div>
            </div>

            {/* Latency P50/P75 Comparison */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Latency Percentiles (P50/P75)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={latencyComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Your App" fill="#3b82f6" />
                  <Bar dataKey="Category Avg" fill="#9ca3af" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">P50 (Median) Latency</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{benchmarkData.your_p50_latency}ms</span>
                    <span className="text-sm text-gray-600">vs {benchmarkData.category_p50_latency}ms avg</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">P75 Latency</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{benchmarkData.your_p75_latency}ms</span>
                    <span className="text-sm text-gray-600">vs {benchmarkData.category_p75_latency}ms avg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700">Success Rate</span>
                  <span className={benchmarkData.your_success_rate > benchmarkData.category_avg_success_rate ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {benchmarkData.your_success_rate > benchmarkData.category_avg_success_rate ? '✓ Above Average' : '↓ Below Average'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700">P50 Latency</span>
                  <span className={benchmarkData.your_p50_latency < benchmarkData.category_p50_latency ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {benchmarkData.your_p50_latency < benchmarkData.category_p50_latency ? '✓ Faster' : '↓ Slower'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-700">P75 Latency</span>
                  <span className={benchmarkData.your_p75_latency < benchmarkData.category_p75_latency ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {benchmarkData.your_p75_latency < benchmarkData.category_p75_latency ? '✓ Faster' : '↓ Slower'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
