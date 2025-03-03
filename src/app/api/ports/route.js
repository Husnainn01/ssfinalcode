import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Port from '@/models/Port';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const country = searchParams.get('country');

    let query = {};
    if (region) query.region = region;
    if (country) query.country = country;

    const ports = await Port.find(query).sort({ country: 1, name: 1 });
    return NextResponse.json(ports);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ports' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    const port = await Port.create(data);
    return NextResponse.json(port, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to create port' },
      { status: 500 }
    );
  }
} 