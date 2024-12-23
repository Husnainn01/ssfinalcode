import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const SECRET_KEY = new TextEncoder().encode('chendanvasu');

export async function POST(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    console.log('Admin token:', token ? 'Present' : 'Missing');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      console.log('Payload:', payload); // Debug log to see what's in the token

      await dbConnect();
      const data = await request.json();
      
      // Find admin user
      const user = await User.findOne({ email: payload.email });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Verify current password
      const isValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      // Hash new password and update
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return NextResponse.json({ 
        message: 'Password updated successfully',
        success: true 
      });
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to change password',
      success: false 
    }, { status: 500 });
  }
}