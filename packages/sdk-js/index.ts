/**
 * ChatGPT App Analytics SDK
 *
 * Track your ChatGPT app performance (Custom GPTs, Plugins, MCP servers)
 *
 * @example
 * ```typescript
 * import { createClient } from '@chatgpt-app-analytics/sdk';
 *
 * const analytics = createClient({ appKey: 'sk_...' });
 *
 * // Track when your app is invoked
 * await analytics.track('invoked', { source: 'suggestion' });
 *
 * // Track successful completion
 * await analytics.track('completed', { latency_ms: 1200 });
 *
 * // Track errors
 * await analytics.track('error', { error_message: 'API timeout' });
 * ```
 */

export type EventType = 'invoked' | 'completed' | 'error' | 'converted' | 'custom';

export interface TrackOptions {
  name?: string;
  properties?: Record<string, any>;
  prompt_hash?: string;
  error_message?: string;
  latency_ms?: number;
}

export interface ClientConfig {
  appKey: string;
  baseUrl?: string;
  timeout?: number;
}

export class ChatGPTAppAnalytics {
  private appKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: ClientConfig) {
    this.appKey = config.appKey;
    this.baseUrl = config.baseUrl || 'https://your-app.vercel.app';
    this.timeout = config.timeout || 5000;
  }

  /**
   * Track an event
   *
   * @param event - Event type: 'invoked', 'completed', 'error', 'converted', or 'custom'
   * @param options - Event options (name, properties, latency, etc.)
   *
   * @example
   * ```typescript
   * // Track invocation
   * await analytics.track('invoked');
   *
   * // Track completion with latency
   * await analytics.track('completed', { latency_ms: 1200 });
   *
   * // Track error
   * await analytics.track('error', {
   *   error_message: 'Database connection failed',
   *   properties: { retry_count: 3 }
   * });
   *
   * // Track conversion
   * await analytics.track('converted', {
   *   name: 'purchase_completed',
   *   properties: { amount: 99.99 }
   * });
   * ```
   */
  async track(event: EventType, options: TrackOptions = {}): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/api/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-key': this.appKey
        },
        body: JSON.stringify({
          event,
          ...options
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        console.error('[ChatGPT App Analytics] Request timeout');
        return; // Fail silently on timeout
      }

      console.error('[ChatGPT App Analytics] Track error:', error.message);
      // Fail silently to not break user's app
    }
  }

  /**
   * Track app invocation
   */
  async invoked(options?: Omit<TrackOptions, 'event'>): Promise<void> {
    return this.track('invoked', options);
  }

  /**
   * Track successful completion
   */
  async completed(options?: Omit<TrackOptions, 'event'>): Promise<void> {
    return this.track('completed', options);
  }

  /**
   * Track error
   */
  async error(errorMessage: string, options?: Omit<TrackOptions, 'event' | 'error_message'>): Promise<void> {
    return this.track('error', { ...options, error_message: errorMessage });
  }

  /**
   * Track conversion
   */
  async converted(name?: string, options?: Omit<TrackOptions, 'event' | 'name'>): Promise<void> {
    return this.track('converted', { ...options, name });
  }

  /**
   * Track custom event
   */
  async custom(name: string, options?: Omit<TrackOptions, 'event' | 'name'>): Promise<void> {
    return this.track('custom', { ...options, name });
  }
}

/**
 * Create a ChatGPT App Analytics client
 *
 * @param config - Client configuration with appKey
 * @returns Analytics client instance
 *
 * @example
 * ```typescript
 * const analytics = createClient({ appKey: 'sk_...' });
 * ```
 */
export function createClient(config: ClientConfig): ChatGPTAppAnalytics {
  return new ChatGPTAppAnalytics(config);
}

// Default export
export default { createClient, ChatGPTAppAnalytics };
