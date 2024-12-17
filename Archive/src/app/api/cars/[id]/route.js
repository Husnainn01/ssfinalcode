import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    console.log('API Route - Received params:', params); // Debug log
    
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Car ID is required" }, { status: 400 });
    }

    let car;
    if (mongoose.Types.ObjectId.isValid(id)) {
      car = await mongoose.connection.db
        .collection('CarListing')
        .findOne({ _id: new mongoose.Types.ObjectId(id) });
    }
    
    if (!car) {
      console.log('Car not found for ID:', id); // Debug log
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    // Convert _id to string
    car._id = car._id.toString();

    console.log('Found car:', car); // Debug log
    return NextResponse.json(car);
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error.message 
    }, { status: 500 });
  }
} 