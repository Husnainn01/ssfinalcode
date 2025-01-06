import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    return NextResponse.json({
      isAuthenticated: !!session?.user,
      user: session?.user || null
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({
      isAuthenticated: false,
      user: null
    })
  }
} 