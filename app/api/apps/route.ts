import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { randomBytes } from 'crypto';

// Validation schema for creating an app
const createAppSchema = z.object({
  name: z.string().min(1, 'App name is required'),
  category: z.enum([
    'writing',
    'productivity',
    'research_analysis',
    'education',
    'lifestyle',
    'dalle',
    'programming'
  ])
});

// GET /api/apps - Fetch all apps for the authenticated user's org
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's org_id from org_members
    const { data: orgMember, error: orgError } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !orgMember) {
      console.error('Org lookup failed:', {
        userId: user.id,
        error: orgError,
        data: orgMember
      });
      return NextResponse.json(
        { error: 'Organization not found', details: orgError?.message },
        { status: 404 }
      );
    }

    // Fetch all apps for the org
    const { data: apps, error: appsError } = await supabase
      .from('apps')
      .select('*')
      .eq('org_id', orgMember.org_id)
      .order('created_at', { ascending: false });

    if (appsError) {
      throw new Error('Failed to fetch apps');
    }

    return NextResponse.json({ apps });
  } catch (error: any) {
    console.error('Get apps error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/apps - Create a new app
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's org
    const { data: orgMember, error: orgError } = await supabase
      .from('org_members')
      .select('org_id, org:orgs(plan)')
      .eq('user_id', user.id)
      .single();

    if (orgError || !orgMember) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createAppSchema.parse(body);

    // Check if user can create more apps (using existing function)
    const { data: canCreate, error: checkError } = await supabase
      .rpc('can_create_app', { org_uuid: orgMember.org_id });

    if (checkError) {
      console.error('Error checking app limit:', checkError);
    }

    if (canCreate === false) {
      return NextResponse.json(
        { error: 'App limit reached for your plan. Upgrade to create more apps.' },
        { status: 403 }
      );
    }

    // Generate a secure write key (32 bytes = 64 hex characters)
    const writeKey = 'odin_' + randomBytes(32).toString('hex');

    // Create the app
    const { data: app, error: createError } = await supabase
      .from('apps')
      .insert({
        org_id: orgMember.org_id,
        name: validatedData.name,
        category: validatedData.category,
        write_key: writeKey,
        rate_limit_per_sec: 10, // Default rate limit
        is_active: true
      })
      .select()
      .single();

    if (createError) {
      console.error('Create app error:', createError);
      throw new Error('Failed to create app');
    }

    return NextResponse.json({
      success: true,
      app
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create app error:', error);

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
