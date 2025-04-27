// import mongoose from 'mongoose';
// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/dbConnect';

// // GET endpoint to fetch all posts
// export async function GET(req) {
//     try {
//         await dbConnect();
//         const mainPostCollection = mongoose.connection.collection('BlogPost');
//         const posts = await mainPostCollection.find({}).toArray();
//         return NextResponse.json(posts);
//     } catch (error) {
//         console.error("Error fetching posts from MongoDB:", error);
//         return NextResponse.json({ error: "Failed to fetch posts from MongoDB" }, { status: 500 });
//     }
// }

// // POST endpoint to add a new post
// export async function POST(req) {
//     try {
//         await dbConnect();
        
//         const mainPostCollection = mongoose.connection.collection('BlogPost');

//         const postData = await req.json();
        
//         // Validate required fields
//         if (!postData.title || !postData.content || !postData.thumbnail) {
//             return NextResponse.json(
//                 { error: "Missing required fields" },
//                 { status: 400 }
//             );
//         }

//         // Ensure both image and thumbnail are set
//         const dataToInsert = {
//             ...postData,
//             image: postData.thumbnail || postData.image, // Use thumbnail if image not provided
//             thumbnail: postData.thumbnail,
//             createdAt: new Date(),
//             updatedAt: new Date()
//         };

//         // Generate a random 6-digit number for ID
//         const randomSixDigitNumber = Math.floor(100000 + Math.random() * 900000);
//         dataToInsert.id = randomSixDigitNumber;

//         console.log('Inserting post data:', dataToInsert); // Debug log

//         const insertResult = await mainPostCollection.insertOne(dataToInsert);

//         return NextResponse.json({
//             message: "Post added successfully",
//             postId: insertResult.insertedId,
//             postData: dataToInsert
//         });
//     } catch (error) {
//         console.error("Error adding post to MongoDB:", error);
//         return NextResponse.json(
//             { error: "Failed to add post to MongoDB" },
//             { status: 500 }
//         );
//     }
// }

// // DELETE endpoint to delete a post by ID
// export async function DELETE(req) {
//     try {
//         await dbConnect();

//         const db = mongoose.connection;
//         const mainPostCollection = db.collection('BlogPost');

//         const { id } = await req.json(); // Assuming DELETE data contains an ID

//         // Ensure id is a valid ObjectId string
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
//         }

//         const objectId = mongoose.Types.ObjectId.createFromHexString(id);

//         const deleteResult = await mainPostCollection.deleteOne({ _id: objectId }); // Delete data


//         if (deleteResult.deletedCount === 1) {
//             return NextResponse.json({ message: "Post deleted successfully" });
//         } else {
//             return NextResponse.json({ error: "Post not found" }, { status: 404 });
//         }
//     } catch (error) {
//         console.error("Error deleting post from MongoDB:", error);
//         return NextResponse.json({ error: "Failed to delete post from MongoDB" }, { status: 500 });
//     }
// }

// // PUT endpoint to update a post by ID
// export async function PUT(req) {
//     try {
//         await dbConnect();

//         const db = mongoose.connection;
//         const mainPostCollection = db.collection('BlogPost');

//         const { id, updateData } = await req.json(); // Assuming PUT data contains an ID and updateData

//         // Ensure id is a valid ObjectId string
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
//         }

//         const objectId = mongoose.Types.ObjectId.createFromHexString(id);

//         const updateResult = await mainPostCollection.updateOne(
//             { _id: objectId },
//             { $set: updateData }
//         ); // Update data


//         if (updateResult.matchedCount === 1) {
//             return NextResponse.json({ message: "Post updated successfully" });
//         } else {
//             return NextResponse.json({ error: "Post not found" }, { status: 404 });
//         }
//     } catch (error) {
//         console.error("Error updating post in MongoDB:", error);
//         return NextResponse.json({ error: "Failed to update post in MongoDB" }, { status: 500 });
//     }
// }


import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { revalidatePath } from 'next/cache';

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
        const postData = await req.json();
        
        // Validate required fields
        if (!postData.title || !postData.content || !postData.thumbnail) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Generate a random 6-digit number for ID
        const randomSixDigitNumber = Math.floor(100000 + Math.random() * 900000);
        
        const dataToInsert = {
            ...postData,
            id: randomSixDigitNumber.toString(),
            image: postData.thumbnail || postData.image,
            thumbnail: postData.thumbnail,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const insertResult = await mainPostCollection.insertOne(dataToInsert);

        // Revalidate the RSS feed to include the new blog post
        try {
            console.log('Revalidating RSS feed paths after blog post creation');
            revalidatePath('/api/rss');
            revalidatePath('/api/rss/zapier-test');
            revalidatePath('/api/rss/basic-test');
        } catch (revalidateError) {
            console.error('Error revalidating paths:', revalidateError);
            // Continue with the response even if revalidation fails
        }

        return NextResponse.json({
            message: "Post added successfully",
            postId: insertResult.insertedId,
            postData: dataToInsert
        });
    } catch (error) {
        console.error("Error adding post to MongoDB:", error);
        return NextResponse.json(
            { error: "Failed to add post to MongoDB" },
            { status: 500 }
        );
    }
}

// DELETE endpoint to delete a post
export async function DELETE(req) {
    try {
        await dbConnect();
        const { id } = await req.json();
        const mainPostCollection = mongoose.connection.collection('BlogPost');

        let query;
        if (mongoose.Types.ObjectId.isValid(id)) {
            query = { _id: new mongoose.Types.ObjectId(id) };
        } else {
            query = { id: id };
        }

        const deleteResult = await mainPostCollection.deleteOne(query);

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

// PUT endpoint to update a post
export async function PUT(req) {
    try {
        await dbConnect();
        const { id, updateData } = await req.json();
        const mainPostCollection = mongoose.connection.collection('BlogPost');

        let query;
        if (mongoose.Types.ObjectId.isValid(id)) {
            query = { _id: new mongoose.Types.ObjectId(id) };
        } else {
            query = { id: id };
        }

        const updateResult = await mainPostCollection.updateOne(
            query,
            { $set: { ...updateData, updatedAt: new Date() } }
        );

        // Revalidate the RSS feed when a blog post is updated
        try {
            console.log('Revalidating RSS feed paths after blog post update');
            revalidatePath('/api/rss');
            revalidatePath('/api/rss/zapier-test');
            revalidatePath('/api/rss/basic-test');
        } catch (revalidateError) {
            console.error('Error revalidating paths:', revalidateError);
            // Continue with the response even if revalidation fails
        }

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