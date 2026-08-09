import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();
    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    const { data: profile } = await supabaseServer.from('profiles').select('*').eq('email', email).maybeSingle() as any;
    if (!profile || profile.reset_otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (profile.reset_otp_expiry && new Date(profile.reset_otp_expiry) < new Date()) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const { error: authError } = await (supabaseServer.auth as any).admin.updateUser(profile.id, { password: newPassword });
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    await supabaseServer.from('profiles').update({ reset_otp: null, reset_otp_expiry: null }).eq('id', profile.id) as any;

    return NextResponse.json({ message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Server error during password reset' }, { status: 500 });
  }
}
