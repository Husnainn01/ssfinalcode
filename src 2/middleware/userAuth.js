import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const USER_SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY || 'your-user-secret-key');

export async function userMiddleware(request) {
  const token = request.cookies.get('user_token');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/customer-dashboard');

  // Handle authenticated users trying to access auth routes
  if (isAuthRoute && token) {
    try {
      const { payload } = await jwtVerify(token.value, USER_SECRET_KEY);
      if (payload) {
        // If user is authenticated, redirect them away from auth pages
        return NextResponse.redirect(new URL('/customer-dashboard', request.url));
      }
    } catch (error) {
      // If token verification fails, continue to auth pages
      console.error('Token verification failed:', error);
    }
  }

  // Handle protected routes
  if (isProtectedRoute) {
    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token.value, USER_SECRET_KEY);
      
      // Add user info to headers
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.userId);
      response.headers.set('x-user-email', payload.email);
      
      return response;
    } catch (error) {
      console.error('User middleware - Token verification failed:', error);
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/customer-dashboard/:path*',
    '/auth/:path*'
  ]
}; 