import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import slugify from 'slugify';

// Helper function to add CORS headers
function corsHeaders(response) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
    return corsHeaders(new NextResponse(null, { status: 200 }));
}

export async function GET(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarListing');
        
        // Get search params from URL
        const { searchParams } = new URL(req.url);
        
        // Remove default filters to see all listings
        const query = {};  // Empty query to get all listings
        
        console.log('Fetching all listings...'); // Debug log
        
        const listings = await mainPostCollection
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();
        
        console.log('All listings in database:', listings.map(l => ({
            id: l._id,
            title: l.title,
            visibility: l.visibility,
            status: l.status
        }))); // Debug log with relevant fields
        
        return corsHeaders(NextResponse.json(listings));
        
    } catch (error) {
        console.error("Error fetching listings:", error);
        return corsHeaders(NextResponse.json({ 
            success: false,
            error: "Failed to fetch listings",
            details: error.message
        }, { status: 500 }));
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarListing');
        const { id } = await req.json();
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return corsHeaders(NextResponse.json({ 
                success: false,
                error: "Invalid ID format" 
            }, { status: 400 }));
        }
        
        const objectId = new mongoose.Types.ObjectId(id);
        const deleteResult = await mainPostCollection.deleteOne({ _id: objectId });
        
        if (deleteResult.deletedCount === 1) {
            return corsHeaders(NextResponse.json({ 
                success: true,
                message: "Listing deleted successfully" 
            }));
        } else {
            return corsHeaders(NextResponse.json({ 
                success: false,
                error: "Listing not found" 
            }, { status: 404 }));
        }
    } catch (error) {
        console.error("Error deleting listing:", error);
        return corsHeaders(NextResponse.json({ 
            success: false,
            error: "Failed to delete listing" 
        }, { status: 500 }));
    }
}

export async function POST(req) {
    try {
        const postData = await req.json();
        
        // Standardize country name (capitalize first letter)
        if (postData.country) {
            postData.country = postData.country.charAt(0).toUpperCase() + 
                             postData.country.slice(1).toLowerCase();
        }

        // Update required fields
        const requiredFields = [
            'title', 
            'make', 
            'model', 
            'year', 
            'price', 
            'stockNumber',
            'images',
            'section'
        ];
        
        const missingFields = requiredFields.filter(field => !postData[field]);
        
        console.log("Missing fields:", missingFields);

        if (missingFields.length > 0) {
            return corsHeaders(NextResponse.json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`,
                receivedData: postData
            }, { status: 400 }));
        }

        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarListing');

        // Generate proper slug using slugify
        const slug = slugify(postData.title, {
            lower: true,
            strict: true
        });

        // Create listing data with validated fields
        const listingData = {
            ...postData,
            images: postData.images || [],
            image: postData.images?.[0] || null,
            stockNumber: postData.stockNumber.trim(),
            year: Number(postData.year),
            price: Number(postData.price),
            section: postData.section,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: postData.status || 'active',
            visibility: postData.visibility || 'Active',
            offerType: postData.offerType || 'In Stock',
            slug,
            country: postData.country
        };

        const result = await mainPostCollection.insertOne(listingData);

        // Handle revalidation
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`;
            const timestamp = Date.now();
            await Promise.all([
                fetch(`${baseUrl}/api/revalidate?path=/cars&t=${timestamp}`),
                fetch(`${baseUrl}/api/revalidate?path=/admin/dashboard/listing&t=${timestamp}`)
            ]);
        } catch (revalidateError) {
            console.error('Revalidation error:', revalidateError);
        }

        return corsHeaders(NextResponse.json({
            success: true,
            message: "Listing created successfully",
            listing: {
                ...listingData,
                _id: result.insertedId.toString()
            }
        }, { status: 201 }));

    } catch (error) {
        console.error("Error creating listing:", error);
        return corsHeaders(NextResponse.json({
            success: false,
            error: "Failed to create listing",
            details: error.message
        }, { status: 500 }));
    }
}
