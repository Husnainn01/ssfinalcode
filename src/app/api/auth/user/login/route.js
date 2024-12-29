import { NextResponse } from 'next/server';
import CustomerUser from '@/lib/CustomerUser';
import dbConnect from '@/lib/dbConnect';
import { cookies } from 'next/headers';
import { createCustomerToken } from '@/lib/customerAuth';

export async function POST(req) {
  try {
    await dbConnect();
    
    const { email, password } = await req.json();
    // console.log('Login attempt for:', email);

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
    // console.log('Token created:', token ? 'Yes' : 'No'); // Debug log

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
    };

    // Create the response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        type: 'customer'
      }
    });

    // Set cookies on the response
    response.cookies.set('token', token, cookieOptions);
    response.cookies.set('customer_token', token, cookieOptions);

    // console.log('Cookies set:', {
    //   token: token ? 'Present' : 'Missing',
    //   cookieOptions
    // });

    return response;

  } catch (error) {
    // console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
} 