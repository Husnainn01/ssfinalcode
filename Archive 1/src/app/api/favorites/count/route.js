import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { NextResponse } from "next/server"
import dbConnect from '@/lib/dbConnect'
import Favorite from '@/models/Favorite'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')
    
    if (!token) {
      return NextResponse.json({ count: 0 }, { status: 401 })
    }

    const payload = await verifyToken(token.value)
    
    if (!payload) {
      return NextResponse.json({ count: 0 }, { status: 401 })
    }

    await dbConnect()
    const count = await Favorite.countDocuments({ userId: payload.id })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("GET /api/favorites/count error:", error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
} 