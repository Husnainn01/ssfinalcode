import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import AdminUser from '@/models/AdminUser';
import { connectDB } from '@/lib/mongodb';

const SECRET_KEY = new TextEncoder().encode('chendanvasu');

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');

    console.log('Admin auth check - Token:', token?.value ? 'Present' : 'Missing');

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        message: 'No admin token found'
      }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token.value, SECRET_KEY);
      
      if (payload.role !== 'admin') {
        return NextResponse.json({
          authenticated: false,
          message: 'Not an admin user'
        }, { status: 401 });
      }

      await connectDB();
      const user = await AdminUser.findById(payload.userId).select('-password');

      if (!user) {
        return NextResponse.json({
          authenticated: false,
          message: 'Admin user not found'
        }, { status: 401 });
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });

    } catch (verifyError) {
      console.error('Admin token verification error:', verifyError);
      return NextResponse.json({
        authenticated: false,
        message: 'Invalid admin token'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('Admin auth check error:', error);
    return NextResponse.json({
      authenticated: false,
      message: 'Admin authentication check failed'
    }, { status: 500 });
  }
}
