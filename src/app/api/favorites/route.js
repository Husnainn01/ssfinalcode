import { cookies } from 'next/headers'
import { verifyCustomerAuth } from '@/lib/customerAuth'
import { NextResponse } from "next/server"
import dbConnect from '@/lib/dbConnect'
import Favorite from '@/models/Favorite'
import CarListing from '@/models/Car'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // console.log('Starting GET /api/favorites')
    
    const auth = await verifyCustomerAuth()
    // console.log('Auth result:', auth)
    
    // if (!auth.success) {
    //   console.log('Auth failed:', auth)
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // console.log('Connecting to database...')
    await dbConnect()
    
    // console.log('Available models:', Object.keys(mongoose.models))
    
    // console.log('Finding favorites for user:', auth.user.id)
    let favorites
    try {
      favorites = await Favorite.find({ userId: auth.user.id })
        .populate({
          path: 'carId',
          model: CarListing
        })
        .lean()
        .exec()
    } catch (dbError) {
      // console.error('Database query error:', dbError)
      throw new Error(`Database query failed: ${dbError.message}`)
    }

    // console.log('Raw favorites from DB:', JSON.stringify(favorites, null, 2))

    if (!favorites || favorites.length === 0) {
      // console.log('No favorites found')
      return NextResponse.json([])
    }

    // Transform the response to include string IDs and car details
    const transformedFavorites = favorites.map(fav => {
      try {
        if (!fav.carId) {
          // console.log('Warning: Favorite without car details:', fav)
          return null
        }
        
        return {
          ...fav,
          id: fav._id.toString(),
          carId: fav.carId._id.toString(),
          car: {
            ...fav.carId,
            id: fav.carId._id.toString()
          }
        }
      } catch (transformError) {
        console.error('Error transforming favorite:', transformError, fav)
        return null
      }
    }).filter(Boolean)

    // console.log('Successfully transformed favorites:', transformedFavorites)
    return NextResponse.json(transformedFavorites)
  } catch (error) {
    console.error("GET /api/favorites error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message,
      type: error.name
    }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const auth = await verifyCustomerAuth()
    
    if (!auth.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { carId } = await req.json()
    
    if (!carId || !mongoose.Types.ObjectId.isValid(carId)) {
      return NextResponse.json({ error: "Valid Car ID is required" }, { status: 400 })
    }

    await dbConnect()
    
    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      userId: auth.user.id,
      carId: new mongoose.Types.ObjectId(carId)
    }).populate('carId')

    if (existingFavorite) {
      return NextResponse.json({ 
        error: "Car already in favorites",
        favorite: {
          ...existingFavorite.toObject(),
          id: existingFavorite._id.toString(),
          carId: existingFavorite.carId._id.toString(),
          car: {
            ...existingFavorite.carId.toObject(),
            id: existingFavorite.carId._id.toString()
          }
        }
      }, { status: 400 })
    }
    
    const favorite = await Favorite.create({
      userId: auth.user.id,
      carId: new mongoose.Types.ObjectId(carId)
    })

    const populatedFavorite = await favorite.populate('carId')

    return NextResponse.json({ 
      success: true, 
      favorite: {
        ...populatedFavorite.toObject(),
        id: populatedFavorite._id.toString(),
        carId: populatedFavorite.carId._id.toString(),
        car: {
          ...populatedFavorite.carId.toObject(),
          id: populatedFavorite.carId._id.toString()
        }
      }
    })
  } catch (error) {
    console.error("POST /api/favorites error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const auth = await verifyCustomerAuth()
    
    if (!auth.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { carId } = await req.json()
    
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return NextResponse.json({ error: "Invalid Car ID" }, { status: 400 })
    }

    await dbConnect()
    
    await Favorite.findOneAndDelete({
      userId: auth.user.id,
      carId: new mongoose.Types.ObjectId(carId)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/favorites error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 