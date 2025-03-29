import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { customerMiddleware } from './middleware/customerMiddleware';

const SECRET_KEY = new TextEncoder().encode('chendanvasu');
const VALID_ROLES = ['admin', 'editor', 'moderator', 'viewer'];

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  '/api/admin/auth/login',
  '/api/admin/auth/register',
  '/api/admin/auth/forgot-password',
  '/api/admin/auth/reset-password',
  '/api/admin/auth/status',
  '/admin/login'
];

export async function middleware(req) {
  const path = req.nextUrl.pathname;

  // Check if the path is in the public paths list
  if (PUBLIC_PATHS.some(publicPath => path === publicPath)) {
    return NextResponse.next();
  }

  // Route customer-related paths to customerMiddleware
  if (path.startsWith('/customer-dashboard') || path.startsWith('/auth/')) {
    return customerMiddleware(req);
  }

  // Handle admin UI routes
  if (path.startsWith('/admin')) {
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

  // Handle admin API routes
  if (path.startsWith('/api/admin')) {
    try {
      const adminToken = req.cookies.get('admin_token')?.value;
      
      if (!adminToken) {
        return NextResponse.json({
          success: false,
          message: 'Unauthorized - No admin token found'
        }, { status: 401 });
      }

      const { payload } = await jwtVerify(adminToken, SECRET_KEY);
      
      // Check if user has any admin role
      if (!payload || !VALID_ROLES.includes(payload.role)) {
        return NextResponse.json({
          success: false,
          message: 'Unauthorized - Insufficient permissions'
        }, { status: 403 });
      }

      // Add admin info to request headers for use in API routes
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-admin-id', payload.id || payload._id || '');
      requestHeaders.set('x-admin-role', payload.role || '');
      
      // Continue with the modified request
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (err) {
      console.error('Admin API auth error:', err);
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/customer-dashboard/:path*',
    '/auth/:path*'
  ]
};