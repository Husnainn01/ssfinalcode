import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    const authResult = await verifyAuth();
    
    if (!authResult.success) {
      return NextResponse.json({
        authenticated: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: authResult.user
    }, { status: 200 });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      authenticated: false,
      message: 'Authentication check failed'
    }, { status: 500 });
  }
}
