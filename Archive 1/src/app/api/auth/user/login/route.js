import { NextResponse } from 'next/server';
import CustomerUser from '@/lib/CustomerUser';
import dbConnect from '@/lib/dbConnect';
import { cookies } from 'next/headers';
import { createCustomerToken } from '@/lib/customerAuth';

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

    // Create customer token
    const token = await createCustomerToken(user);

    // Set both cookies to ensure compatibility
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 // 24 hours
    };

    cookies().set('token', token, cookieOptions);
    cookies().set('customer_token', token, cookieOptions);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        type: 'customer'
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