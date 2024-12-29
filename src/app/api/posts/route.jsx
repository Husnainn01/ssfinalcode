import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

// GET endpoint to fetch all posts
export async function GET(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('BlogPost');
        const posts = await mainPostCollection.find({}).toArray();
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error fetching posts from MongoDB:", error);
        return NextResponse.json({ error: "Failed to fetch posts from MongoDB" }, { status: 500 });
    }
}

// POST endpoint to add a new post
export async function POST(req) {
    try {
        await dbConnect();
        
        const mainPostCollection = mongoose.connection.collection('BlogPost');

        const postData = await req.json(); // Assuming POST data is JSON

        // Generate a random 6-digit number
        const randomSixDigitNumber = Math.floor(100000 + Math.random() * 900000);

        // Add the custom key-value pair
        postData['id'] = randomSixDigitNumber;

        const insertResult = await mainPostCollection.insertOne(postData); // Insert data

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

        const db = mongoose.connection;
        const mainPostCollection = db.collection('BlogPost');

        const { id } = await req.json(); // Assuming DELETE data contains an ID

        // Ensure id is a valid ObjectId string
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
        }

        const objectId = mongoose.Types.ObjectId.createFromHexString(id);

        const deleteResult = await mainPostCollection.deleteOne({ _id: objectId }); // Delete data


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

        const db = mongoose.connection;
        const mainPostCollection = db.collection('BlogPost');

        const { id, updateData } = await req.json(); // Assuming PUT data contains an ID and updateData

        // Ensure id is a valid ObjectId string
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
        }

        const objectId = mongoose.Types.ObjectId.createFromHexString(id);

        const updateResult = await mainPostCollection.updateOne(
            { _id: objectId },
            { $set: updateData }
        ); // Update data


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