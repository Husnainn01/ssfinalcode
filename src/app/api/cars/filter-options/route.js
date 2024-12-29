import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
    try {
        await dbConnect();
        
        // Fetch makes with correct projection
        const makes = await mongoose.connection.collection('CarMake')
            .find({ active: true })
            .project({ make: 1, _id: 0 })
            .sort({ make: 1 })
            .toArray();

        // Fetch models with correct projection
        const models = await mongoose.connection.collection('CarModel')
            .find({})
            .project({ model: 1, make: 1, _id: 0 })
            .toArray();

        // Fetch types with correct projection
        const types = await mongoose.connection.collection('CarType')
            .find({})
            .project({ type: 1, name: 1, _id: 0 })
            .toArray();

        return NextResponse.json({
            makes: makes.map(m => ({ value: m.make, label: m.make })),
            models: models.map(m => ({ 
                value: m.model, 
                label: m.model,
                make: m.make 
            })),
            types: types.map(t => ({ 
                value: t.type || t.name, 
                label: t.type || t.name 
            })),
            steering: [
                { value: 'left', label: 'Left Hand Drive' },
                { value: 'right', label: 'Right Hand Drive' }
            ],
            priceRanges: [
                { value: '0-5000', label: 'Under $5,000' },
                { value: '5000-10000', label: '$5,000 - $10,000' },
                { value: '10000-15000', label: '$10,000 - $15,000' },
                { value: '15000-20000', label: '$15,000 - $20,000' },
                { value: '20000+', label: 'Above $20,000' }
            ]
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 });
    }
}