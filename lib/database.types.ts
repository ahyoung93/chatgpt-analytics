// TypeScript types for Supabase database schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          stripe_customer_id: string | null
          subscription_tier: 'free' | 'pro' | 'enterprise'
          subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
          subscription_id: string | null
          api_key: string
          api_calls_limit: number
          api_calls_used: number
          api_calls_reset_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          stripe_customer_id?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          subscription_id?: string | null
          api_key?: string
          api_calls_limit?: number
          api_calls_used?: number
          api_calls_reset_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          stripe_customer_id?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          subscription_id?: string | null
          api_key?: string
          api_calls_limit?: number
          api_calls_used?: number
          api_calls_reset_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          session_id: string
          title: string | null
          model: string | null
          total_tokens: number
          total_cost: number
          message_count: number
          started_at: string
          ended_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          title?: string | null
          model?: string | null
          total_tokens?: number
          total_cost?: number
          message_count?: number
          started_at?: string
          ended_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          title?: string | null
          model?: string | null
          total_tokens?: number
          total_cost?: number
          message_count?: number
          started_at?: string
          ended_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          model: string | null
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
          cost: number
          latency_ms: number | null
          metadata: Json
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          model?: string | null
          prompt_tokens?: number
          completion_tokens?: number
          total_tokens?: number
          cost?: number
          latency_ms?: number | null
          metadata?: Json
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          model?: string | null
          prompt_tokens?: number
          completion_tokens?: number
          total_tokens?: number
          cost?: number
          latency_ms?: number | null
          metadata?: Json
          timestamp?: string
          created_at?: string
        }
      }
      usage_metrics: {
        Row: {
          id: string
          user_id: string
          date: string
          total_sessions: number
          total_messages: number
          total_tokens: number
          total_cost: number
          avg_latency_ms: number | null
          models_used: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          total_sessions?: number
          total_messages?: number
          total_tokens?: number
          total_cost?: number
          avg_latency_ms?: number | null
          models_used?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          total_sessions?: number
          total_messages?: number
          total_tokens?: number
          total_cost?: number
          avg_latency_ms?: number | null
          models_used?: Json
          created_at?: string
          updated_at?: string
        }
      }
      billing_history: {
        Row: {
          id: string
          user_id: string
          stripe_invoice_id: string | null
          amount: number
          currency: string
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          invoice_url: string | null
          period_start: string | null
          period_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_invoice_id?: string | null
          amount: number
          currency?: string
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          invoice_url?: string | null
          period_start?: string | null
          period_end?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_invoice_id?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          invoice_url?: string | null
          period_start?: string | null
          period_end?: string | null
          created_at?: string
        }
      }
      api_logs: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          method: string
          status_code: number | null
          response_time_ms: number | null
          ip_address: string | null
          user_agent: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          method: string
          status_code?: number | null
          response_time_ms?: number | null
          ip_address?: string | null
          user_agent?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          method?: string
          status_code?: number | null
          response_time_ms?: number | null
          ip_address?: string | null
          user_agent?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      exports: {
        Row: {
          id: string
          user_id: string
          format: 'csv' | 'json' | 'pdf'
          status: 'pending' | 'processing' | 'completed' | 'failed'
          file_url: string | null
          file_size: number | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          format: 'csv' | 'json' | 'pdf'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          file_url?: string | null
          file_size?: number | null
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          format?: 'csv' | 'json' | 'pdf'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          file_url?: string | null
          file_size?: number | null
          expires_at?: string
          created_at?: string
        }
      }
    }
    Functions: {
      aggregate_daily_metrics: {
        Args: {
          target_user_id: string
          target_date: string
        }
        Returns: void
      }
      reset_api_limits: {
        Args: Record<string, never>
        Returns: void
      }
    }
  }
}
