import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function GET(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarFeatures');
        const posts = await mainPostCollection.find({}).toArray();
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error fetching posts from MongoDB:", error);
        return NextResponse.json({ error: "Failed to fetch posts from MongoDB" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarFeatures');
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
        const mainPostCollection = mongoose.connection.collection('CarFeatures');
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const result = await mainPostCollection.deleteOne({ 
            _id: new mongoose.Types.ObjectId(id) 
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Feature not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Feature deleted successfully" });
    } catch (error) {
        console.error("Error deleting feature from MongoDB:", error);
        return NextResponse.json({ error: "Failed to delete feature" }, { status: 500 });
    }
}
