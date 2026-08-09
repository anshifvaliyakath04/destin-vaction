import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/api-auth';

export async function PUT(request: Request) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { currentPassword, newEmail, newPassword } = await request.json();
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required.' }, { status: 400 });
    }
    if (!newEmail && !newPassword) {
      return NextResponse.json({ error: 'Provide a new email or new password to update.' }, { status: 400 });
    }

    const { data: admins } = await supabaseServer.from('profiles').select('*').eq('role', 'admin') as any;
    const admin = admins?.[0];
    if (!admin) return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 });

    // Verify current password by attempting to sign in with the admin's email and current password
    const { error: verifyError } = await supabaseServer.auth.signInWithPassword({
      email: admin.email,
      password: currentPassword,
    } as any);

    if (verifyError) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }

    const updates: any = {};
    if (newEmail) {
      const { data: existing } = await supabaseServer.from('profiles').select('id').eq('email', newEmail).maybeSingle() as any;
      if (existing && existing.id !== admin.id) {
        return NextResponse.json({ error: 'This email is already in use by another account.' }, { status: 400 });
      }
      updates.email = newEmail;
      await supabaseServer.auth.admin.updateUserById(admin.id, { email: newEmail } as any);
    }
    if (newPassword) {
      await supabaseServer.auth.admin.updateUserById(admin.id, { password: newPassword } as any);
    }

    const { data: updated, error } = await supabaseServer
      .from('profiles')
      .update(updates)
      .eq('id', admin.id)
      .select()
      .single() as any;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Admin credentials updated successfully.', admin: updated });
  } catch (error) {
    console.error('Change credentials error:', error);
    return NextResponse.json({ error: 'Server error while changing credentials.' }, { status: 500 });
  }
}
