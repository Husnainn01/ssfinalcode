import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'chendanvasu');

export async function GET(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const verified = await jwtVerify(token, SECRET_KEY);
    await dbConnect();
    
    const user = await User.findOne(
      { email: process.env.ADMIN_ID },
      { password: 0 }
    ).lean();
    
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
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();
    
    const updateResult = await User.findOneAndUpdate(
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
      { 
        new: true,
        upsert: true,
        projection: { password: 0 }
      }
    ).lean();

    if (!updateResult) {
      return NextResponse.json({ 
        error: 'Update failed - User not found',
        success: false 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: updateResult,
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
