import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  
  // Skip middleware for login page and API routes
  if (path === '/admin/login' || path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Only protect /admin and its subroutes
  if (path.startsWith('/admin')) {
    try {
      const token = req.cookies.get('auth_token')?.value;
      console.log('Middleware - Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.log('Middleware - No token found');
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }

      // Simple token verification without role checking
      const payload = await verifyToken(token);
      if (!payload) {
        const response = NextResponse.redirect(new URL('/admin/login', req.url));
        response.cookies.delete('auth_token');
        return response;
      }

      return NextResponse.next();
    } catch (err) {
      console.error('Middleware - Token verification failed:', err);
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/((?!login).*)' // Match all /admin routes except /admin/login
  ]
};