import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Order } from '@/app/types';

export async function GET() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map flat DB structure to nested App structure
  const orders: Order[] = data.map((row: any) => ({
    id: row.id,
    createdAt: row.created_at,
    package: row.package,
    vehicle: {
      year: row.vehicle_year,
      make: row.vehicle_make,
      model: row.vehicle_model,
      trim: row.vehicle_trim,
    },
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
    },
    status: row.status,
    jobRequest: row.job_request,
    photoUrl: row.photo_url,
  }));

  return NextResponse.json(orders);
}

import { uploadImage } from '@/lib/s3';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const packageLevel = formData.get('package') as string;
    const vehicleYear = formData.get('vehicle[year]') as string;
    const vehicleMake = formData.get('vehicle[make]') as string;
    const vehicleModel = formData.get('vehicle[model]') as string;
    const vehicleTrim = formData.get('vehicle[trim]') as string;
    
    const customerName = formData.get('customer[name]') as string;
    const customerEmail = formData.get('customer[email]') as string;
    const customerPhone = formData.get('customer[phone]') as string;
    
    const jobRequest = formData.get('jobRequest') as string;
    const status = formData.get('status') as string || 'pending';
    const photoFile = formData.get('photo') as File | null;

    // Validate body basics
    if (!packageLevel || !vehicleMake || !vehicleModel || !customerName) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let photoUrl = '';

    if (photoFile) {
        // Upload to S3
        const bytes = await photoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        // Clean filename, keep extension if present
        const cleanName = photoFile.name.replace(/[^a-zA-Z0-9.-]/g, '');
        // Generate random unique name
        const fileExt = cleanName.split('.').pop();
        const randomId = crypto.randomUUID();
        const fileName = `${randomId}.${fileExt}`;
        
        photoUrl = await uploadImage(buffer, fileName, photoFile.type);
    }

    const { data, error } = await supabase
        .from('orders')
        .insert({
            // created_at is default
            package: packageLevel,
            vehicle_year: vehicleYear,
            vehicle_make: vehicleMake,
            vehicle_model: vehicleModel,
            vehicle_trim: vehicleTrim,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            status: status,
            job_request: jobRequest,
            photo_url: photoUrl,
        })
        .select()
        .single();
    
      if (error) {
        throw error;
      }
      
      const newOrder: Order = {
        id: data.id,
        createdAt: data.created_at,
        package: data.package,
        vehicle: {
          year: data.vehicle_year,
          make: data.vehicle_make,
          model: data.vehicle_model,
          trim: data.vehicle_trim,
        },
        customer: {
          name: data.customer_name,
          email: data.customer_email,
          phone: data.customer_phone,
        },
        status: data.status,
        jobRequest: data.job_request,
        photoUrl: data.photo_url,
      };

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
