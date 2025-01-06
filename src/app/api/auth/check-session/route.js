import { verifyAuth } from "@/lib/auth"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const authResult = await verifyAuth(req)
    console.log('Check Session API - Current auth:', authResult)
    
    return NextResponse.json({
      authenticated: authResult.success,
      user: authResult.user,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({
      error: 'Session check failed',
      details: error.message,
      authenticated: false,
      user: null
    }, { status: 500 })
  }
} 