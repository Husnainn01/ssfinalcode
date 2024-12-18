import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { NextResponse } from "next/server"
import dbConnect from '@/lib/dbConnect'
import Favorite from '@/models/Favorite'
import mongoose from 'mongoose'

async function getUserFromToken() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')
    
    if (!token) {
      console.log('No token found in cookies');
      return null;
    }

    console.log('Token found:', token.name);
    const payload = await verifyToken(token.value)
    
    if (!payload) {
      console.log('Invalid token');
      return null;
    }
    
    console.log('Token payload:', payload);
    return payload;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

export async function GET() {
  try {
    const user = await getUserFromToken()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const favorites = await Favorite.find({ userId: user.id })
      .lean()
      .exec()

    // Transform the response to include string IDs
    const transformedFavorites = favorites.map(fav => ({
      ...fav,
      carId: fav.carId.toString(),
      id: fav._id.toString()
    }))

    return NextResponse.json(transformedFavorites)
  } catch (error) {
    console.error("GET /api/favorites error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromToken()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { carId } = await req.json()
    
    if (!carId || !mongoose.Types.ObjectId.isValid(carId)) {
      return NextResponse.json({ error: "Valid Car ID is required" }, { status: 400 })
    }

    await dbConnect()
    
    const existingFavorite = await Favorite.findOne({
      userId: user.id,
      carId: new mongoose.Types.ObjectId(carId)
    })

    if (existingFavorite) {
      return NextResponse.json({ 
        error: "Car already in favorites",
        favorite: existingFavorite 
      }, { status: 400 })
    }
    
    const favorite = await Favorite.create({
      userId: user.id,
      carId: new mongoose.Types.ObjectId(carId)
    })

    return NextResponse.json({ 
      success: true, 
      favorite: {
        ...favorite.toObject(),
        carId: favorite.carId.toString(),
        id: favorite._id.toString()
      }
    })
  } catch (error) {
    console.error("POST /api/favorites error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const user = await getUserFromToken()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { carId } = await req.json()
    
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return NextResponse.json({ error: "Invalid Car ID" }, { status: 400 })
    }

    await dbConnect()
    
    await Favorite.findOneAndDelete({
      userId: user.id,
      carId: new mongoose.Types.ObjectId(carId)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/favorites error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 