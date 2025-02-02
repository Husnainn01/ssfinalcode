import dbConnect from '@/lib/dbConnect'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
    try {
        // Add CORS headers helper at the top
        const corsHeaders = {
            'Access-Control-Allow-Origin': 'https://www.globaldrivemotors.com',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        };

        // 1. Rate limiting
        const limiter = rateLimit({
            interval: 60 * 1000, // 60 seconds
            uniqueTokenPerInterval: 500 // Max 500 users per interval
        })
        
        try {
            await limiter.check(request, 10, 'SEARCH_CACHE') // 10 requests per minute
        } catch {
            return new Response('Too many requests', { status: 429 })
        }

        // 2. Input validation and sanitization
        const { searchParams } = new URL(request.url)
        const rawQuery = searchParams.get('q')
        const type = searchParams.get('type')

        // Validate search type
        if (type && !['keyword', 'stockNumber'].includes(type)) {
            return Response.json({ error: 'Invalid search type' }, { status: 400 })
        }

        // Validate and sanitize search query
        if (!rawQuery || typeof rawQuery !== 'string') {
            return Response.json({ error: 'Invalid search query' }, { status: 400 })
        }

        // Remove any dangerous characters and limit length
        const query = rawQuery
            .slice(0, 100) // Limit length
            .replace(/[<>{}]/g, '') // Remove potentially dangerous characters
            .trim()

        if (query.length < 2) {
            return Response.json({ error: 'Search query too short' }, { status: 400 })
        }

        // 3. Database connection with timeout
        const db = await Promise.race([
            dbConnect(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database connection timeout')), 5000)
            )
        ])

        const collection = db.connection.db.collection('CarListing')

        // 4. Secure query construction
        let dbQuery = {}
        const searchRegex = new RegExp('^' + query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')

        if (type === 'stockNumber') {
            dbQuery = { 
                stockNumber: searchRegex,
                visibility: 'Active' // Only show active listings
            }
        } else {
            dbQuery = {
                $and: [
                    {
                        $or: [
                            { make: searchRegex },
                            { model: searchRegex },
                            { stockNumber: searchRegex },
                            { bodyType: searchRegex }
                        ]
                    },
                    { visibility: 'Active' } // Only show active listings
                ]
            }
        }

        // 5. Add execution timeout and limit results
        const cars = await collection
            .find(dbQuery)
            .project({
                _id: 1,
                make: 1,
                model: 1,
                year: 1,
                price: 1,
                mileage: 1,
                image: 1,
                images: 1,
                stockNumber: 1,
                engineSize: 1,
                vehicleTransmission: 1,
                location: 1,
                modelCode: 1,
                steering: 1,
                fuelType: 1,
                seats: 1,
                engineCode: 1,
                color: 1,
                driveType: 1,
                doors: 1,
                carFeature: 1,
                visibility: 1,
                date: 1,
                bodyType: 1
            })
            .limit(20)
            .maxTimeMS(5000) // 5 second timeout
            .toArray()

        // 6. Sanitize response data
        const sanitizedCars = cars.map(car => ({
            ...car,
            description: car.description ? car.description.slice(0, 500) : '', // Limit description length
        }))

        return Response.json({ 
            cars: sanitizedCars,
            count: sanitizedCars.length,
            query: query,
            type: type
        }, { 
            headers: corsHeaders 
        });

    } catch (error) {
        console.error('Search error:', error.message);
        return Response.json({ 
            error: 'Search failed'
        }, { 
            status: 500,
            headers: corsHeaders 
        });
    }
} 