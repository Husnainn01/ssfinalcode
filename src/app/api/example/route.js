import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import * as Sentry from "@sentry/nextjs";
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  // Start a new transaction
  const transaction = Sentry.startTransaction({
    name: 'search-cars',
    op: 'search'
  });

  try {
    // Get search parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Add search context to Sentry
    Sentry.setContext("search", {
      query,
      page
    });

    if (!query) {
      throw new Error('Search query is required');
    }

    // Connect to database
    await dbConnect();
    
    // Perform search using mongoose
    const cars = await mongoose.connection.collection('cars')
      .find({
        $or: [
          { make: { $regex: query, $options: 'i' } },
          { model: { $regex: query, $options: 'i' } }
        ]
      })
      .skip((page - 1) * 10)
      .limit(10)
      .toArray();

    // Set transaction as successful
    transaction.setStatus("ok");
    
    return NextResponse.json({ 
      cars,
      page,
      query 
    });

  } catch (error) {
    // Capture the error in Sentry
    Sentry.captureException(error);
    transaction.setStatus("error");
    
    console.error('Search API error:', error);

    if (error.message === 'Search query is required') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    // Always finish the transaction
    transaction.finish();
  }
} 