import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

export async function GET(request: Request) {
  // Create a transaction
  const transaction = Sentry.getCurrentHub().startTransaction({
    name: "search-cars-api",
    op: "http.server"
  });

  // Set the transaction on the current scope
  Sentry.getCurrentHub().configureScope(scope => {
    scope.setSpan(transaction);
  });

  try {
    // Get search parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    
    if (!query) {
      throw new Error('Search query is required');
    }

    // Connect to database
    const db = await dbConnect();
    
    // Add breadcrumb for debugging
    Sentry.addBreadcrumb({
      category: 'database',
      message: 'Attempting to search cars',
      data: { query, page },
      level: 'info'
    });

    // Perform search
    const cars = await db.collection('cars')
      .find({
        $or: [
          { make: { $regex: query, $options: 'i' } },
          { model: { $regex: query, $options: 'i' } }
        ]
      })
      .skip((page - 1) * 10)
      .limit(10)
      .toArray();

    transaction.setStatus('ok');
    return NextResponse.json({ cars });

  } catch (error) {
    // Log specific error details
    Sentry.captureException(error, {
      tags: {
        endpoint: 'cars-search'
      },
      extra: {
        url: request.url,
        timestamp: new Date().toISOString()
      }
    });

    transaction.setStatus('error');

    // Return appropriate error response
    if (error instanceof Error && error.message === 'Search query is required') {
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
    transaction.finish();
  }
} 