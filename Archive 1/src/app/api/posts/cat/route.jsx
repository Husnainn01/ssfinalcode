import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function GET(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('BlogCat');
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
        const mainPostCollection = mongoose.connection.collection('BlogCat');
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
