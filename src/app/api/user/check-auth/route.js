import { verifyAuth } from "@/lib/auth"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const authResult = await verifyAuth(req)
    
    return NextResponse.json({
      isAuthenticated: authResult.success,
      user: authResult.success ? authResult.user : null
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({
      isAuthenticated: false,
      user: null
    }, { status: 500 })
  }
} 