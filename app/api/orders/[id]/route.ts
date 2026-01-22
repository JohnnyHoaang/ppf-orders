import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Order } from '@/app/types';

import { deleteImage } from '@/lib/s3';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // First retrieve the order to get the photo URL
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('photo_url')
      .eq('id', id)
      .single();

    if (fetchError) {
       // If order doesn't exist, we can't delete it anyway
       // But proceed to try delete just in case? Or error?
       // Usually if not found, we can just return success or 404.
       // Let's assume standard flow.
       console.error("Order fetch error during delete:", fetchError);
    }
    
    if (order?.photo_url) {
        // Attempt to delete image from S3
        await deleteImage(order.photo_url);
    }

    const { error } = await supabase.from('orders').delete().eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Map App structure to Flat DB structure for update
    // We only update what changes, but simplifying to assume full object or partial update ok
    // If body contains the nested structures, we map them.
    
    const updates: any = {};
    if (body.package) updates.package = body.package;
    if (body.status) updates.status = body.status;
    if (body.jobRequest !== undefined) updates.job_request = body.jobRequest;
    if (body.photoUrl !== undefined) updates.photo_url = body.photoUrl;
    
    if (body.vehicle) {
        if (body.vehicle.year) updates.vehicle_year = body.vehicle.year;
        if (body.vehicle.make) updates.vehicle_make = body.vehicle.make;
        if (body.vehicle.model) updates.vehicle_model = body.vehicle.model;
        if (body.vehicle.trim) updates.vehicle_trim = body.vehicle.trim;
    }
    
    if (body.customer) {
        if (body.customer.name) updates.customer_name = body.customer.name;
        if (body.customer.email) updates.customer_email = body.customer.email;
        if (body.customer.phone) updates.customer_phone = body.customer.phone;
    }

    const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    
    if (error) throw error;
    
    const updatedOrder: Order = {
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
    
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
