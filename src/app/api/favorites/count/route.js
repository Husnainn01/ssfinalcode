import { verifyCustomerAuth } from '@/lib/customerAuth'
import { NextResponse } from "next/server"
import dbConnect from '@/lib/dbConnect'
import Favorite from '@/models/Favorite'

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const auth = await verifyCustomerAuth()
    
    if (!auth.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const count = await Favorite.countDocuments({ userId: auth.user.id })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("GET /api/favorites/count error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 