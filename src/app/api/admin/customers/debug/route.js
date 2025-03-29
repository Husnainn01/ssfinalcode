import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    await dbConnect();
    
    // List all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Look for collections that might contain customer data
    const possibleCustomerCollections = collectionNames.filter(name => 
      name.toLowerCase().includes('user') || 
      name.toLowerCase().includes('customer') ||
      name.toLowerCase().includes('account')
    );
    
    // Sample data from each possible collection
    const samples = {};
    for (const collName of possibleCustomerCollections) {
      const sample = await mongoose.connection.db.collection(collName)
        .find({})
        .limit(1)
        .toArray();
      
      if (sample.length > 0) {
        samples[collName] = sample[0];
      } else {
        samples[collName] = "No documents found";
      }
    }
    
    return NextResponse.json({
      success: true,
      allCollections: collectionNames,
      possibleCustomerCollections,
      samples
    });
  } catch (error) {
    console.error('Error debugging collections:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
} 