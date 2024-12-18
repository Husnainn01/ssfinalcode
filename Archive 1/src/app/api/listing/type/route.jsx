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
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const mainPostCollection = mongoose.connection.collection('CarType');
        const postData = await req.json();
        
        const typeData = {
            type: postData.type.trim(),
            name: postData.type.trim(),
            image: postData.image?.trim() || '',
            createdAt: new Date().toISOString()
        };
        
        const insertResult = await mainPostCollection.insertOne(typeData);
        
        return NextResponse.json({ 
            success: true,
            message: "Type added successfully",
            data: { ...typeData, _id: insertResult.insertedId }
        });
    } catch (error) {
        console.error("Error adding type:", error);
        return NextResponse.json({ error: "Failed to add type" }, { status: 500 });
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
            return NextResponse.json({ message: "Post deleted successfully" });
        } else {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }
    } catch (error) {
        console.error("Error deleting post from MongoDB:", error);
        return NextResponse.json({ error: "Failed to delete post from MongoDB" }, { status: 500 });
    }
}
