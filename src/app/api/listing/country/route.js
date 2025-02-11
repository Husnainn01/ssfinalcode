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
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('countries');
    
    const data = await request.json();
    const result = await collection.insertOne({ name: data.name });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create country' },
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