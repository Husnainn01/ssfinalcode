import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Get the secret key
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'chendanvasu');

export async function PUT(request, { params }) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Check for development mode
    const isDev = process.env.NODE_ENV === 'development';
    const { searchParams } = new URL(request.url);
    const bypassAuth = searchParams.get('bypass') === 'true' && isDev;
    
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
      } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json({ error: 'Invalid token: ' + error.message }, { status: 401 });
      }
    } else {
      console.log("Auth bypass enabled for development");
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.status || !['pending', 'answered', 'closed'].includes(data.status)) {
      return NextResponse.json({ error: 'Valid status is required (pending, answered, closed)' }, { status: 400 });
    }
    
    // For development/testing, return success response
    if (isDev && !mongoose.connection.db) {
      return NextResponse.json({ 
        success: true, 
        message: 'Status updated successfully (dev mode)' 
      });
    }
    
    // Update the inquiry status
    const result = await mongoose.connection.db
      .collection('customerInquiries')
      .updateOne(
        { _id: new mongoose.Types.ObjectId(params.id) },
        { 
          $set: { 
            status: data.status,
            updatedAt: new Date()
          }
        }
      );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Failed to update status: ' + error.message }, { status: 500 });
  }
} 