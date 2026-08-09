import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('testimonials')
      .select('*')
      .eq('status', 'Approved')
      .order('created_at', { ascending: false }) as any;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Get testimonials error:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const trip_type = formData.get('trip_type') as string;
    const rating = Number(formData.get('rating'));
    const review_text = formData.get('review_text') as string;
    const images = formData.getAll('images') as File[];

    let mediaUrls: string[] = [];

    // Ensure bucket exists in Supabase Storage
    try {
      const { data: buckets } = await supabaseServer.storage.listBuckets();
      if (!buckets?.some(b => b.name === 'testimonial-images')) {
        await supabaseServer.storage.createBucket('testimonial-images', { public: true });
      }
    } catch (bErr) {
      console.warn('Bucket check/create error (will attempt upload):', bErr);
    }

    for (const file of images) {
      if (!file || typeof file === 'string' || !file.name || file.size === 0) continue;

      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `testimonials/${Date.now()}-${Math.round(Math.random() * 1E9)}-${cleanName}`;
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = file.type || 'application/octet-stream';

        const { error: uploadError } = await supabaseServer.storage
          .from('testimonial-images')
          .upload(filePath, buffer, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          console.error('File upload error for', file.name, ':', uploadError);
          continue;
        }

        const { data: publicUrlData } = supabaseServer.storage
          .from('testimonial-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          mediaUrls.push(publicUrlData.publicUrl);
        }
      } catch (fErr) {
        console.error('Error processing uploaded file:', file.name, fErr);
      }
    }

    const { data: testimonial, error } = await supabaseServer
      .from('testimonials')
      .insert({
        name,
        trip_type,
        rating,
        review_text,
        images: mediaUrls,
        status: 'Approved',
      })
      .select()
      .single() as any;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Testimonial submitted successfully!', testimonial });
  } catch (error) {
    console.error('Submit testimonial error:', error);
    return NextResponse.json({ error: 'Failed to submit testimonial' }, { status: 500 });
  }
}
