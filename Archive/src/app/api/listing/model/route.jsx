import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

// GET endpoint to fetch all posts or posts filtered by make
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
                make: 1,
                image: 1
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

// POST endpoint to add a new post
export async function POST(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarModel');
        const postData = await req.json();
        const randomSixDigitNumber = Math.floor(100000 + Math.random() * 900000);
        postData['id'] = randomSixDigitNumber;
        const insertResult = await mainPostCollection.insertOne(postData);
        return NextResponse.json({ message: "Post added successfully", postId: insertResult.insertedId, postData });
    } catch (error) {
        console.error("Error adding post to MongoDB:", error);
        return NextResponse.json({ error: "Failed to add post to MongoDB" }, { status: 500 });
    }
}

// DELETE endpoint to delete a post by ID
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
            return NextResponse.json({ message: "Post deleted successfully" });
        } else {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }
    } catch (error) {
        console.error("Error deleting post from MongoDB:", error);
        return NextResponse.json({ error: "Failed to delete post from MongoDB" }, { status: 500 });
    }
}

// PUT endpoint to update a post by ID
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
            return NextResponse.json({ message: "Post updated successfully" });
        } else {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }
    } catch (error) {
        console.error("Error updating post in MongoDB:", error);
        return NextResponse.json({ error: "Failed to update post in MongoDB" }, { status: 500 });
    }
}
