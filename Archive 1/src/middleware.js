import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  
  // Skip middleware for API routes
  if (path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Handle admin routes
  if (path.startsWith('/admin')) {
    // Skip middleware for admin login page
    if (path === '/admin/login') {
      return NextResponse.next();
    }

    try {
      const token = req.cookies.get('auth_token')?.value;
      
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }

      const payload = await verifyToken(token);
      if (!payload || payload.type !== 'admin') {
        const response = NextResponse.redirect(new URL('/admin/login', req.url));
        response.cookies.delete('auth_token');
        return response;
      }

      return NextResponse.next();
    } catch (err) {
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // Handle customer dashboard routes
  if (path.startsWith('/customer-dashboard')) {
    // Skip middleware for customer login page
    if (path === '/auth/login') {
      return NextResponse.next();
    }

    try {
      const token = req.cookies.get('customer_token')?.value;
      
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }

      const payload = await verifyToken(token);
      if (!payload || payload.type !== 'customer') {
        const response = NextResponse.redirect(new URL('/auth/login', req.url));
        response.cookies.delete('customer_token');
        return response;
      }

      return NextResponse.next();
    } catch (err) {
      const response = NextResponse.redirect(new URL('/auth/login', req.url));
      response.cookies.delete('customer_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/customer-dashboard/:path*',
    '/auth/login'
  ]
};