import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function GET(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarType');
        
        const types = await mainPostCollection
            .find({})
            .project({
                _id: 1,
                type: 1,
                name: 1
            })
            .sort({ type: 1 })
            .toArray();
        
        const transformedTypes = types.map(t => ({
            ...t,
            type: String(t.type || t.name || ''),
            name: String(t.name || t.type || '')
        }));
        
        return NextResponse.json(transformedTypes);
    } catch (error) {
        console.error("Error in GET /api/listing/type:", error);
        return NextResponse.json({ 
            success: false, 
            error: "Failed to fetch types" 
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarType');
        const { type } = await req.json();
        
        const typeData = {
            type: type.trim(),
            name: type.trim(),
            active: true,
            createdAt: new Date().toISOString()
        };
        
        const insertResult = await mainPostCollection.insertOne(typeData);
        
        if (!insertResult.acknowledged) {
            throw new Error("Failed to insert type");
        }
        
        return NextResponse.json({ 
            success: true,
            message: "Type added successfully",
            data: { ...typeData, _id: insertResult.insertedId }
        });
    } catch (error) {
        console.error("Error adding type:", error);
        return NextResponse.json({ 
            success: false,
            error: "Failed to add type" 
        }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarType');
        const { id } = await req.json();
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
        }
        
        const objectId = mongoose.Types.ObjectId.createFromHexString(id);
        const deleteResult = await mainPostCollection.deleteOne({ _id: objectId });
        
        if (deleteResult.deletedCount === 1) {
            return NextResponse.json({ 
                success: true,
                message: "Type deleted successfully" 
            });
        } else {
            return NextResponse.json({ 
                success: false,
                error: "Type not found" 
            }, { status: 404 });
        }
    } catch (error) {
        console.error("Error deleting type:", error);
        return NextResponse.json({ 
            success: false,
            error: "Failed to delete type" 
        }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarType');
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
                message: "Type updated successfully",
                updatedData: updateData 
            });
        } else {
            return NextResponse.json({ 
                success: false,
                error: "Type not found" 
            }, { status: 404 });
        }
    } catch (error) {
        console.error("Error updating type:", error);
        return NextResponse.json({ 
            success: false,
            error: "Failed to update type" 
        }, { status: 500 });
    }
}
