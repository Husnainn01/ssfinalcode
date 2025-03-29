import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose'; // Update to use jose like your auth system

// Get the secret key in the same way as your auth system
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'chendanvasu');

export async function GET(request, { params }) {
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
      
      // Get the inquiry by ID
      const inquiry = await mongoose.connection.db
        .collection('customerInquiries')
        .findOne({
          _id: new mongoose.Types.ObjectId(params.id),
          userId: new mongoose.Types.ObjectId(userId)
        });
      
      if (!inquiry) {
        return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
      }
      
      return NextResponse.json({ inquiry });
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiry' }, { status: 500 });
  }
}

// Add a reply endpoint
export async function POST(request, { params }) {
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
      if (!data.message) {
        return NextResponse.json({ error: 'Message is required' }, { status: 400 });
      }
      
      // Get the inquiry
      const inquiry = await mongoose.connection.db
        .collection('customerInquiries')
        .findOne({
          _id: new mongoose.Types.ObjectId(params.id),
          userId: new mongoose.Types.ObjectId(userId)
        });
      
      if (!inquiry) {
        return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
      }
      
      // Don't allow replies to closed inquiries
      if (inquiry.status === 'closed') {
        return NextResponse.json({ error: 'Cannot reply to closed inquiries' }, { status: 400 });
      }
      
      // Create the reply
      const reply = {
        _id: new mongoose.Types.ObjectId(),
        inquiryId: new mongoose.Types.ObjectId(params.id),
        message: data.message,
        isAdmin: false,
        createdAt: new Date()
      };
      
      // Add the reply to the replies array
      await mongoose.connection.db
        .collection('customerInquiries')
        .updateOne(
          { _id: new mongoose.Types.ObjectId(params.id) },
          { 
            $push: { replies: reply },
            $set: { updatedAt: new Date() }
          }
        );
      
      return NextResponse.json({ 
        success: true, 
        replyId: reply._id,
        message: 'Reply submitted successfully' 
      });
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error submitting reply:', error);
    return NextResponse.json({ error: 'Failed to submit reply' }, { status: 500 });
  }
} 