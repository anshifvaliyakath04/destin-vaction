import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/api-auth';

// DELETE /api/admin/testimonials/[id]
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await context.params;
    const { error } = await supabaseServer.from('testimonials').delete().eq('id', id) as any;
    if (error) return NextResponse.json({ error: 'Failed to delete testimonial.' }, { status: 500 });
    return NextResponse.json({ message: 'Testimonial deleted successfully!' });
  } catch (err) {
    console.error('Delete testimonial error:', err);
    return NextResponse.json({ error: 'Failed to delete testimonial.' }, { status: 500 });
  }
}

// PATCH /api/admin/testimonials/[id] — update status and/or content fields
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await context.params;
    const body = await request.json();
    const allowed = ['status', 'name', 'trip_type', 'rating', 'review_text'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }
    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
    }
    const { data, error } = await supabaseServer
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single() as any;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: 'Testimonial updated!', testimonial: data });
  } catch (err) {
    console.error('Patch testimonial error:', err);
    return NextResponse.json({ error: 'Failed to update testimonial.' }, { status: 500 });
  }
}