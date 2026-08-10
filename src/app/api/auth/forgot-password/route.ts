import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data: profile } = await supabaseServer.from('profiles').select('*').eq('email', email).maybeSingle() as any;
    if (!profile) {
      return NextResponse.json({ error: 'No account found with this email.' }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);

    const { error } = await supabaseServer
      .from('profiles')
      .update({ reset_otp: otp, reset_otp_expiry: expiry.toISOString() })
      .eq('id', profile.id) as any;

    if (error) {
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }

    // Generate a reset password OTP HTML email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 2rem; background: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #173D2F; text-align:center;">Destin Vacations</h2>
          <h3 style="text-align:center; color:#333;">Password Reset Request</h3>
          <p style="color:#555;">Hi <strong>${profile.name}</strong>,</p>
          <p style="color:#555;">Use the OTP below to reset your password. It is valid for <strong>10 minutes</strong>.</p>
          <div style="text-align:center; margin: 2rem 0;">
              <span style="font-size: 2.5rem; font-weight: bold; letter-spacing: 10px; color: #173D2F; background: #e8f4ef; padding: 1rem 2rem; border-radius: 10px;">${otp}</span>
          </div>
          <p style="color:#888; font-size:0.85rem; text-align:center;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    console.log(`[DEV] OTP for ${email}: ${otp}`);

    try {
      await sendEmail(email, '🔐 Your Destin Vacations Password Reset OTP', emailHtml);
    } catch (emailErr) {
      console.error('Failed to send OTP email:', emailErr);
    }

    return NextResponse.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
