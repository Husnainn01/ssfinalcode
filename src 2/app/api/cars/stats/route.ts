import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/dbConnect'

export async function GET() {
  try {
    await dbConnect()
    const mainPostCollection = mongoose.connection.collection('CarListing')
    
    // Get total cars
    const totalCars = await mainPostCollection.countDocuments()
    
    // Get today's date at midnight
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Count cars added today
    const carsAddedToday = await mainPostCollection.countDocuments({
      createdAt: { $gte: today }
    })

    return NextResponse.json({
      totalCars,
      carsAddedToday
    })

  } catch (error) {
    console.error('Failed to fetch car stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch car statistics' },
      { status: 500 }
    )
  }
}