import dbConnect from '@/lib/dbConnect'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request, { params }) {
    try {
        // Rate limiting
        const limiter = rateLimit({
            interval: 60 * 1000,
            uniqueTokenPerInterval: 500
        })
        
        try {
            await limiter.check(request, 10, 'STOCK_SEARCH_CACHE')
        } catch {
            return new Response('Too many requests', { status: 429 })
        }

        // Input validation
        const stockNumber = params.number
            ?.slice(0, 50) // Limit length
            .replace(/[<>{}]/g, '') // Remove dangerous characters
            .trim()

        if (!stockNumber) {
            return Response.json({ error: 'Invalid stock number' }, { status: 400 })
        }

        // Database connection with timeout
        const db = await Promise.race([
            dbConnect(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database connection timeout')), 5000)
            )
        ])

        const collection = db.connection.db.collection('CarListing')

        // Secure query with timeout
        const car = await collection
            .findOne({ 
                stockNumber,
                visibility: 'Active'
            })
            .maxTimeMS(5000)

        if (!car) {
            return Response.json({ error: 'Car not found' }, { status: 404 })
        }

        // Sanitize response
        const sanitizedCar = {
            ...car,
            description: car.description ? car.description.slice(0, 500) : ''
        }

        return Response.json({ car: sanitizedCar })

    } catch (error) {
        console.error('Stock number search error:', error)
        return Response.json({ error: 'Search failed' }, { status: 500 })
    }
} 