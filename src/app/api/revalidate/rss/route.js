import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Get optional security token from query params
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  // If you have a secret token configured, validate it
  const secretToken = process.env.REVALIDATE_TOKEN;
  if (secretToken && token !== secretToken) {
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
  
  try {
    // Revalidate the RSS feed
    revalidatePath('/api/rss');
    
    // Also revalidate any potential variants
    revalidatePath('/api/rss/zapier-test');
    revalidatePath('/api/rss/basic-test');
    
    return NextResponse.json({
      revalidated: true,
      message: 'RSS feed revalidated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error revalidating RSS feed:', error);
    return NextResponse.json(
      { message: 'Error revalidating RSS feed', error: error.message },
      { status: 500 }
    );
  }
} 