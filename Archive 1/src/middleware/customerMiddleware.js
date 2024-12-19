import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export async function customerMiddleware(req) {
  const path = req.nextUrl.pathname;
  
  // Skip middleware for auth routes and API routes
  if (
    path === '/auth/login' || 
    path === '/auth/register' ||
    path.startsWith('/api/auth/') ||
    path.startsWith('/api/favorites/')
  ) {
    return NextResponse.next();
  }

  // Protect customer dashboard routes
  if (path.startsWith('/customer-dashboard')) {
    try {
      const token = req.cookies.get('token')?.value;
      
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }

      const { payload } = await jwtVerify(token, SECRET_KEY);
      if (!payload || payload.type !== 'customer') {
        const response = NextResponse.redirect(new URL('/auth/login', req.url));
        response.cookies.delete('token');
        return response;
      }

      return NextResponse.next();
    } catch (err) {
      console.error('Customer auth error:', err);
      const response = NextResponse.redirect(new URL('/auth/login', req.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
} 