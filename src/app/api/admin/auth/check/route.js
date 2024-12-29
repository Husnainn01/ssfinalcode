import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode('chendanvasu');

const VALID_ROLES = ['admin', 'editor', 'moderator', 'viewer'];

export async function GET(request) {
  try {
    console.log('Starting auth check...');
    const adminToken = request.cookies.get('admin_token')?.value;
    console.log('Token present:', !!adminToken);

    if (!adminToken) {
      console.log('No token found');
      return NextResponse.json(
        { success: false, message: 'No token found' },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(adminToken, SECRET_KEY);
    console.log('Decoded payload:', {
      email: payload.email,
      role: payload.role
    });

    // Verify the role
    if (!VALID_ROLES.includes(payload.role)) {
      console.log('Invalid role:', payload.role);
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 403 }
      );
    }

    console.log('Auth check successful');
    return NextResponse.json({
      success: true,
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        name: payload.name
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid token' },
      { status: 401 }
    );
  }
}
