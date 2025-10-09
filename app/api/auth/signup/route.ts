import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, orgName } = await request.json();

    if (!name || !email || !password || !orgName) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: authError?.message || 'Failed to create account' },
        { status: 400 }
      );
    }

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .insert({
        name: orgName,
        plan: 'free'
      })
      .select()
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { success: false, error: 'Failed to create organization' },
        { status: 500 }
      );
    }

    // Add user as owner of the organization
    const { error: memberError } = await supabase
      .from('org_members')
      .insert({
        org_id: org.id,
        user_id: authData.user.id,
        role: 'owner',
        email: email,
        name: name
      });

    if (memberError) {
      return NextResponse.json(
        { success: false, error: 'Failed to add user to organization' },
        { status: 500 }
      );
    }

    // Sign in the user
    const { data: sessionData } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        org_id: org.id,
        org_name: org.name,
        role: 'owner'
      }
    });

    // Set auth cookie
    if (sessionData.session) {
      response.cookies.set('auth-token', sessionData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
    }

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
