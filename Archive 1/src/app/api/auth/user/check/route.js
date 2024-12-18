import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import CustomerUser from '@/lib/CustomerUser';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    console.log('Check route - Token:', token);

    if (!token) {
      console.log('No token found');
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    const decoded = await verifyToken(token.value);
    console.log('Decoded token:', decoded);
    
    if (!decoded || decoded.type !== 'customer') {
      console.log('Invalid token or not a customer');
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    await dbConnect();
    const user = await CustomerUser.findById(decoded.userId).select('-password');
    console.log('Found user:', user);

    if (!user) {
      console.log('No user found');
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    return NextResponse.json({ 
      isAuthenticated: true, 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        type: 'customer'
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { isAuthenticated: false, error: error.message },
      { status: 401 }
    );
  }
} 