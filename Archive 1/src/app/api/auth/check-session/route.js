import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log('Check Session API - Current session:', session)
    
    return NextResponse.json({
      authenticated: !!session,
      session: session,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({
      error: 'Session check failed',
      details: error.message
    }, { status: 500 })
  }
} 