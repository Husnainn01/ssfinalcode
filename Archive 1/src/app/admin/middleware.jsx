import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode('chendanvasu');

export async function middleware(request) {
  const authToken = request.cookies.get('auth_token')?.value;
  console.log("Auth Token:", authToken);

  const url = request.nextUrl.clone();

  if (authToken) {
    try {
      const { payload } = await jwtVerify(authToken, SECRET_KEY);
      console.log("Decoded Token:", payload);

      // If the user is trying to access the login page while authenticated, redirect to admin dashboard
      if (url.pathname === '/admin/login') {
        url.pathname = '/admin/dashboard';
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
      
    } catch (err) {
      console.error("Token verification failed:", err);
      
      // If token is invalid, redirect to login page
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  } else {
    console.log("No auth token found");

    // If no token and trying to access admin routes (except login), redirect to login
    if (!url.pathname.includes('/admin/login') && url.pathname.startsWith('/admin')) {
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    // Allow access to the login page if no auth token is present
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/admin/:path*']
};
