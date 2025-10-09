export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// Redirect to proper metrics endpoints
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json(
    {
      error: 'Endpoint moved',
      message: 'Please use specific metrics endpoints:',
      endpoints: {
        summary: '/api/metrics/summary',
        timeseries: '/api/metrics/timeseries',
        benchmarks: '/api/metrics/benchmarks',
        topSources: '/api/metrics/top-sources',
        conversion: '/api/metrics/conversion'
      }
    },
    { status: 410 } // 410 Gone - resource permanently moved
  );
}
