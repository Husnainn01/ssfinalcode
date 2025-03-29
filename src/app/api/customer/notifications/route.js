import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Get the secret key
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'chendanvasu');

// GET - Fetch notifications for the authenticated customer
export async function GET(request) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    
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
      
      // Build the query
      const query = { 
        userId: new mongoose.Types.ObjectId(userId) 
      };
      
      if (unreadOnly) {
        query.isRead = false;
      }
      
      // Get the notifications
      const notifications = await mongoose.connection.db
        .collection('customerNotifications')
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      
      // Get the unread count
      const unreadCount = await mongoose.connection.db
        .collection('customerNotifications')
        .countDocuments({ 
          userId: new mongoose.Types.ObjectId(userId),
          isRead: false
        });
      
      return NextResponse.json({ 
        success: true, 
        notifications,
        unreadCount
      });
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Invalid token: ' + error.message }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications: ' + error.message }, { status: 500 });
  }
}

// PUT - Mark notification(s) as read
export async function PUT(request) {
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
      
      // Check if we're marking all as read or just one
      if (data.markAll) {
        // Mark all notifications as read
        await mongoose.connection.db
          .collection('customerNotifications')
          .updateMany(
            { userId: new mongoose.Types.ObjectId(userId) },
            { 
              $set: { 
                isRead: true,
                readAt: new Date()
              }
            }
          );
          
        return NextResponse.json({ 
          success: true, 
          message: 'All notifications marked as read' 
        });
      } else if (data.notificationId) {
        // Mark a single notification as read
        await mongoose.connection.db
          .collection('customerNotifications')
          .updateOne(
            { 
              _id: new mongoose.Types.ObjectId(data.notificationId),
              userId: new mongoose.Types.ObjectId(userId)
            },
            { 
              $set: { 
                isRead: true,
                readAt: new Date()
              }
            }
          );
          
        return NextResponse.json({ 
          success: true, 
          message: 'Notification marked as read' 
        });
      } else {
        return NextResponse.json({ error: 'Missing notificationId or markAll parameter' }, { status: 400 });
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Invalid token: ' + error.message }, { status: 401 });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Failed to mark notification as read: ' + error.message }, { status: 500 });
  }
}

// DELETE - Delete a notification
export async function DELETE(request) {
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
      
      if (!data.notificationId) {
        return NextResponse.json({ error: 'Missing notificationId parameter' }, { status: 400 });
      }
      
      // Delete the notification
      await mongoose.connection.db
        .collection('customerNotifications')
        .deleteOne({ 
          _id: new mongoose.Types.ObjectId(data.notificationId),
          userId: new mongoose.Types.ObjectId(userId)
        });
        
      return NextResponse.json({ 
        success: true, 
        message: 'Notification deleted' 
      });
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Invalid token: ' + error.message }, { status: 401 });
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Failed to delete notification: ' + error.message }, { status: 500 });
  }
} 