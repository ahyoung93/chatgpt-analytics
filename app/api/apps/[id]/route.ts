import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// DELETE /api/apps/[id] - Delete an app
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get user's org_id
    const { data: orgMember, error: orgError } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !orgMember) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Verify the app belongs to the user's org before deleting
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select('id, org_id')
      .eq('id', params.id)
      .single();

    if (appError || !app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    if (app.org_id !== orgMember.org_id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this app' },
        { status: 403 }
      );
    }

    // Delete the app (cascade will delete related events)
    const { error: deleteError } = await supabase
      .from('apps')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      throw new Error('Failed to delete app');
    }

    return NextResponse.json({
      success: true,
      message: 'App deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete app error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
