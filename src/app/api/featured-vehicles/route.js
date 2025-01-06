import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vehicle from '@/models/Vehicle'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    await dbConnect()
    
    // Fetch vehicles for each section
    const bestSellers = await Vehicle
      .find({ 
        section: 'popular',
        status: 'available'
      })
      .select('make model year price slug')
      .limit(3)
      .lean()

    const bestValue = await Vehicle
      .find({ 
        section: 'bestValue',
        status: 'available'
      })
      .select('make model year price slug')
      .limit(3)
      .lean()

    const premium = await Vehicle
      .find({ 
        section: 'premium',
        status: 'available'
      })
      .select('make model year price slug')
      .limit(3)
      .lean()

    const performance = await Vehicle
      .find({ 
        section: 'performance',
        status: 'available'
      })
      .select('make model year price slug')
      .limit(3)
      .lean()

    // Transform the data to match the component's expected format
    const transformData = (cars) => cars.map(car => ({
      name: `${car.make} ${car.model} ${car.year}`,
      count: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(car.price),
      trend: 'New',
      slug: car.slug
    }))

    return NextResponse.json({
      bestSellers: transformData(bestSellers),
      bestValue: transformData(bestValue),
      premium: transformData(premium),
      performance: transformData(performance)
    })
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    )
  }
} 