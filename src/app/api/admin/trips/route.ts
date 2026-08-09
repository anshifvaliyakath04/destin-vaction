import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { data, error } = await supabaseServer
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false }) as any;

    if (error) {
      console.error('Supabase admin trips fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (data || []).map((t: any) => ({
      id: t.id,
      user_name: t.customer_name || t.user_name || 'Guest User',
      user_email: t.customer_email || t.user_email || 'Guest Email',
      user_phone: t.customer_phone || t.user_phone || '',
      user_whatsapp: t.customer_whatsapp || t.user_whatsapp || '',
      user_address: t.customer_address || t.user_address || '',
      pickup_location: t.pickup_location || '',
      destinations: Array.isArray(t.destinations)
        ? t.destinations.join(', ')
        : (typeof t.destinations === 'string' ? t.destinations : ''),
      start_date: t.start_date || '',
      duration: t.duration || '',
      adults: t.adults || 0,
      children: t.children || 0,
      travel_type: t.travel_type || 'Couple',
      food_pref: t.food_pref || 'Any',
      special_requests: t.special_requests || '',
      package_type: t.package_type || '',
      estimated_price: t.estimated_price || 0,
      status: t.status || 'Pending',
      payment_status: t.payment_status || 'Pending',
      created_at: t.created_at,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Get admin trips error:', error);
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.customer_name || !body.customer_phone || !body.customer_email || !body.pickup_location || !body.start_date) {
      return NextResponse.json({ error: 'Missing required fields: name, phone, email, pickup location, and start date are required.' }, { status: 400 });
    }

    // Parse destinations: accept array or comma-separated string
    let destinations: string[] = [];
    if (Array.isArray(body.destinations)) {
      destinations = body.destinations;
    } else if (typeof body.destinations === 'string' && body.destinations.trim()) {
      destinations = body.destinations.split(',').map((d: string) => d.trim()).filter(Boolean);
    }

    const { data, error } = await supabaseServer
      .from('trips')
      .insert({
        customer_name: body.customer_name.trim(),
        customer_phone: body.customer_phone.trim(),
        customer_whatsapp: body.customer_whatsapp?.trim() || body.customer_phone.trim(),
        customer_email: body.customer_email.trim().toLowerCase(),
        customer_address: body.customer_address?.trim() || '',
        pickup_location: body.pickup_location.trim(),
        destinations,
        start_date: body.start_date,
        duration: body.duration || '3 Nights / 4 Days',
        adults: parseInt(body.adults) || 1,
        children: parseInt(body.children) || 0,
        travel_type: body.travel_type || 'Couple',
        food_pref: body.food_pref || 'Any',
        special_requests: body.special_requests?.trim() || '',
        status: body.status || 'Pending',
        payment_status: body.payment_status || 'Pending',
        estimated_price: parseFloat(body.estimated_price) || 0,
        budget_range: body.budget_range || 'Not specified',
        package_type: body.package_type || 'Not specified',
        hotel_category: body.hotel_category || 'Not specified',
        transport: body.transport || 'Not specified',
        activities: Array.isArray(body.activities) ? body.activities : [],
      })
      .select()
      .single() as any;

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Trip booking created successfully!', trip: data });
  } catch (error) {
    console.error('Create trip error:', error);
    return NextResponse.json({ error: 'Server error during trip booking creation' }, { status: 500 });
  }
}
