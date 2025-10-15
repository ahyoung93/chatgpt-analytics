export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// POST /api/debug-track - Debug endpoint to see what GPT is actually sending
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = Object.fromEntries(request.headers.entries());

    // Log everything to console
    console.log('=== DEBUG TRACK REQUEST ===');
    console.log('Headers:', headers);
    console.log('Body:', JSON.stringify(body, null, 2));
    console.log('========================');

    // Return what we received
    return NextResponse.json({
      success: true,
      debug: {
        received_body: body,
        received_headers: {
          'x-app-key': headers['x-app-key'] ? 'present (hidden)' : 'missing',
          'content-type': headers['content-type'],
          'user-agent': headers['user-agent'],
        },
        fields_present: {
          event: !!body.event,
          prompt: !!body.prompt,
          user_id: !!body.user_id,
          latency_ms: !!body.latency_ms,
          error_message: !!body.error_message,
        },
        actual_values: {
          event: body.event || null,
          prompt: body.prompt || null,
          user_id: body.user_id || null,
        }
      }
    });
  } catch (error: any) {
    console.error('Debug track error:', error);
    return NextResponse.json({
      error: 'Failed to parse request',
      message: error.message,
    }, { status: 400 });
  }
}
