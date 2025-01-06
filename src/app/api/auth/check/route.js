import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const authResult = await verifyAuth(request);
    
    return NextResponse.json({
      authenticated: authResult.success,
      user: authResult.user || null
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      authenticated: false,
      user: null
    }, { status: 401 });
  }
} 