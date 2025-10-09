// POST /api/track - Public event collector for ChatGPT App Analytics
import { NextRequest, NextResponse } from 'next/server';
import { authenticateTrackRequest } from '@/lib/auth';
import { createServerClient, checkRateLimit } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for track events
const trackEventSchema = z.object({
  event: z.enum(['invoked', 'completed', 'error', 'converted', 'custom']),
  name: z.string().optional(),
  properties: z.record(z.any()).optional().default({}),
  prompt_hash: z.string().optional(),
  error_message: z.string().optional(),
  latency_ms: z.number().optional()
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate via x-app-key header
    const { app, error: authError } = await authenticateTrackRequest(request);

    if (authError || !app) {
      return NextResponse.json(
        { error: authError || 'Authentication failed' },
        { status: 401 }
      );
    }

    // Check rate limit (10 req/sec per write_key)
    const rateLimitOk = await checkRateLimit(request.headers.get('x-app-key')!, app.rate_limit_per_sec);

    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', limit: `${app.rate_limit_per_sec} requests/second` },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = trackEventSchema.parse(body);

    const supabase = createServerClient();

    // Insert event
    const { data: event, error: insertError } = await supabase
      .from('events')
      .insert({
        app_id: app.id,
        event_type: validatedData.event,
        event_name: validatedData.name,
        properties: validatedData.properties,
        prompt_hash: validatedData.prompt_hash,
        error_message: validatedData.error_message,
        latency_ms: validatedData.latency_ms
      })
      .select()
      .single();

    if (insertError) {
      throw new Error('Failed to insert event');
    }

    return NextResponse.json({
      success: true,
      event_id: event.id,
      timestamp: event.timestamp
    });
  } catch (error: any) {
    console.error('Track API error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
