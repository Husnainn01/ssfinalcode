import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import CustomerUser from '@/lib/CustomerUser';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    const customerToken = cookieStore.get('customer_token');

    // console.log('Available cookies:', cookieStore.getAll());
    // console.log('Check route - Token:', token?.value);
    // console.log('Check route - Customer Token:', customerToken?.value);

    // Try customer_token first, then fall back to token
    const tokenToUse = customerToken || token;

    if (!tokenToUse) {
    //   console.log('No token found');
      return NextResponse.json({ authenticated: false, user: null });
    }

    const decoded = await verifyToken(tokenToUse.value);
    // console.log('Decoded token:', decoded);
    
    if (!decoded || !decoded.userId) {
    //   console.log('Invalid token or missing userId');
      return NextResponse.json({ authenticated: false, user: null });
    }

    await dbConnect();
    const user = await CustomerUser.findById(decoded.userId).select('-password');
    // console.log('Found user:', user);

    if (!user) {
    //   console.log('No user found');
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({ 
      authenticated: true, 
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        type: 'customer'
      }
    });

  } catch (error) {
    // console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false, user: null });
  }
} 