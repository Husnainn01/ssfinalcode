import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ShippingSchedule from '@/models/ShippingSchedule';

// GET all shipping schedules
export async function GET() {
  try {
    await dbConnect();
    const schedules = await ShippingSchedule.find()
      .sort({ departureDate: 1 });
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching shipping schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping schedules' },
      { status: 500 }
    );
  }
}

// POST new shipping schedule
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    // Validate required fields
    if (!data.voyageNo || !data.company || !data.shipName || 
        !data.japanPorts?.length || !data.destinationPorts?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const schedule = await ShippingSchedule.create(data);
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating shipping schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create shipping schedule' },
      { status: 500 }
    );
  }
} 