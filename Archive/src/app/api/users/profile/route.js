import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/User';
import mongoose from 'mongoose';

const SECRET_KEY = new TextEncoder().encode('chendanvasu');

export async function GET(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const verified = await jwtVerify(token, SECRET_KEY);
    await dbConnect();
    
    const userCollection = mongoose.connection.collection('users');
    const user = await userCollection.findOne(
      { email: process.env.ADMIN_ID },
      { projection: { password: 0 } }
    );
    
    return NextResponse.json(user || {
      email: process.env.ADMIN_ID,
      name: 'Admin',
      lastName: '',
      phoneNumber: '',
      address: '',
      postCode: '',
      avatar: '/default-avatar.png',
      role: 'admin'
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export async function PUT(request) {
  console.log("PUT request received");
  try {
    const token = request.cookies.get('auth_token')?.value;
    console.log("Token:", token ? "Present" : "Missing");
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();
    console.log('Received data in API:', data);
    
    // Try direct collection access first
    const userCollection = mongoose.connection.collection('users');
    const updateResult = await userCollection.updateOne(
      { email: process.env.ADMIN_ID },
      { 
        $set: { 
          name: data.name,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          address: data.address,
          postCode: data.postCode,
          avatar: data.avatar || '/default-avatar.png',
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('MongoDB Update result:', updateResult);

    if (updateResult.matchedCount === 0 && !updateResult.upsertedCount) {
      return NextResponse.json({ 
        error: 'Update failed - User not found',
        success: false 
      }, { status: 404 });
    }

    // Fetch the updated document
    const updatedUser = await userCollection.findOne(
      { email: process.env.ADMIN_ID },
      { projection: { password: 0 } }
    );

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: updatedUser,
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update profile',
      success: false
    }, { status: 500 });
  }
}
