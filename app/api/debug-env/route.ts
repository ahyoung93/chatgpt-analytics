export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) || 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
  });
}
