import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    const { make } = params;
    console.log('Fetching cars for make:', make);

    await dbConnect();
    console.log('Database connected successfully');

    // Create a case-insensitive regex for the make search
    const makeRegex = new RegExp(`^${make}$`, 'i');

    console.log('Query parameters:', {
      make: makeRegex,
      visibility: "Active"
    });

    const cars = await mongoose.connection.db
      .collection('CarListing')
      .find({ 
        make: makeRegex,
        visibility: "Active",
        status: "active"
      })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('Cars found:', cars?.length);

    if (!cars || cars.length === 0) {
      console.log('No cars found for make:', make);
      return NextResponse.json(
        { message: 'No cars found for this make' },
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