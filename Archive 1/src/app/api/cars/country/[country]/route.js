import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    const { country } = params;
    console.log('Fetching cars for country:', country);

    await dbConnect();
    console.log('Database connected successfully');

    // Create a case-insensitive regex for the country search
    const countryRegex = new RegExp(`^${country}$`, 'i');

    console.log('Query parameters:', {
      country: countryRegex,
      visibility: "Active"
    });

    const cars = await mongoose.connection.db
      .collection('CarListing')
      .find({ 
        country: countryRegex, // Use regex instead of lowercase
        visibility: "Active",
        status: "active" // Also check the status field
      })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('Cars found:', cars?.length);

    if (!cars || cars.length === 0) {
      console.log('No cars found for country:', country);
      return NextResponse.json(
        { message: 'No cars found for this country' },
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