import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function GET(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarColor');
        
        const colors = await mainPostCollection
            .find({})
            .project({
                _id: 1,
                color: 1,
                hex: 1,
                id: 1
            })
            .toArray();
        
        console.log('Found colors:', colors);
        
        return NextResponse.json(colors, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
            }
        });
    } catch (error) {
        console.error("Error in GET /api/listing/color:", error);
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarColor');
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

export async function DELETE(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarColor');
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
        const mainPostCollection = mongoose.connection.collection('CarColor');
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
