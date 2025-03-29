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
    
    // Check for development mode
    const isDev = process.env.NODE_ENV === 'development';
    const { searchParams } = new URL(request.url);
    const bypassAuth = searchParams.get('bypass') === 'true' && isDev;
    
    let adminId = null;
    let adminName = "Admin";
    
    if (!bypassAuth) {
      // Get the token
      const cookieStore = cookies();
      const token = cookieStore.get('token');
      
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized - No token found' }, { status: 401 });
      }
      
      // Verify the token
      try {
        const { payload } = await jwtVerify(token.value, secretKey);
        
        // Verify this is an admin token
        if (payload.type !== 'admin' && payload.role !== 'admin') {
          return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
        }
        
        adminId = payload.userId;
        adminName = payload.name || "Admin";
      } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json({ error: 'Invalid token: ' + error.message }, { status: 401 });
      }
    } else {
      console.log("Auth bypass enabled for development");
      adminId = "admin_dev";
      adminName = "Admin (Dev)";
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }
    
    // For development/testing, return success response
    if (isDev && !mongoose.connection.db) {
      return NextResponse.json({ 
        success: true, 
        message: 'Inquiry forwarded successfully (dev mode)' 
      });
    }
    
    // Get the inquiry
    const inquiry = await mongoose.connection.db
      .collection('customerInquiries')
      .findOne({ _id: new mongoose.Types.ObjectId(params.id) });
    
    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    
    // Record the forwarding action in the inquiry
    const forwardingRecord = {
      _id: new mongoose.Types.ObjectId(),
      forwardedTo: data.email,
      forwardedBy: adminId,
      forwardedByName: adminName,
      note: data.note || null,
      forwardedAt: new Date()
    };
    
    await mongoose.connection.db
      .collection('customerInquiries')
      .updateOne(
        { _id: new mongoose.Types.ObjectId(params.id) },
        { 
          $push: { forwardingHistory: forwardingRecord },
          $set: { updatedAt: new Date() }
        }
      );
    
    // TODO: Send actual email with inquiry details
    // This would typically use an email service like SendGrid, Mailgun, etc.
    
    return NextResponse.json({ 
      success: true, 
      message: 'Inquiry forwarded successfully' 
    });
  } catch (error) {
    console.error('Error forwarding inquiry:', error);
    return NextResponse.json({ error: 'Failed to forward inquiry: ' + error.message }, { status: 500 });
  }
} 