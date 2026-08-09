import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_destin_key_123';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, whatsapp, address } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const { data: existing } = await supabaseServer.from('profiles').select('id').eq('email', email).maybeSingle() as any;
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    } as any);

    if (authError || !authData?.user) {
      return NextResponse.json({ error: authError?.message || 'Failed to create user' }, { status: 500 });
    }

    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .insert({
        id: authData.user.id,
        name,
        email,
        phone: phone || null,
        whatsapp: whatsapp || null,
        address: address || null,
        role: 'user',
      })
      .select()
      .single() as any;

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const token = jwt.sign({ userId: profile.id, email: profile.email, role: profile.role }, JWT_SECRET, { expiresIn: '7d' });

    return NextResponse.json({
      token,
      user: { id: profile.id, name: profile.name, email: profile.email, role: profile.role },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Server error during signup' }, { status: 500 });
  }
}
