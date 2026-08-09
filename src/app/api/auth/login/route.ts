import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_destin_key_123';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    } as any);

    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single() as any;

    const token = jwt.sign(
      { userId: profile?.id || authData.user.id, email: profile?.email || email, role: profile?.role || 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      user: {
        id: profile?.id || authData.user.id,
        name: profile?.name || authData.user.email?.split('@')[0],
        email: profile?.email || email,
        role: profile?.role || 'user',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error during login' }, { status: 500 });
  }
}
