import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ShippingSchedule from '@/models/ShippingSchedule';

// GET single shipping schedule
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const schedule = await ShippingSchedule.findById(params.id);
    
    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

// PUT update shipping schedule
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const data = await request.json();
    
    const schedule = await ShippingSchedule.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

// DELETE shipping schedule
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const schedule = await ShippingSchedule.findByIdAndDelete(params.id);
    
    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Schedule deleted successfully',
      success: true 
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
} 