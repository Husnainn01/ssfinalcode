import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { hasPermission } from '@/config/permissions';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

export async function adminAuthMiddleware(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET_KEY);
    
    // Add user info to request
    request.admin = payload;
    
    // Check if user has required permissions based on route
    const path = request.nextUrl.pathname;
    if (path.startsWith('/api/admin/users') && !hasPermission(payload.role, 'canManageUsers')) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Invalid token'
    }, { status: 401 });
  }
} 