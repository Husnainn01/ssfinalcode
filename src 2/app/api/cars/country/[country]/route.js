import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    const { country } = params;
    
    // Standardize the incoming country name
    const standardizedCountry = country.charAt(0).toUpperCase() + 
                              country.slice(1).toLowerCase();
    
    console.log('Fetching cars for country:', standardizedCountry);

    await dbConnect();

    const cars = await mongoose.connection.db
      .collection('CarListing')
      .find({ 
        country: standardizedCountry, // Use exact match instead of regex
        visibility: "Active",
        status: "active"
      })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('Cars found:', cars?.length);

    if (!cars || cars.length === 0) {
      console.log('No cars found for country:', standardizedCountry);
      return NextResponse.json([], { status: 200 }); // Return empty array instead of 404
    }

    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars', details: error.message },
      { status: 500 }
    );
  }
} 