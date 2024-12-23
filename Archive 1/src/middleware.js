import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { customerMiddleware } from './middleware/customerMiddleware';

const SECRET_KEY = new TextEncoder().encode('chendanvasu');
const VALID_ROLES = ['admin', 'editor', 'moderator', 'viewer'];

export async function middleware(req) {
  const path = req.nextUrl.pathname;

  // Route customer-related paths to customerMiddleware
  if (path.startsWith('/customer-dashboard') || path.startsWith('/auth/')) {
    return customerMiddleware(req);
  }

  // Handle admin routes only
  if (path.startsWith('/admin')) {
    // Skip middleware for admin login
    if (path === '/admin/login') {
      return NextResponse.next();
    }

    try {
      const adminToken = req.cookies.get('admin_token')?.value;
      
      if (!adminToken) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }

      const { payload } = await jwtVerify(adminToken, SECRET_KEY);
      
      // Check if user has any admin role
      if (!payload || !VALID_ROLES.includes(payload.role)) {
        const response = NextResponse.redirect(new URL('/admin/login', req.url));
        response.cookies.delete('admin_token');
        return response;
      }

      return NextResponse.next();
    } catch (err) {
      console.error('Admin auth error:', err);
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  return NextResponse.next();
}

// Update matcher to handle both admin and customer routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/customer-dashboard/:path*',
    '/auth/:path*'
  ]
};