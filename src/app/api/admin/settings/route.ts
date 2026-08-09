import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/api-auth';
import { resetTransporter } from '@/lib/email';

export async function GET() {
  try {
    const { data, error } = await supabaseServer.from('settings').select('*').limit(1).maybeSingle() as any;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data || {});
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const existing = await supabaseServer.from('settings').select('id').limit(1).maybeSingle() as any;
    const { data, error } = await supabaseServer
      .from('settings')
      .update({
        whatsapp_number: body.whatsapp_number,
        email_user: body.email_user,
        email_pass: body.email_pass,
        email_host: body.email_host,
        email_port: body.email_port,
        email_secure: body.email_secure,
        email_from_name: body.email_from_name,
        email_from_address: body.email_from_address,
        admin_notification_email: body.admin_notification_email,
      })
      .eq('id', existing.data?.id)
      .select()
      .single() as any;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    resetTransporter();

    return NextResponse.json({ message: 'Settings updated successfully!', settings: data });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
