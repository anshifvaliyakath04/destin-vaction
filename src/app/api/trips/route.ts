import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getToken, verifyToken } from '@/lib/api-auth';
import { sendAdminNotificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_name, customer_phone, customer_whatsapp,
      customer_email, customer_address, pickup_location,
      destinations, start_date, duration,
      adults, children, travel_type,
      budget_range, package_type,
      hotel_category, transport,
      activities, food_pref, special_requests, estimated_price
    } = body;

    const token = getToken(request);
    let user_id: string | null = null;
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) user_id = decoded.userId;
    }

    // Validate required fields
    if (!customer_name || !customer_phone || !customer_email || !pickup_location || !destinations || !start_date || !duration) {
      return NextResponse.json({ error: 'Missing required fields: name, phone, email, pickup location, destinations, date and duration are all required.' }, { status: 400 });
    }

    if (!user_id && customer_email) {
      const { data: profile } = await supabaseServer.from('profiles').select('id').eq('email', customer_email.toLowerCase().trim()).maybeSingle() as any;
      if (profile) user_id = profile.id;
    }


    const { data: trip, error } = await supabaseServer
      .from('trips')
      .insert({
        ...(user_id ? { user_id } : {}),
        customer_name,
        customer_phone,
        customer_whatsapp: customer_whatsapp || null,
        customer_email,
        customer_address: customer_address || null,
        pickup_location,
        destinations: Array.isArray(destinations) ? destinations : (destinations ? [destinations] : []),
        start_date,
        duration,
        adults: adults || 1,
        children: children || 0,
        travel_type: travel_type || 'Couple',
        budget_range: budget_range || 'Not specified',
        package_type: package_type || 'Not specified',
        hotel_category: hotel_category || 'Not specified',
        transport: transport || 'Not specified',
        activities: Array.isArray(activities) ? activities : [],
        food_pref: food_pref || 'Any',
        special_requests: special_requests || '',
        estimated_price: estimated_price || 0,
        status: 'Pending',
        payment_status: 'Pending',
      })
      .select()
      .single() as any;

    if (error) {
      console.error('Supabase trip creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fire and forget email notification to avoid blocking the HTTP response
    sendAdminNotificationEmail(trip).catch(emailErr => {
      console.error('Failed to send admin notification email:', emailErr);
    });

    return NextResponse.json({ message: 'Trip planned and saved successfully!', trip });
  } catch (error) {
    console.error('Create trip error:', error);
    return NextResponse.json({ error: 'Failed to save trip' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const token = getToken(request);
    const decoded = token ? await verifyToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseServer
      .from('trips')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('created_at', { ascending: false }) as any;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Get trips error:', error);
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
  }
}
