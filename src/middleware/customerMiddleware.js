import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function customerMiddleware(req) {
  const path = req.nextUrl.pathname;

  // Skip middleware for non-protected routes and static files
  if (
    path === '/auth/login' || 
    path === '/auth/register' ||
    path.startsWith('/api/auth/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/favicon.ico') ||
    path.includes('.') ||
    path === '/loading' // Add loading route to skip list
  ) {
    return NextResponse.next();
  }

  try {
    const customerToken = req.cookies.get('customer_token')?.value;
    const token = req.cookies.get('token')?.value;
    const activeToken = customerToken || token;

    if (!activeToken && path.startsWith('/customer-dashboard')) {
      // Store the intended URL before redirecting
      const response = NextResponse.redirect(new URL('/auth/login', req.url));
      response.cookies.set('redirect_to', path, { 
        path: '/',
        httpOnly: true,
        maxAge: 300 // 5 minutes
      });
      return response;
    }

    // For API routes
    if (path.startsWith('/api/')) {
      if (!activeToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const payload = await verifyToken(activeToken);
      if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      // Continue with valid token
      return NextResponse.next();
    }

    // For protected dashboard routes
    if (path.startsWith('/customer-dashboard')) {
      if (!activeToken) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }

      const payload = await verifyToken(activeToken);
      if (!payload || payload.type !== 'customer') {
        const response = NextResponse.redirect(new URL('/auth/login', req.url));
        response.cookies.delete('token');
        response.cookies.delete('customer_token');
        return response;
      }

      // Add user info to headers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-type', payload.type);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Allow all other routes
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware error:', error);
    
    // For API routes return JSON error
    if (path.startsWith('/api/')) {
      return NextResponse.json({ 
        error: 'Authentication failed',
        details: error.message 
      }, { status: 401 });
    }
    
    // For other routes redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', req.url));
    response.cookies.delete('token');
    response.cookies.delete('customer_token');
    return response;
  }
} 