'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { DollarSign, TrendingUp, Users, Target } from 'lucide-react';

interface RevenueMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  conversionRevenue: number;
  revenueGrowth: number;
}

export default function RevenuePage() {
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    averageOrderValue: 0,
    conversionRevenue: 0,
    revenueGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueMetrics();
  }, []);

  const fetchRevenueMetrics = async () => {
    // TODO: Fetch actual revenue metrics from API
    setLoading(false);
    // Mock data for now
    setMetrics({
      totalRevenue: 0,
      averageOrderValue: 0,
      conversionRevenue: 0,
      revenueGrowth: 0
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Revenue Analytics</h1>
          <p className="text-gray-600">
            Track revenue from your conversions. Data will appear here once you connect your app on the Apps page.
          </p>
        </div>

        {/* Revenue Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-sm text-gray-500 mt-2">All-time revenue</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Avg Order Value</span>
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.averageOrderValue)}</div>
            <p className="text-sm text-gray-500 mt-2">Per conversion</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Conversion Revenue</span>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.conversionRevenue)}</div>
            <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Growth</span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{metrics.revenueGrowth > 0 ? '+' : ''}{metrics.revenueGrowth}%</div>
            <p className="text-sm text-gray-500 mt-2">vs last period</p>
          </div>
        </div>


        {/* Revenue Chart Placeholder */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Over Time</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Your revenue chart will appear here once data starts flowing
          </div>
        </div>

        {/* Revenue by Source */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue by Source</h3>
            <div className="text-center text-gray-500 py-8">
              No revenue data yet
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Revenue Events</h3>
            <div className="text-center text-gray-500 py-8">
              No revenue data yet
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
