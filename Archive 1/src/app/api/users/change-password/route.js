import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/User';

const SECRET_KEY = new TextEncoder().encode('chendanvasu');

export async function POST(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();
    
    // Verify current password and update with new password
    const user = await User.findOne({ email: process.env.ADMIN_ID });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to change password',
      success: false 
    }, { status: 500 });
  }
}