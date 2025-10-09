// Database utilities using Supabase
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Client-side Supabase client (uses anon key)
export const createBrowserClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Server-side Supabase client (uses service role key for admin operations)
export const createServerClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// Helper function to get user by API key
export async function getUserByApiKey(apiKey: string) {
  const supabase = createServerClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('api_key', apiKey)
    .single();

  if (error) {
    throw new Error('Invalid API key');
  }

  return user;
}

// Helper function to check API rate limits
export async function checkRateLimit(userId: string) {
  const supabase = createServerClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('api_calls_limit, api_calls_used, api_calls_reset_at')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error('User not found');
  }

  // Check if we need to reset the counter
  const resetDate = new Date(user.api_calls_reset_at);
  if (resetDate <= new Date()) {
    await supabase
      .from('users')
      .update({
        api_calls_used: 0,
        api_calls_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', userId);

    return { allowed: true, remaining: user.api_calls_limit };
  }

  const remaining = user.api_calls_limit - user.api_calls_used;

  if (remaining <= 0) {
    return { allowed: false, remaining: 0 };
  }

  // Increment usage
  await supabase
    .from('users')
    .update({ api_calls_used: user.api_calls_used + 1 })
    .eq('id', userId);

  return { allowed: true, remaining: remaining - 1 };
}

// Helper function to log API calls
export async function logApiCall(
  userId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTimeMs: number,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string
) {
  const supabase = createServerClient();

  await supabase.from('api_logs').insert({
    user_id: userId,
    endpoint,
    method,
    status_code: statusCode,
    response_time_ms: responseTimeMs,
    ip_address: ipAddress,
    user_agent: userAgent,
    error_message: errorMessage
  });
}

// Helper function to aggregate daily metrics
export async function aggregateDailyMetrics(userId: string, date: Date) {
  const supabase = createServerClient();

  const dateStr = date.toISOString().split('T')[0];

  await supabase.rpc('aggregate_daily_metrics', {
    target_user_id: userId,
    target_date: dateStr
  });
}
