import { NextResponse } from 'next/server';
import CustomerUser from '@/lib/CustomerUser';
import dbConnect from '@/lib/dbConnect';
import { cookies } from 'next/headers';
import { createToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    await dbConnect();
    
    const { email, password } = await req.json();
    console.log('Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await CustomerUser.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log('Password validation:', isPasswordValid ? 'Success' : 'Failed');
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create token
    const token = await createToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Set cookie
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    console.log('Login successful for:', email);
    
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
} 