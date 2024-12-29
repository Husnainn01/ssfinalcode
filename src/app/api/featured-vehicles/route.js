import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'

export async function GET() {
  try {
    const db = await dbConnect()
    
    // Fetch vehicles for each section
    const bestSellers = await db.collection('CarListing')
      .find({ 
        section: 'popular',
        status: 'active',
        visibility: 'Active'
      })
      .limit(3)
      .project({
        title: 1,
        price: 1,
        make: 1,
        model: 1,
        year: 1,
        slug: 1
      })
      .toArray()

    const bestValue = await db.collection('CarListing')
      .find({ 
        section: 'bestValue',
        status: 'active',
        visibility: 'Active'
      })
      .limit(3)
      .project({
        title: 1,
        price: 1,
        make: 1,
        model: 1,
        year: 1,
        slug: 1
      })
      .toArray()

    const premium = await db.collection('CarListing')
      .find({ 
        section: 'premium',
        status: 'active',
        visibility: 'Active'
      })
      .limit(3)
      .project({
        title: 1,
        price: 1,
        make: 1,
        model: 1,
        year: 1,
        slug: 1
      })
      .toArray()

    const performance = await db.collection('CarListing')
      .find({ 
        section: 'performance',
        status: 'active',
        visibility: 'Active'
      })
      .limit(3)
      .project({
        title: 1,
        price: 1,
        make: 1,
        model: 1,
        year: 1,
        slug: 1
      })
      .toArray()

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