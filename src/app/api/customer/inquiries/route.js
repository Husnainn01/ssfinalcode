import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose'; // Update to use jose like your auth system

// Get the secret key in the same way as your auth system
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'chendanvasu');

export async function GET(request) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Get the token using the correct cookie name
    const cookieStore = cookies();
    const token = cookieStore.get('token'); // This matches your auth system
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token found' }, { status: 401 });
    }
    
    // Verify the token using jose like your auth system
    try {
      const { payload } = await jwtVerify(token.value, secretKey);
      
      // Verify this is a customer token
      if (payload.type !== 'customer') {
        return NextResponse.json({ error: 'Invalid token type' }, { status: 401 });
      }
      
      // Get the user ID from the payload
      const userId = payload.userId;
      
      // Get all inquiries for the current user
      const inquiries = await mongoose.connection.db
        .collection('customerInquiries')
        .find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .toArray();
      
      return NextResponse.json({ inquiries });
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Get the token using the correct cookie name
    const cookieStore = cookies();
    const token = cookieStore.get('token'); // This matches your auth system
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token found' }, { status: 401 });
    }
    
    // Verify the token using jose like your auth system
    try {
      const { payload } = await jwtVerify(token.value, secretKey);
      
      // Verify this is a customer token
      if (payload.type !== 'customer') {
        return NextResponse.json({ error: 'Invalid token type' }, { status: 401 });
      }
      
      // Get the user ID from the payload
      const userId = payload.userId;
      
      const data = await request.json();
      
      // Validate required fields
      if (!data.subject || !data.message) {
        return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
      }
      
      // Create the inquiry
      const inquiry = {
        userId: new mongoose.Types.ObjectId(userId),
        subject: data.subject,
        category: data.category || 'general',
        message: data.message,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        // Optional fields
        ...(data.referenceId && { referenceId: data.referenceId }),
        ...(data.carDetails && { carDetails: data.carDetails }),
      };
      
      const result = await mongoose.connection.db
        .collection('customerInquiries')
        .insertOne(inquiry);
      
      return NextResponse.json({ 
        success: true, 
        inquiryId: result.insertedId,
        message: 'Inquiry submitted successfully' 
      });
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 });
  }
} 