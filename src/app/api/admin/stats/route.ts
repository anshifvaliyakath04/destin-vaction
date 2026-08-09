import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { data: trips } = await supabaseServer.from('trips').select('status, estimated_price') as any;
    const totalBookings = trips?.length || 0;
    const pendingApprovals = trips?.filter((t: any) => t.status === 'Pending').length || 0;
    const upcomingTrips = trips?.filter((t: any) => t.status === 'Approved').length || 0;
    const totalRevenue = trips?.filter((t: any) => t.status === 'Approved').reduce((sum: number, t: any) => sum + (t.estimated_price || 0), 0) || 0;

    return NextResponse.json({ totalBookings, totalRevenue, pendingApprovals, upcomingTrips });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
