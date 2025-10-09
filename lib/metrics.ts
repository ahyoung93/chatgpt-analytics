// Metrics calculation utilities
import { createServerClient } from './db';

export interface MetricsResponse {
  totalSessions: number;
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  avgLatency: number;
  modelBreakdown: Record<string, number>;
  timeSeriesData: Array<{
    date: string;
    sessions: number;
    messages: number;
    tokens: number;
    cost: number;
  }>;
}

// Get metrics for a user within a date range
export async function getUserMetrics(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<MetricsResponse> {
  const supabase = createServerClient();

  // Get aggregated metrics from usage_metrics table
  const { data: metrics, error: metricsError } = await supabase
    .from('usage_metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (metricsError) {
    throw new Error('Failed to fetch metrics');
  }

  // Aggregate the data
  const totalSessions = metrics.reduce((sum, m) => sum + m.total_sessions, 0);
  const totalMessages = metrics.reduce((sum, m) => sum + m.total_messages, 0);
  const totalTokens = metrics.reduce((sum, m) => sum + m.total_tokens, 0);
  const totalCost = metrics.reduce((sum, m) => sum + parseFloat(m.total_cost.toString()), 0);

  // Calculate average latency
  const latencies = metrics
    .map(m => m.avg_latency_ms)
    .filter(l => l !== null) as number[];
  const avgLatency = latencies.length > 0
    ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length
    : 0;

  // Aggregate model breakdown
  const modelBreakdown: Record<string, number> = {};
  metrics.forEach(m => {
    const models = m.models_used as Record<string, number>;
    Object.entries(models).forEach(([model, count]) => {
      modelBreakdown[model] = (modelBreakdown[model] || 0) + count;
    });
  });

  // Prepare time series data
  const timeSeriesData = metrics.map(m => ({
    date: m.date,
    sessions: m.total_sessions,
    messages: m.total_messages,
    tokens: m.total_tokens,
    cost: parseFloat(m.total_cost.toString())
  }));

  return {
    totalSessions,
    totalMessages,
    totalTokens,
    totalCost,
    avgLatency: Math.round(avgLatency),
    modelBreakdown,
    timeSeriesData
  };
}

// Get recent sessions for a user
export async function getRecentSessions(userId: string, limit = 10) {
  const supabase = createServerClient();

  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error('Failed to fetch sessions');
  }

  return sessions;
}

// Get session details with messages
export async function getSessionDetails(userId: string, sessionId: string) {
  const supabase = createServerClient();

  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('id', sessionId)
    .single();

  if (sessionError) {
    throw new Error('Session not found');
  }

  const { data: messages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });

  if (messagesError) {
    throw new Error('Failed to fetch messages');
  }

  return {
    session,
    messages
  };
}

// Calculate token cost based on model
export function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  // Pricing as of 2024 (per 1M tokens)
  const pricing: Record<string, { prompt: number; completion: number }> = {
    'gpt-4': { prompt: 30, completion: 60 },
    'gpt-4-turbo': { prompt: 10, completion: 30 },
    'gpt-4o': { prompt: 5, completion: 15 },
    'gpt-3.5-turbo': { prompt: 0.5, completion: 1.5 },
    'claude-3-opus': { prompt: 15, completion: 75 },
    'claude-3-sonnet': { prompt: 3, completion: 15 },
    'claude-3-haiku': { prompt: 0.25, completion: 1.25 },
  };

  // Find matching model (case-insensitive, partial match)
  const modelKey = Object.keys(pricing).find(key =>
    model.toLowerCase().includes(key.toLowerCase())
  );

  if (!modelKey) {
    // Default to GPT-3.5 pricing if model not found
    return ((promptTokens * 0.5) + (completionTokens * 1.5)) / 1_000_000;
  }

  const { prompt, completion } = pricing[modelKey];
  return ((promptTokens * prompt) + (completionTokens * completion)) / 1_000_000;
}
