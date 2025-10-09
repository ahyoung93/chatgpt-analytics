// Authentication utilities
import { createServerClient } from './db';
import { NextRequest } from 'next/server';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due';
}

// Authenticate user by API key from request headers
export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: AuthUser | null; error: string | null }> {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');

  if (!apiKey) {
    return { user: null, error: 'API key is required' };
  }

  try {
    const supabase = createServerClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, subscription_tier, subscription_status')
      .eq('api_key', apiKey)
      .single();

    if (error || !user) {
      return { user: null, error: 'Invalid API key' };
    }

    return { user: user as AuthUser, error: null };
  } catch (err) {
    return { user: null, error: 'Authentication failed' };
  }
}

// Generate a new API key for a user
export async function generateApiKey(): Promise<string> {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);

  const apiKey = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `cgpt_${apiKey}`;
}

// Create or get user from email
export async function getOrCreateUser(email: string, name?: string) {
  const supabase = createServerClient();

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // Create new user with generated API key
  const apiKey = await generateApiKey();

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      email,
      name,
      api_key: apiKey,
      subscription_tier: 'free',
      subscription_status: 'inactive',
      api_calls_limit: 1000,
      api_calls_used: 0
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create user');
  }

  return newUser;
}

// Validate subscription tier access
export function hasAccess(
  userTier: 'free' | 'pro' | 'enterprise',
  requiredTier: 'free' | 'pro' | 'enterprise'
): boolean {
  const tierLevels = {
    free: 0,
    pro: 1,
    enterprise: 2
  };

  return tierLevels[userTier] >= tierLevels[requiredTier];
}

// Get tier limits
export function getTierLimits(tier: 'free' | 'pro' | 'enterprise') {
  const limits = {
    free: {
      apiCallsPerMonth: 1000,
      dataRetentionDays: 30,
      exportFormats: ['json'],
      maxSessionsPerDay: 100
    },
    pro: {
      apiCallsPerMonth: 10000,
      dataRetentionDays: 365,
      exportFormats: ['json', 'csv'],
      maxSessionsPerDay: 1000
    },
    enterprise: {
      apiCallsPerMonth: Infinity,
      dataRetentionDays: Infinity,
      exportFormats: ['json', 'csv', 'pdf'],
      maxSessionsPerDay: Infinity
    }
  };

  return limits[tier];
}
