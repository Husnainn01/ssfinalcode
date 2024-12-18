import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function GET(req) {
    try {
        console.log('Attempting database connection...');
        await dbConnect();
        console.log('Database connected, fetching makes...');
        
        const mainPostCollection = mongoose.connection.collection('CarMake');
        
        const posts = await mainPostCollection
            .find({ active: true })
            .project({
                _id: 1,
                make: 1,
                image: 1
            })
            .sort({ make: 1 })
            .toArray();
        
        console.log('Found makes:', posts.length);
        
        return NextResponse.json(posts, {
            headers: {
                'Cache-Control': 'no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
    } catch (error) {
        console.error("Error in GET /api/listing/make:", error);
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarMake');
        const postData = await req.json();
        
        const makeData = {
            make: postData.make.trim(),
            image: postData.image.trim(),
            active: true,
            createdAt: new Date().toISOString()
        };
        
        const insertResult = await mainPostCollection.insertOne(makeData);
        
        if (!insertResult.acknowledged) {
            throw new Error("Failed to insert make");
        }
        
        return NextResponse.json({ 
            success: true,
            message: "Make added successfully", 
            data: { ...makeData, _id: insertResult.insertedId }
        });
    } catch (error) {
        console.error("Error adding make:", error);
        return NextResponse.json({ 
            success: false,
            error: "Failed to add make" 
        }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarMake');
        const { id } = await req.json();
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
        }
        
        const objectId = new mongoose.Types.ObjectId(id);
        const deleteResult = await mainPostCollection.deleteOne({ _id: objectId });
        
        if (deleteResult.deletedCount === 1) {
            return NextResponse.json({ 
                success: true,
                message: "Make deleted successfully" 
            });
        } else {
            return NextResponse.json({ 
                success: false,
                error: "Make not found" 
            }, { status: 404 });
        }
    } catch (error) {
        console.error("Error deleting make:", error);
        return NextResponse.json({ 
            success: false,
            error: "Failed to delete make" 
        }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarMake');
        const { id, updateData } = await req.json();
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
        }
        
        const objectId = mongoose.Types.ObjectId.createFromHexString(id);
        const updateResult = await mainPostCollection.updateOne(
            { _id: objectId },
            { $set: updateData }
        );
        
        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ error: "Make not found" }, { status: 404 });
        }
        
        if (updateResult.modifiedCount === 1) {
            return NextResponse.json({ 
                message: "Make updated successfully",
                updatedData: updateData 
            });
        } else {
            return NextResponse.json({ 
                message: "No changes made to the make",
                updatedData: updateData 
            });
        }
    } catch (error) {
        console.error("Error updating make in MongoDB:", error);
        return NextResponse.json({ 
            error: "Failed to update make",
            details: error.message 
        }, { status: 500 });
    }
}
