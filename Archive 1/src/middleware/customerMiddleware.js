import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function customerMiddleware(req) {
  const path = req.nextUrl.pathname;
  
  // Skip middleware for login page and API routes
  if (path === '/customer/login' || path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Protect customer dashboard routes
  if (path.startsWith('/customer-dashboard')) {
    try {
      const token = req.cookies.get('customer_token')?.value;
      
      if (!token) {
        return NextResponse.redirect(new URL('/customer/login', req.url));
      }

      const payload = await verifyToken(token);
      if (!payload || payload.type !== 'customer') {
        const response = NextResponse.redirect(new URL('/customer/login', req.url));
        response.cookies.delete('customer_token');
        return response;
      }

      return NextResponse.next();
    } catch (err) {
      const response = NextResponse.redirect(new URL('/customer/login', req.url));
      response.cookies.delete('customer_token');
      return response;
    }
  }

  return NextResponse.next();
} 