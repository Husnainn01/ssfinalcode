import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { message: 'Path parameter is required' },
        { status: 400 }
      );
    }

    // Revalidate the specific path
    try {
      revalidatePath(path);
      console.log('Successfully revalidated path:', path);
    } catch (e) {
      console.error('Failed to revalidate path:', path, e);
      throw e;
    }

    return NextResponse.json({
      revalidated: true,
      path,
      now: Date.now()
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { 
        message: 'Failed to revalidate',
        error: error.message 
      },
      { status: 500 }
    );
  }
} 