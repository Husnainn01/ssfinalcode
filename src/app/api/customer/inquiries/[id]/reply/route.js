import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Get the secret key
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'chendanvasu');

export async function POST(request, { params }) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Get the token
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token found' }, { status: 401 });
    }
    
    // Verify the token
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
        message: data.message,
        isAdmin: false,
        createdAt: new Date(),
        readByAdmin: false
      };
      
      // Add the reply to the replies array and update status
      await mongoose.connection.db
        .collection('customerInquiries')
        .updateOne(
          { _id: new mongoose.Types.ObjectId(params.id) },
          { 
            $push: { replies: reply },
            $set: { 
              updatedAt: new Date(),
              status: 'pending' // Set status back to pending when customer replies
            }
          }
        );
      
      // Create a notification for admins
      try {
        // Get all admin users
        const adminUsers = await mongoose.connection.db
          .collection('users')
          .find({ role: { $in: ['admin', 'super_admin'] } })
          .toArray();
        
        // Create notifications for each admin
        for (const admin of adminUsers) {
          const notification = {
            userId: admin._id,
            title: "New Customer Reply",
            message: `Customer ${payload.name || 'Customer'} has replied to inquiry: "${inquiry.subject}"`,
            type: "inquiry",
            inquiryId: inquiry._id.toString(),
            createdAt: new Date(),
            isRead: false,
            details: [
              { label: "Customer", value: payload.name || 'Customer' },
              { label: "Subject", value: inquiry.subject },
              { label: "Date", value: new Date().toLocaleString() }
            ]
          };
          
          await mongoose.connection.db
            .collection('adminNotifications')
            .insertOne(notification);
        }
      } catch (error) {
        console.error("Error creating admin notifications:", error);
      }
      
      return NextResponse.json({ 
        success: true, 
        replyId: reply._id,
        message: 'Reply submitted successfully' 
      });
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Invalid token: ' + error.message }, { status: 401 });
    }
  } catch (error) {
    console.error('Error submitting reply:', error);
    return NextResponse.json({ error: 'Failed to submit reply: ' + error.message }, { status: 500 });
  }
} 