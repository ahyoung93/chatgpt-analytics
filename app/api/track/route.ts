// API route to track ChatGPT usage
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { createServerClient } from '@/lib/db';
import { calculateCost } from '@/lib/metrics';
import { checkRateLimit, logApiCall } from '@/lib/db';
import { z } from 'zod';

// Validation schema
const trackRequestSchema = z.object({
  sessionId: z.string(),
  message: z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    model: z.string().optional(),
    promptTokens: z.number().optional().default(0),
    completionTokens: z.number().optional().default(0),
    totalTokens: z.number().optional().default(0),
    latencyMs: z.number().optional(),
    metadata: z.record(z.any()).optional().default({})
  }),
  sessionMetadata: z.object({
    title: z.string().optional(),
    model: z.string().optional(),
    metadata: z.record(z.any()).optional()
  }).optional()
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate request
    const { user, error: authError } = await authenticateRequest(request);

    if (authError || !user) {
      await logApiCall(
        'unknown',
        '/api/track',
        'POST',
        401,
        Date.now() - startTime,
        request.headers.get('x-forwarded-for') || undefined,
        request.headers.get('user-agent') || undefined,
        authError || 'Unauthorized'
      );

      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check rate limits
    const rateLimit = await checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      await logApiCall(
        user.id,
        '/api/track',
        'POST',
        429,
        Date.now() - startTime,
        request.headers.get('x-forwarded-for') || undefined,
        request.headers.get('user-agent') || undefined,
        'Rate limit exceeded'
      );

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit: rateLimit.remaining
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = trackRequestSchema.parse(body);

    const supabase = createServerClient();

    // Get or create chat session
    const { data: existingSession } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_id', validatedData.sessionId)
      .single();

    let sessionDbId: string;

    if (!existingSession) {
      // Create new session
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          session_id: validatedData.sessionId,
          title: validatedData.sessionMetadata?.title,
          model: validatedData.sessionMetadata?.model || validatedData.message.model,
          metadata: validatedData.sessionMetadata?.metadata || {}
        })
        .select()
        .single();

      if (sessionError || !newSession) {
        throw new Error('Failed to create session');
      }

      sessionDbId = newSession.id;
    } else {
      sessionDbId = existingSession.id;
    }

    // Calculate cost if not provided
    const model = validatedData.message.model || 'gpt-3.5-turbo';
    const cost = calculateCost(
      model,
      validatedData.message.promptTokens,
      validatedData.message.completionTokens
    );

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionDbId,
        user_id: user.id,
        role: validatedData.message.role,
        content: validatedData.message.content,
        model,
        prompt_tokens: validatedData.message.promptTokens,
        completion_tokens: validatedData.message.completionTokens,
        total_tokens: validatedData.message.totalTokens,
        cost,
        latency_ms: validatedData.message.latencyMs,
        metadata: validatedData.message.metadata
      })
      .select()
      .single();

    if (messageError) {
      throw new Error('Failed to insert message');
    }

    // Update session statistics - manual update since RPC might not exist yet
    await supabase
      .from('chat_sessions')
      .update({
        total_tokens: existingSession
          ? existingSession.total_tokens + validatedData.message.totalTokens
          : validatedData.message.totalTokens,
        total_cost: existingSession
          ? parseFloat(existingSession.total_cost.toString()) + cost
          : cost,
        message_count: existingSession
          ? existingSession.message_count + 1
          : 1,
        ended_at: new Date().toISOString()
      })
      .eq('id', sessionDbId);

    // Log successful API call
    await logApiCall(
      user.id,
      '/api/track',
      'POST',
      200,
      Date.now() - startTime,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      messageId: message.id,
      sessionId: sessionDbId,
      cost,
      remainingCalls: rateLimit.remaining - 1
    });
  } catch (error: any) {
    console.error('Track API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}
