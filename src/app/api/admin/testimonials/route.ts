import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { data, error } = await supabaseServer.from('testimonials').select('*').order('created_at', { ascending: false }) as any;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Get testimonials error:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<any> }) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await context.params;
    const { error } = await supabaseServer.from('testimonials').delete().eq('id', id) as any;
    if (error) {
      return NextResponse.json({ error: 'Failed to delete testimonial.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Testimonial deleted successfully!' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial.' }, { status: 500 });
  }
}
