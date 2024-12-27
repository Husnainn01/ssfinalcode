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

    // Revalidate the specific path and related paths
    const pathsToRevalidate = [
      path,
      '/',
      '/cars',
      '/admin/dashboard/listing',
      `/cars/${path.split('/').pop()}` // Revalidate the specific car page
    ];

    // Revalidate all paths
    pathsToRevalidate.forEach(p => {
      try {
        revalidatePath(p);
        console.log('Revalidated path:', p);
      } catch (e) {
        console.error('Failed to revalidate path:', p, e);
      }
    });

    // Force clear cache headers
    return new NextResponse(
      JSON.stringify({
        revalidated: true,
        paths: pathsToRevalidate,
        now: Date.now()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
          'Surrogate-Control': 'no-store',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
} 