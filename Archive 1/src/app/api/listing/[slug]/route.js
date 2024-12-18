import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: "Car ID is required" 
      }, { status: 400 });
    }

    let car;
    if (mongoose.Types.ObjectId.isValid(id)) {
      car = await mongoose.connection.db
        .collection('CarListing')
        .findOne({ _id: new mongoose.Types.ObjectId(id) });
    }
    
    if (!car) {
      return NextResponse.json({ 
        success: false,
        error: "Car not found" 
      }, { status: 404 });
    }

    // Convert _id to string
    car._id = car._id.toString();

    return NextResponse.json({
      success: true,
      data: car
    });
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json({ 
      success: false,
      error: "Internal Server Error" 
    }, { status: 500 });
  }
}

export default function CarDetailsPage({ params }) {
    console.log('Car details page params:', params);
    // ... rest of your component
}