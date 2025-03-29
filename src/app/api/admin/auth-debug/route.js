import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Get the secret key
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'chendanvasu');

export async function GET() {
  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    // Log all cookies for debugging
    console.log("All cookies:", allCookies.map(c => c.name));
    
    // Try different possible token names
    const tokenCookie = cookieStore.get('token') || 
                        cookieStore.get('adminToken') || 
                        cookieStore.get('auth');
    
    if (!tokenCookie) {
      return NextResponse.json({ 
        authenticated: false, 
        error: 'No token found',
        availableCookies: allCookies.map(c => ({
          name: c.name,
          value: c.value.substring(0, 5) + '...' // Show just the beginning for security
        }))
      });
    }
    
    try {
      const { payload } = await jwtVerify(tokenCookie.value, secretKey);
      
      // Check for admin role in multiple possible locations
      const isAdmin = 
        payload.type === 'admin' || 
        payload.role === 'admin' || 
        (payload.user && payload.user.role === 'admin');
      
      return NextResponse.json({ 
        authenticated: true, 
        isAdmin: isAdmin,
        payload: {
          // Don't expose sensitive data
          exp: payload.exp,
          type: payload.type,
          role: payload.role,
          userRole: payload.user?.role,
          userId: payload.userId || payload.user?.id
        },
        tokenCookie: {
          name: tokenCookie.name,
          value: tokenCookie.value.substring(0, 10) + '...'
        }
      });
    } catch (error) {
      return NextResponse.json({ 
        authenticated: false, 
        error: 'Invalid token: ' + error.message,
        tokenValue: tokenCookie.value.substring(0, 10) + '...' // Show part of token for debugging
      });
    }
  } catch (error) {
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Error checking authentication: ' + error.message 
    });
  }
} 