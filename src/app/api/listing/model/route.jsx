import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

// GET endpoint to fetch all models or models filtered by make
export async function GET(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarModel');
        
        const url = new URL(req.url);
        const make = url.searchParams.get('make');
        
        let query = {};
        if (make) {
            query.make = make;
        }
        
        const models = await mainPostCollection
            .find(query)
            .project({
                _id: 1,
                model: 1,
                make: 1
            })
            .toArray();
        
        return NextResponse.json(models);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ 
            success: false, 
            error: "Failed to fetch models" 
        }, { status: 500 });
    }
}

// POST endpoint to add a new model
export async function POST(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarModel');
        const modelData = await req.json();
        
        // Add additional fields
        modelData.active = true;
        modelData.createdAt = new Date().toISOString();
        
        const insertResult = await mainPostCollection.insertOne(modelData);
        return NextResponse.json({ 
            success: true,
            message: "Model added successfully", 
            modelId: insertResult.insertedId, 
            modelData 
        });
    } catch (error) {
        console.error("Error adding model:", error);
        return NextResponse.json({ 
            success: false,
            error: "Failed to add model" 
        }, { status: 500 });
    }
}

// DELETE endpoint to delete a model by ID
export async function DELETE(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarModel');
        const { id } = await req.json();
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
        }
        
        const objectId = mongoose.Types.ObjectId.createFromHexString(id);
        const deleteResult = await mainPostCollection.deleteOne({ _id: objectId });
        
        if (deleteResult.deletedCount === 1) {
            return NextResponse.json({ 
                success: true,
                message: "Model deleted successfully" 
            });
        } else {
            return NextResponse.json({ 
                success: false,
                error: "Model not found" 
            }, { status: 404 });
        }
    } catch (error) {
        console.error("Error deleting model:", error);
        return NextResponse.json({ 
            success: false,
            error: "Failed to delete model" 
        }, { status: 500 });
    }
}

// PUT endpoint to update a model by ID
export async function PUT(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarModel');
        const { id, updateData } = await req.json();
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
        }
        
        const objectId = mongoose.Types.ObjectId.createFromHexString(id);
        const updateResult = await mainPostCollection.updateOne(
            { _id: objectId },
            { $set: updateData }
        );
        
        if (updateResult.matchedCount === 1) {
            return NextResponse.json({ 
                success: true,
                message: "Model updated successfully",
                updatedData: updateData 
            });
        } else {
            return NextResponse.json({ 
                success: false,
                error: "Model not found" 
            }, { status: 404 });
        }
    } catch (error) {
        console.error("Error updating model:", error);
        return NextResponse.json({ 
            success: false,
            error: "Failed to update model" 
        }, { status: 500 });
    }
}
