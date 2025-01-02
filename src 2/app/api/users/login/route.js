// Import necessary modules
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import AdminUser from '@/models/AdminUser';

const SECRET_KEY = new TextEncoder().encode('chendanvasu');

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    console.log('=== Start Login Process ===');
    console.log('Login attempt for email:', email);
    console.log('Request headers:', request.headers);
    
    await dbConnect();

    const user = await AdminUser.findOne({ email });
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found in database');
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid ? 'Yes' : 'No');

    if (!isPasswordValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create token
    const token = await new SignJWT({
      email: user.email,
      role: user.role,
      userId: user._id.toString(),
      name: user.name
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .setIssuedAt()
      .sign(SECRET_KEY);

    console.log('Token created successfully');

    // Create response with specific headers
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Login successful!',
        token, // Include token in response
        user: {
          email: user.email,
          role: user.role,
          name: user.name
        }
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

    // Set cookie with specific options
    const cookieOptions = {
      path: '/',
      maxAge: 86400,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    };

    response.cookies.set('auth_token', token, cookieOptions);

    console.log('Cookie being set:', {
      name: 'auth_token',
      value: token.slice(0, 20) + '...',
      options: cookieOptions
    });

    console.log('=== End Login Process ===');
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
