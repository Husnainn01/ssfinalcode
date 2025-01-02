import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    const { type } = params;
    console.log('Fetching cars for type:', type);

    await dbConnect();
    console.log('Database connected successfully');

    // Create a case-insensitive regex for the type search
    const typeRegex = new RegExp(`^${type}$`, 'i');

    console.log('Query parameters:', {
      bodyType: typeRegex,
      visibility: "Active"
    });

    const cars = await mongoose.connection.db
      .collection('CarListing')
      .find({ 
        bodyType: typeRegex,
        visibility: "Active",
        status: "active"
      })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('Cars found:', cars?.length);

    if (!cars || cars.length === 0) {
      console.log('No cars found for type:', type);
      return NextResponse.json(
        { message: 'No cars found for this type' },
        { status: 404 }
      );
    }

    return NextResponse.json(cars);
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return NextResponse.json(
      { error: 'Failed to fetch cars', details: error.message },
      { status: 500 }
    );
  }
} 