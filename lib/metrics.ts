// Metrics calculation for ChatGPT App Analytics
import { createServerClient } from './db';
import { AppCategory } from './database.types';

export interface AppMetricsSummary {
  totalEvents: number;
  invokedCount: number;
  completedCount: number;
  errorCount: number;
  convertedCount: number;
  successRate: number;
  avgLatency: number;
}

export interface TimeSeriesData {
  date: string;
  invoked: number;
  completed: number;
  error: number;
  converted: number;
  success_rate: number;
}

// Get summary metrics for an app
export async function getAppMetricsSummary(
  appId: string,
  startDate: Date,
  endDate: Date
): Promise<AppMetricsSummary> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('app_daily_metrics')
    .select('*')
    .eq('app_id', appId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0]);

  if (error || !data) {
    return {
      totalEvents: 0,
      invokedCount: 0,
      completedCount: 0,
      errorCount: 0,
      convertedCount: 0,
      successRate: 0,
      avgLatency: 0
    };
  }

  const totalEvents = data.reduce((sum, d) => sum + d.total_events, 0);
  const invokedCount = data.reduce((sum, d) => sum + d.invoked_count, 0);
  const completedCount = data.reduce((sum, d) => sum + d.completed_count, 0);
  const errorCount = data.reduce((sum, d) => sum + d.error_count, 0);
  const convertedCount = data.reduce((sum, d) => sum + d.converted_count, 0);

  const successRate = invokedCount > 0
    ? (completedCount / invokedCount) * 100
    : 0;

  const latencies = data
    .filter(d => d.avg_latency_ms)
    .map(d => d.avg_latency_ms!);
  const avgLatency = latencies.length > 0
    ? Math.round(latencies.reduce((sum, l) => sum + l, 0) / latencies.length)
    : 0;

  return {
    totalEvents,
    invokedCount,
    completedCount,
    errorCount,
    convertedCount,
    successRate: Math.round(successRate * 100) / 100,
    avgLatency
  };
}

// Get time series data for charts
export async function getAppTimeSeriesData(
  appId: string,
  startDate: Date,
  endDate: Date
): Promise<TimeSeriesData[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('app_daily_metrics')
    .select('*')
    .eq('app_id', appId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map(d => ({
    date: d.date,
    invoked: d.invoked_count,
    completed: d.completed_count,
    error: d.error_count,
    converted: d.converted_count,
    success_rate: d.success_rate || 0
  }));
}

// Get category benchmarks (with k-anonymity check)
export async function getCategoryBenchmarks(
  category: AppCategory,
  startDate: Date,
  endDate: Date
) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('category_daily_benchmarks')
    .select('*')
    .eq('category', category)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .gte('app_count', 7) // K-anonymity: only show if ≥7 apps
    .order('date', { ascending: true });

  if (error || !data || data.length === 0) {
    return {
      available: false,
      message: 'Not enough data to show category benchmarks (requires ≥7 apps for privacy)'
    };
  }

  const latest = data[data.length - 1];

  return {
    available: true,
    category,
    appCount: latest.app_count,
    avgSuccessRate: latest.avg_success_rate,
    p50SuccessRate: latest.p50_success_rate,
    p75SuccessRate: latest.p75_success_rate,
    p90SuccessRate: latest.p90_success_rate,
    avgLatencyMs: latest.avg_latency_ms,
    timeSeries: data.map(d => ({
      date: d.date,
      avgSuccessRate: d.avg_success_rate,
      avgLatencyMs: d.avg_latency_ms
    }))
  };
}

// Aggregate metrics for a specific date
export async function aggregateMetrics(appId: string, date: Date) {
  const supabase = createServerClient();

  await supabase.rpc('aggregate_app_daily_metrics', {
    target_app_id: appId,
    target_date: date.toISOString().split('T')[0]
  });
}
