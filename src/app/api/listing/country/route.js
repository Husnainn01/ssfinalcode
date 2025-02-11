import { clientPromise } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('countries');
    
    const countries = await collection.find({}).toArray();
    
    return NextResponse.json(countries);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log('1. Starting POST request');
    
    const data = await request.json();
    console.log('2. Received data:', data);

    if (!data.name) {
      console.log('3. Validation failed: Missing country name');
      return NextResponse.json(
        { error: 'Country name is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('carwebsite');
    const collection = db.collection('countries');

    // Generate a simple code from the country name
    const code = data.name.substring(0, 3).toUpperCase();
    
    const result = await collection.insertOne({
      name: data.name.trim(),
      code: code, // Add the code field
      createdAt: new Date()
    });
    
    console.log('Insert result:', result);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('ERROR DETAILS:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Country already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create country', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('countries');
    
    const { id, updateData } = await request.json();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: updateData.name } }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update country' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('countries');
    
    const { id } = await request.json();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete country' },
      { status: 500 }
    );
  }
} 