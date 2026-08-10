import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();
    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    // Fetch profile and validate OTP
    const { data: profile, error: fetchError } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle() as any;

    if (fetchError) {
      console.error('Profile fetch error:', fetchError);
      return NextResponse.json({ error: 'Server error fetching profile' }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'No account found with this email.' }, { status: 404 });
    }

    if (profile.reset_otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 });
    }

    if (profile.reset_otp_expiry && new Date(profile.reset_otp_expiry) < new Date()) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Update the password via Supabase Auth Admin
    const { error: authError } = await supabaseServer.auth.admin.updateUserById(profile.id, {
      password: newPassword,
    });

    if (authError) {
      console.error('Supabase auth update error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Clear OTP fields after successful reset
    await supabaseServer
      .from('profiles')
      .update({ reset_otp: null, reset_otp_expiry: null })
      .eq('id', profile.id);

    return NextResponse.json({ message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Server error during password reset' }, { status: 500 });
  }
}
