import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarListing');
        const filters = Object.fromEntries(searchParams);
        
        // Build query based on filters
        const query = {};
        if (filters.make) query.make = String(filters.make);
        if (filters.model) query.model = String(filters.model);
        if (filters.type) query.type = String(filters.type);
        if (filters.steering) query.steering = String(filters.steering);
        
        // Handle year range
        if (filters.yearFrom || filters.yearTo) {
            query.year = {};
            if (filters.yearFrom) query.year.$gte = parseInt(filters.yearFrom);
            if (filters.yearTo) query.year.$lte = parseInt(filters.yearTo);
        }
        
        // Handle price range
        if (filters.price) {
            const [min, max] = filters.price.split('-');
            query.price = {};
            if (min) query.price.$gte = parseInt(min);
            if (max && max !== '+') query.price.$lte = parseInt(max);
            else if (max === '+') query.price.$gte = parseInt(min);
        }

        const count = await mainPostCollection.countDocuments(query);
        
        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ count: 0, error: error.message }, { status: 500 });
    }
} 