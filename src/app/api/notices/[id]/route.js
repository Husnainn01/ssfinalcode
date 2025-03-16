import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notice from '@/models/Notice';

// GET a single notice by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const notice = await Notice.findById(id);
    
    if (!notice) {
      return NextResponse.json(
        { error: 'Notice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(JSON.parse(JSON.stringify(notice)));
  } catch (error) {
    console.error('Error fetching notice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notice' },
      { status: 500 }
    );
  }
}

// PUT update a notice
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    const updatedNotice = await Notice.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!updatedNotice) {
      return NextResponse.json(
        { error: 'Notice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(JSON.parse(JSON.stringify(updatedNotice)));
  } catch (error) {
    console.error('Error updating notice:', error);
    return NextResponse.json(
      { error: 'Failed to update notice' },
      { status: 500 }
    );
  }
}

// DELETE a notice
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const deletedNotice = await Notice.findByIdAndDelete(id);
    
    if (!deletedNotice) {
      return NextResponse.json(
        { error: 'Notice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notice:', error);
    return NextResponse.json(
      { error: 'Failed to delete notice' },
      { status: 500 }
    );
  }
} 