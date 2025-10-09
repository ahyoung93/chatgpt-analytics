// API route for data export
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, hasAccess, getTierLimits } from '@/lib/auth';
import { createExport, getExportStatus } from '@/lib/export';
import { logApiCall } from '@/lib/db';
import { z } from 'zod';

const exportRequestSchema = z.object({
  format: z.enum(['csv', 'json', 'pdf']),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

// Create export
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { user, error: authError } = await authenticateRequest(request);

    if (authError || !user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { format, startDate, endDate } = exportRequestSchema.parse(body);

    // Check if user has access to this export format
    const tierLimits = getTierLimits(user.subscription_tier);
    if (!tierLimits.exportFormats.includes(format)) {
      return NextResponse.json(
        {
          error: 'Export format not available in your plan',
          availableFormats: tierLimits.exportFormats,
          currentTier: user.subscription_tier
        },
        { status: 403 }
      );
    }

    // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Create export (this will process in background in production)
    const exportId = await createExport(user.id, format, start, end);

    await logApiCall(
      user.id,
      '/api/export',
      'POST',
      200,
      Date.now() - startTime,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      exportId,
      message: 'Export created successfully'
    });
  } catch (error: any) {
    console.error('Export API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// Get export status
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);

    if (authError || !user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const exportId = searchParams.get('exportId');

    if (!exportId) {
      return NextResponse.json(
        { error: 'Export ID is required' },
        { status: 400 }
      );
    }

    const exportData = await getExportStatus(user.id, exportId);

    return NextResponse.json({
      success: true,
      export: exportData
    });
  } catch (error: any) {
    console.error('Export status API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}
