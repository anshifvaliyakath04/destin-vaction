import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/api-auth';
import { sendConfirmationEmail } from '@/lib/email';

export async function PUT(request: Request, context: { params: Promise<any> }) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await context.params;
    const { status, reason } = await request.json();
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { data: trip, error } = await supabaseServer
      .from('trips')
      .update({ status })
      .eq('id', id)
      .select()
      .single() as any;

    if (error || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    try {
      if (status === 'Approved' || status === 'Rejected') {
        await sendConfirmationEmail(trip, reason);
      }
    } catch (emailErr) {
      console.error('Failed to send status confirmation email:', emailErr);
    }

    return NextResponse.json({ message: 'Status updated successfully', trip });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
