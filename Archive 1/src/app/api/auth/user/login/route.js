import { NextResponse } from 'next/server';
import CustomerUser from '@/lib/CustomerUser';
import dbConnect from '@/lib/dbConnect';
import { cookies } from 'next/headers';
import { createToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    await dbConnect();
    
    const { email, password } = await req.json();
    console.log('Customer login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await CustomerUser.findOne({ email }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create token with customer type
    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      type: 'customer' // Add type to distinguish from admin
    });

    // Set customer-specific cookie
    cookies().set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Customer login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
} 