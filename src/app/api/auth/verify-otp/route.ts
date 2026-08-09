import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const { data: profile } = await supabaseServer.from('profiles').select('*').eq('email', email).maybeSingle() as any;
    if (!profile || profile.reset_otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (profile.reset_otp_expiry && new Date(profile.reset_otp_expiry) < new Date()) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    return NextResponse.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
