// Database utilities for ChatGPT App Analytics
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Client-side Supabase client
export const createBrowserClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Server-side Supabase client
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

// Get app by write_key (for API auth)
export async function getAppByWriteKey(writeKey: string) {
  const supabase = createServerClient();

  const { data: app, error } = await supabase
    .from('apps')
    .select(`
      *,
      orgs (
        id,
        name,
        plan,
        subscription_status
      )
    `)
    .eq('write_key', writeKey)
    .eq('is_active', true)
    .single();

  if (error) {
    throw new Error('Invalid write key');
  }

  return app;
}

// Rate limiting check
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(writeKey: string, limit: number = 10): Promise<boolean> {
  const now = Date.now();
  const windowMs = 1000; // 1 second window

  const record = rateLimitStore.get(writeKey);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(writeKey, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// Check if org can create more apps based on plan
export async function canCreateApp(orgId: string): Promise<boolean> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .rpc('can_create_app', { org_uuid: orgId });

  if (error) {
    console.error('Error checking app limit:', error);
    return false;
  }

  return data as boolean;
}

// Get retention days for org's plan
export async function getRetentionDays(orgId: string): Promise<number> {
  const supabase = createServerClient();

  const { data: org } = await supabase
    .from('orgs')
    .select('plan')
    .eq('id', orgId)
    .single();

  if (!org) return 7;

  const { data: days } = await supabase
    .rpc('get_retention_days', { org_plan: org.plan });

  return (days as number) || 7;
}
