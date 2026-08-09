import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/api-auth';

export async function DELETE(request: Request, context: { params: Promise<any> }) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await context.params;
    const { error } = await supabaseServer.from('trips').delete().eq('id', id) as any;
    if (error) {
      return NextResponse.json({ error: 'Failed to delete trip booking.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Trip booking deleted successfully!' });
  } catch (error) {
    console.error('Delete trip error:', error);
    return NextResponse.json({ error: 'Failed to delete trip booking.' }, { status: 500 });
  }
}
