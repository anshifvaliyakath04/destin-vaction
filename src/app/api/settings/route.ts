import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    const { data, error } = await supabaseServer.from('settings').select('whatsapp_number').limit(1).maybeSingle() as any;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ whatsapp_number: data?.whatsapp_number || '919526886600' });
  } catch (error) {
    console.error('Get public settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch public settings' }, { status: 500 });
  }
}
