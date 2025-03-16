import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notice from '@/models/Notice';

// GET all notices
export async function GET() {
  try {
    await dbConnect();
    
    const notices = await Notice.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(JSON.parse(JSON.stringify(notices)));
  } catch (error) {
    console.error('Error fetching notices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notices' },
      { status: 500 }
    );
  }
}

// POST create a new notice
export async function POST(request) {
  try {
    await dbConnect();
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    const newNotice = await Notice.create(data);
    
    return NextResponse.json(JSON.parse(JSON.stringify(newNotice)), { status: 201 });
  } catch (error) {
    console.error('Error creating notice:', error);
    return NextResponse.json(
      { error: 'Failed to create notice' },
      { status: 500 }
    );
  }
} 