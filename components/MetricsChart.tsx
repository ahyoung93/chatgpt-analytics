'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricsChartProps {
  data: Array<{
    date: string;
    sessions: number;
    messages: number;
    tokens: number;
    cost: number;
  }>;
  metric: 'sessions' | 'messages' | 'tokens' | 'cost';
}

const metricConfig = {
  sessions: {
    label: 'Sessions',
    color: '#3b82f6',
    format: (value: number) => value.toLocaleString()
  },
  messages: {
    label: 'Messages',
    color: '#10b981',
    format: (value: number) => value.toLocaleString()
  },
  tokens: {
    label: 'Tokens',
    color: '#f59e0b',
    format: (value: number) => value.toLocaleString()
  },
  cost: {
    label: 'Cost',
    color: '#ef4444',
    format: (value: number) => `$${value.toFixed(4)}`
  }
};

export function MetricsChart({ data, metric }: MetricsChartProps) {
  const config = metricConfig[metric];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={config.format}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [config.format(value), config.label]}
            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={metric}
            stroke={config.color}
            strokeWidth={2}
            dot={{ fill: config.color, r: 4 }}
            activeDot={{ r: 6 }}
            name={config.label}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
