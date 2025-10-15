export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// POST /api/track-gpt - Public GPT event collector with automatic hashing
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { z } from 'zod';

// Validation schema for GPT track events (with raw data)
const trackGptEventSchema = z.object({
  event: z.enum(['invoked', 'completed', 'error', 'converted', 'custom']),
  name: z.string().optional(),
  properties: z.record(z.any()).optional().default({}),
  // Raw prompt text (will be hashed)
  prompt: z.string().optional(),
  // Raw user ID (will be hashed)
  user_id: z.string().optional(),
  error_message: z.string().optional(),
  latency_ms: z.number().optional(),
  // Revenue tracking (optional)
  revenue: z.number().optional(),
  currency: z.string().optional().default('USD'),
});

// Hash a string with SHA-256
function hashSHA256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    // Get the x-app-key header
    const appKey = request.headers.get('x-app-key');

    console.log('[track-gpt] Received request with API key:', appKey ? `${appKey.substring(0, 15)}...` : 'MISSING');

    if (!appKey) {
      return NextResponse.json(
        { error: 'Missing x-app-key header' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    console.log('[track-gpt] Request body:', JSON.stringify(body, null, 2));
    const validatedData = trackGptEventSchema.parse(body);

    // Hash sensitive data
    const prompt_hash = validatedData.prompt ? hashSHA256(validatedData.prompt) : undefined;
    const user_hash = validatedData.user_id ? hashSHA256(validatedData.user_id) : undefined;

    // Build the payload for the internal track API
    const trackPayload = {
      event: validatedData.event,
      name: validatedData.name,
      properties: validatedData.properties,
      prompt_hash,
      user_hash,
      error_message: validatedData.error_message,
      latency_ms: validatedData.latency_ms,
      revenue: validatedData.revenue,
      currency: validatedData.currency,
    };

    // Forward to the internal track API
    const trackUrl = new URL('/api/track', request.url);
    const trackResponse = await fetch(trackUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-key': appKey,
      },
      body: JSON.stringify(trackPayload),
    });

    const trackData = await trackResponse.json();

    if (!trackResponse.ok) {
      return NextResponse.json(
        trackData,
        { status: trackResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      event_id: trackData.event_id,
      timestamp: trackData.timestamp,
      hashed: {
        prompt_hash: prompt_hash ? true : false,
        user_hash: user_hash ? true : false,
      }
    });
  } catch (error: any) {
    console.error('Track GPT API error:', error);

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
