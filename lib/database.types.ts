// TypeScript types for ChatGPT App Analytics database schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AppCategory =
  | 'travel'
  | 'productivity'
  | 'dev_tools'
  | 'shopping'
  | 'education'
  | 'entertainment'
  | 'customer_support'
  | 'content_generation'
  | 'data_analysis'
  | 'other'

export type EventType =
  | 'invoked'
  | 'completed'
  | 'error'
  | 'converted'
  | 'custom'

export type PlanTier = 'free' | 'pro' | 'team'

export interface Database {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string
          name: string
          slug: string
          plan: PlanTier
          stripe_customer_id: string | null
          subscription_id: string | null
          subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan?: PlanTier
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          plan?: PlanTier
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          created_at?: string
          updated_at?: string
        }
      }
      org_members: {
        Row: {
          id: string
          org_id: string
          email: string
          name: string | null
          role: 'owner' | 'admin' | 'member'
          invited_at: string
          joined_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          email: string
          name?: string | null
          role?: 'owner' | 'admin' | 'member'
          invited_at?: string
          joined_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          email?: string
          name?: string | null
          role?: 'owner' | 'admin' | 'member'
          invited_at?: string
          joined_at?: string | null
          created_at?: string
        }
      }
      apps: {
        Row: {
          id: string
          org_id: string
          name: string
          category: AppCategory
          description: string | null
          write_key: string
          rate_limit_per_sec: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          category: AppCategory
          description?: string | null
          write_key?: string
          rate_limit_per_sec?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          category?: AppCategory
          description?: string | null
          write_key?: string
          rate_limit_per_sec?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          app_id: string
          event_type: EventType
          event_name: string | null
          properties: Json
          prompt_hash: string | null
          error_message: string | null
          latency_ms: number | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          app_id: string
          event_type: EventType
          event_name?: string | null
          properties?: Json
          prompt_hash?: string | null
          error_message?: string | null
          latency_ms?: number | null
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          event_type?: EventType
          event_name?: string | null
          properties?: Json
          prompt_hash?: string | null
          error_message?: string | null
          latency_ms?: number | null
          timestamp?: string
          created_at?: string
        }
      }
      app_daily_metrics: {
        Row: {
          id: string
          app_id: string
          date: string
          invoked_count: number
          completed_count: number
          error_count: number
          converted_count: number
          custom_count: number
          total_events: number
          avg_latency_ms: number | null
          success_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          app_id: string
          date: string
          invoked_count?: number
          completed_count?: number
          error_count?: number
          converted_count?: number
          custom_count?: number
          total_events?: number
          avg_latency_ms?: number | null
          success_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          date?: string
          invoked_count?: number
          completed_count?: number
          error_count?: number
          converted_count?: number
          custom_count?: number
          total_events?: number
          avg_latency_ms?: number | null
          success_rate?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      category_daily_benchmarks: {
        Row: {
          id: string
          category: AppCategory
          date: string
          app_count: number
          avg_invoked_count: number | null
          avg_completed_count: number | null
          avg_error_count: number | null
          avg_success_rate: number | null
          avg_latency_ms: number | null
          p50_success_rate: number | null
          p75_success_rate: number | null
          p90_success_rate: number | null
          created_at: string
        }
        Insert: {
          id?: string
          category: AppCategory
          date: string
          app_count: number
          avg_invoked_count?: number | null
          avg_completed_count?: number | null
          avg_error_count?: number | null
          avg_success_rate?: number | null
          avg_latency_ms?: number | null
          p50_success_rate?: number | null
          p75_success_rate?: number | null
          p90_success_rate?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          category?: AppCategory
          date?: string
          app_count?: number
          avg_invoked_count?: number | null
          avg_completed_count?: number | null
          avg_error_count?: number | null
          avg_success_rate?: number | null
          avg_latency_ms?: number | null
          p50_success_rate?: number | null
          p75_success_rate?: number | null
          p90_success_rate?: number | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          org_id: string
          stripe_subscription_id: string
          plan: PlanTier
          status: 'active' | 'cancelled' | 'past_due' | 'trialing'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          stripe_subscription_id: string
          plan: PlanTier
          status: 'active' | 'cancelled' | 'past_due' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          stripe_subscription_id?: string
          plan?: PlanTier
          status?: 'active' | 'cancelled' | 'past_due' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      aggregate_app_daily_metrics: {
        Args: {
          target_app_id: string
          target_date: string
        }
        Returns: void
      }
      aggregate_category_benchmarks: {
        Args: {
          target_category: AppCategory
          target_date: string
        }
        Returns: void
      }
      can_create_app: {
        Args: {
          org_uuid: string
        }
        Returns: boolean
      }
      get_retention_days: {
        Args: {
          org_plan: PlanTier
        }
        Returns: number
      }
      cleanup_old_events: {
        Args: Record<string, never>
        Returns: void
      }
    }
  }
}
