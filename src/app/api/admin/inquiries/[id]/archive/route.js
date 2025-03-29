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
    
    let adminId = null;
    
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
      } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json({ error: 'Invalid token: ' + error.message }, { status: 401 });
      }
    } else {
      console.log("Auth bypass enabled for development");
      adminId = "admin_dev";
    }
    
    const data = await request.json();
    
    // For development/testing, return success response
    if (isDev && !mongoose.connection.db) {
      return NextResponse.json({ 
        success: true, 
        message: 'Inquiry archived successfully (dev mode)' 
      });
    }
    
    // Get the inquiry first to make a copy
    const inquiry = await mongoose.connection.db
      .collection('customerInquiries')
      .findOne({ _id: new mongoose.Types.ObjectId(params.id) });
    
    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    
    // Create archive record
    const archiveData = {
      ...inquiry,
      originalId: inquiry._id.toString(),
      archivedAt: new Date(),
      archivedBy: adminId,
      archiveReason: data.reason || null,
      _id: new mongoose.Types.ObjectId() // Generate new ID for archive
    };
    
    // Insert into archives collection
    await mongoose.connection.db
      .collection('archivedInquiries')
      .insertOne(archiveData);
    
    // Update original inquiry to mark as archived
    await mongoose.connection.db
      .collection('customerInquiries')
      .updateOne(
        { _id: new mongoose.Types.ObjectId(params.id) },
        { 
          $set: { 
            status: 'closed',
            isArchived: true,
            archivedAt: new Date(),
            archivedBy: adminId,
            archiveReason: data.reason || null,
            updatedAt: new Date()
          }
        }
      );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Inquiry archived successfully' 
    });
  } catch (error) {
    console.error('Error archiving inquiry:', error);
    return NextResponse.json({ error: 'Failed to archive inquiry: ' + error.message }, { status: 500 });
  }
} 