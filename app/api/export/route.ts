export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// POST /api/export - Generate CSV export (Pro/Team only)
import { NextRequest, NextResponse } from 'next/server';
import { hasFeatureAccess } from '@/lib/auth';
import { generateCSVExport } from '@/lib/export';
import { z } from 'zod';

const exportRequestSchema = z.object({
  appId: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  plan: z.enum(['free', 'pro', 'team'])
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, startDate, endDate, plan } = exportRequestSchema.parse(body);

    // Check if user has CSV export feature
    if (!hasFeatureAccess(plan, 'csv_export')) {
      return NextResponse.json(
        {
          error: 'CSV export not available',
          message: 'Upgrade to Pro or Team plan to export data as CSV'
        },
        { status: 403 }
      );
    }

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const csvData = await generateCSVExport(appId, start, end);

    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="app-analytics-${appId}-${Date.now()}.csv"`
      }
    });
  } catch (error: any) {
    console.error('Export API error:', error);

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
