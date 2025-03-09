// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/dbConnect';
// import mongoose from 'mongoose';

// // GET handler to fetch a single blog post
// export async function GET(request, { params }) {
//   try {
//     const { id } = params;
    
//     // Validate the ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { message: 'Invalid post ID format' },
//         { status: 400 }
//       );
//     }
    
//     await dbConnect();
//     const db = mongoose.connection;
//     const post = await db.collection('BlogPost').findOne({ 
//       _id: new mongoose.Types.ObjectId(id) 
//     });
    
//     if (!post) {
//       return NextResponse.json(
//         { message: 'Post not found' },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json(post, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching post:', error);
//     return NextResponse.json(
//       { message: 'Failed to fetch post', error: error.message },
//       { status: 500 }
//     );
//   }
// }

// // DELETE handler to delete a blog post
// export async function DELETE(request, { params }) {
//   try {
//     const { id } = params;
    
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { message: 'Invalid post ID format' },
//         { status: 400 }
//       );
//     }
    
//     await dbConnect();
//     const db = mongoose.connection;
    
//     const result = await db.collection('BlogPost').deleteOne({ 
//       _id: new mongoose.Types.ObjectId(id) 
//     });
    
//     if (result.deletedCount === 0) {
//       return NextResponse.json(
//         { message: 'Post not found' },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json(
//       { message: 'Post deleted successfully' },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error deleting post:', error);
//     return NextResponse.json(
//       { message: 'Failed to delete post', error: error.message },
//       { status: 500 }
//     );
//   }
// }

// // PUT handler to update a blog post
// export async function PUT(request, { params }) {
//   try {
//     const { id } = params;
//     const body = await request.json();
    
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { message: 'Invalid post ID format' },
//         { status: 400 }
//       );
//     }
    
//     await dbConnect();
//     const db = mongoose.connection;
    
//     const updateData = {
//       ...body,
//       updatedAt: new Date()
//     };
    
//     const result = await db.collection('BlogPost').updateOne(
//       { _id: new mongoose.Types.ObjectId(id) },
//       { $set: updateData }
//     );
    
//     if (result.matchedCount === 0) {
//       return NextResponse.json(
//         { message: 'Post not found' },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json(
//       { message: 'Post updated successfully' },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error updating post:', error);
//     return NextResponse.json(
//       { message: 'Failed to update post', error: error.message },
//       { status: 500 }
//     );
//   }
// } 


import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// GET handler to fetch a single blog post
export async function GET(request, { params }) {
  try {
    const { id } = params;
    await dbConnect();
    const db = mongoose.connection;
    
    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: new mongoose.Types.ObjectId(id) };
    } else {
      query = { id: id }; // For numeric IDs
    }
    
    const post = await db.collection('BlogPost').findOne(query);
    
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

// PUT handler to update a blog post
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    await dbConnect();
    const db = mongoose.connection;
    
    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: new mongoose.Types.ObjectId(id) };
    } else {
      query = { id: id }; // For numeric IDs
    }
    
    const updateData = {
      ...body,
      updatedAt: new Date()
    };
    
    const result = await db.collection('BlogPost').updateOne(
      query,
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

// DELETE handler to delete a blog post
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await dbConnect();
    const db = mongoose.connection;
    
    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: new mongoose.Types.ObjectId(id) };
    } else {
      query = { id: id }; // For numeric IDs
    }
    
    const result = await db.collection('BlogPost').deleteOne(query);
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Post deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { message: 'Failed to delete post', error: error.message },
      { status: 500 }
    );
  }
} 