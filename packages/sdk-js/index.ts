/**
 * ChatGPT Analytics SDK
 *
 * This SDK helps you track ChatGPT usage and send analytics to your dashboard.
 *
 * @example
 * ```typescript
 * import { ChatGPTAnalytics } from '@chatgpt-analytics/sdk-js';
 *
 * const analytics = new ChatGPTAnalytics('your-api-key');
 *
 * // Track a message
 * await analytics.track({
 *   sessionId: 'unique-session-id',
 *   message: {
 *     role: 'user',
 *     content: 'Hello, how are you?',
 *     model: 'gpt-4'
 *   }
 * });
 * ```
 */

export interface TrackMessageOptions {
  sessionId: string;
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    latencyMs?: number;
    metadata?: Record<string, any>;
  };
  sessionMetadata?: {
    title?: string;
    model?: string;
    metadata?: Record<string, any>;
  };
}

export interface MetricsOptions {
  startDate?: Date;
  endDate?: Date;
  includeSessions?: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  startDate?: Date;
  endDate?: Date;
}

export interface AnalyticsConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export class ChatGPTAnalytics {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: string | AnalyticsConfig) {
    if (typeof config === 'string') {
      this.apiKey = config;
      this.baseUrl = 'https://your-app.vercel.app';
      this.timeout = 10000;
    } else {
      this.apiKey = config.apiKey;
      this.baseUrl = config.baseUrl || 'https://your-app.vercel.app';
      this.timeout = config.timeout || 10000;
    }
  }

  /**
   * Track a ChatGPT message
   */
  async track(options: TrackMessageOptions): Promise<{
    success: boolean;
    messageId: string;
    sessionId: string;
    cost: number;
    remainingCalls: number;
  }> {
    const response = await this.makeRequest('/api/track', {
      method: 'POST',
      body: JSON.stringify(options)
    });

    return response;
  }

  /**
   * Get analytics metrics
   */
  async getMetrics(options?: MetricsOptions): Promise<any> {
    const params = new URLSearchParams();

    if (options?.startDate) {
      params.append('startDate', options.startDate.toISOString());
    }

    if (options?.endDate) {
      params.append('endDate', options.endDate.toISOString());
    }

    if (options?.includeSessions) {
      params.append('includeSessions', 'true');
    }

    const url = `/api/metrics${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await this.makeRequest(url, { method: 'GET' });

    return response;
  }

  /**
   * Export analytics data
   */
  async export(options: ExportOptions): Promise<{
    success: boolean;
    exportId: string;
    message: string;
  }> {
    const response = await this.makeRequest('/api/export', {
      method: 'POST',
      body: JSON.stringify({
        format: options.format,
        startDate: options.startDate?.toISOString(),
        endDate: options.endDate?.toISOString()
      })
    });

    return response;
  }

  /**
   * Get export status
   */
  async getExportStatus(exportId: string): Promise<any> {
    const response = await this.makeRequest(`/api/export?exportId=${exportId}`, {
      method: 'GET'
    });

    return response;
  }

  /**
   * Create billing checkout session
   */
  async createCheckout(tier: 'pro' | 'enterprise', options?: {
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<{
    success: boolean;
    sessionId: string;
    url: string;
  }> {
    const response = await this.makeRequest('/api/billing', {
      method: 'POST',
      body: JSON.stringify({
        tier,
        successUrl: options?.successUrl,
        cancelUrl: options?.cancelUrl
      })
    });

    return response;
  }

  /**
   * Get billing portal URL
   */
  async getBillingPortal(): Promise<{
    success: boolean;
    url: string;
  }> {
    const response = await this.makeRequest('/api/billing', {
      method: 'GET'
    });

    return response;
  }

  /**
   * Make an API request
   */
  private async makeRequest(endpoint: string, options: RequestInit): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          ...options.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      throw error;
    }
  }
}

/**
 * Helper function to automatically track OpenAI API calls
 *
 * @example
 * ```typescript
 * import { trackOpenAI } from '@chatgpt-analytics/sdk-js';
 *
 * const analytics = trackOpenAI('your-api-key');
 *
 * // Wrap your OpenAI call
 * const response = await analytics.chat.completions.create({
 *   model: 'gpt-4',
 *   messages: [{ role: 'user', content: 'Hello!' }]
 * });
 * ```
 */
export function trackOpenAI(apiKey: string, sessionId?: string) {
  // This would be implemented to wrap OpenAI SDK calls
  // For now, this is a placeholder for future enhancement
  console.warn('trackOpenAI is not yet implemented. Use analytics.track() manually.');
}

export default ChatGPTAnalytics;
