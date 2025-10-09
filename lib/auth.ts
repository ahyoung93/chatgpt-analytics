// Authentication utilities for ChatGPT App Analytics
import { NextRequest } from 'next/server';
import { getAppByWriteKey } from './db';

export interface AuthenticatedApp {
  id: string;
  name: string;
  category: string;
  org_id: string;
  org_name: string;
  org_plan: 'free' | 'pro' | 'team';
  rate_limit_per_sec: number;
}

// Authenticate API request via x-app-key header
export async function authenticateTrackRequest(
  request: NextRequest
): Promise<{ app: AuthenticatedApp | null; error: string | null }> {
  const writeKey = request.headers.get('x-app-key');

  if (!writeKey) {
    return { app: null, error: 'Missing x-app-key header' };
  }

  if (!writeKey.startsWith('sk_')) {
    return { app: null, error: 'Invalid write key format' };
  }

  try {
    const appData = await getAppByWriteKey(writeKey);

    const app: AuthenticatedApp = {
      id: appData.id,
      name: appData.name,
      category: appData.category,
      org_id: (appData.orgs as any).id,
      org_name: (appData.orgs as any).name,
      org_plan: (appData.orgs as any).plan,
      rate_limit_per_sec: appData.rate_limit_per_sec
    };

    return { app, error: null };
  } catch (err) {
    return { app: null, error: 'Invalid or inactive write key' };
  }
}

// Check if org has access to feature based on plan
export function hasFeatureAccess(
  plan: 'free' | 'pro' | 'team',
  feature: 'benchmarks' | 'csv_export' | 'unlimited_apps'
): boolean {
  const featureMatrix: Record<'free' | 'pro' | 'team', Array<'benchmarks' | 'csv_export' | 'unlimited_apps'>> = {
    free: [],
    pro: ['benchmarks', 'csv_export'],
    team: ['benchmarks', 'csv_export', 'unlimited_apps']
  };

  return featureMatrix[plan].includes(feature);
}

// Get plan limits
export function getPlanLimits(plan: 'free' | 'pro' | 'team') {
  return {
    free: {
      retention_days: 7,
      max_apps: 1,
      features: ['basic_metrics']
    },
    pro: {
      retention_days: 90,
      max_apps: 5,
      features: ['basic_metrics', 'benchmarks', 'csv_export']
    },
    team: {
      retention_days: 180,
      max_apps: Infinity,
      features: ['basic_metrics', 'benchmarks', 'csv_export', 'priority_support']
    }
  }[plan];
}
