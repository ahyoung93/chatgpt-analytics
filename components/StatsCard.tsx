'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    isPositive: boolean;
  };
  format?: (value: number) => string;
}

export function StatsCard({ title, value, icon: Icon, change, format }: StatsCardProps) {
  const displayValue = typeof value === 'number' && format ? format(value) : value;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{displayValue}</p>

          {change && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  change.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change.isPositive ? '+' : ''}
                {change.value.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">vs last period</span>
            </div>
          )}
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
