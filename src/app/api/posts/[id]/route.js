import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// PUT handler to update a blog post
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid post ID format' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await dbConnect();
    const db = mongoose.connection;
    
    // Prepare the update data
    const updateData = {
      title: body.title,
      content: body.content,
      category: body.category,
      image: body.image,
      // Add any other fields you want to update
    };
    
    // Only include fields that are present in the request body
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    // Update the post in the database
    const result = await db.collection('BlogPost').updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Post updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { message: 'Failed to update post', error: error.message },
      { status: 500 }
    );
  }
}

// GET handler to fetch a single blog post
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid post ID format' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await dbConnect();
    const db = mongoose.connection;
    
    // Fetch the post from the database
    const post = await db.collection('BlogPost').findOne({ 
      _id: new mongoose.Types.ObjectId(id) 
    });
    
    if (!post) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { message: 'Failed to fetch post', error: error.message },
      { status: 500 }
    );
  }
} 