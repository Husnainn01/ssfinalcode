import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function GET(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarListing');
        
        // Get search params from URL
        const { searchParams } = new URL(req.url);
        const filters = Object.fromEntries(searchParams);
        
        // Build query based on filters
        const query = {};
        if (filters.make) query.make = String(filters.make);
        if (filters.model) query.model = String(filters.model);
        if (filters.type) query.type = String(filters.type);
        if (filters.steering) query.steering = String(filters.steering);
        
        const listings = await mainPostCollection
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();
        
        // Return array of listings directly
        return NextResponse.json(listings, {
            headers: {
                'Cache-Control': 'no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
    } catch (error) {
        console.error("Error fetching listings:", error);
        return NextResponse.json({ 
            success: false,
            error: "Failed to fetch listings" 
        }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarListing');
        const { id } = await req.json();
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ 
                success: false,
                error: "Invalid ID format" 
            }, { status: 400 });
        }
        
        const objectId = new mongoose.Types.ObjectId(id);
        const deleteResult = await mainPostCollection.deleteOne({ _id: objectId });
        
        if (deleteResult.deletedCount === 1) {
            return NextResponse.json({ 
                success: true,
                message: "Listing deleted successfully" 
            });
        } else {
            return NextResponse.json({ 
                success: false,
                error: "Listing not found" 
            }, { status: 404 });
        }
    } catch (error) {
        console.error("Error deleting listing:", error);
        return NextResponse.json({ 
            success: false,
            error: "Failed to delete listing" 
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const postData = await req.json();
        
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
            return NextResponse.json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`,
                receivedData: postData
            }, { status: 400 });
        }

        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarListing');

        // Validate section value
        const validSections = ['recent', 'popular'];
        if (!validSections.includes(postData.section)) {
            return NextResponse.json({
                success: false,
                error: "Invalid section value. Must be either 'recent' or 'popular'",
            }, { status: 400 });
        }

        // Create listing data with validated fields
        const listingData = {
            ...postData,
            images: postData.images,
            image: postData.images[0],
            stockNumber: postData.stockNumber.trim(),
            year: Number(postData.year),
            price: Number(postData.price),
            section: postData.section,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'active',
            slug: postData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '')
        };

        const result = await mainPostCollection.insertOne(listingData);

        return NextResponse.json({
            success: true,
            message: "Listing created successfully",
            listing: {
                ...listingData,
                _id: result.insertedId.toString()
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating listing:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to create listing",
            details: error.message
        }, { status: 500 });
    }
}
