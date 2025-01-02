import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    const { category } = params;
    console.log('Fetching cars for other category:', category);

    await dbConnect();
    console.log('Database connected successfully');

    // Create a case-insensitive regex for the category search
    const categoryRegex = new RegExp(`^${category}$`, 'i');

    console.log('Query parameters:', {
      category: categoryRegex,
      visibility: "Active"
    });

    const cars = await mongoose.connection.db
      .collection('CarListing')
      .find({ 
        category: categoryRegex,
        visibility: "Active",
        status: "active"
      })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('Cars found:', cars?.length);

    if (!cars || cars.length === 0) {
      console.log('No cars found for other category:', category);
      return NextResponse.json(
        { message: 'No cars found for this category' },
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