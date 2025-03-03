import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Port from '@/models/Port';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const port = await Port.findById(params.id);
    
    if (!port) {
      return NextResponse.json(
        { error: 'Port not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(port);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch port' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const data = await request.json();
    
    const port = await Port.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!port) {
      return NextResponse.json(
        { error: 'Port not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(port);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to update port' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const port = await Port.findByIdAndDelete(params.id);
    
    if (!port) {
      return NextResponse.json(
        { error: 'Port not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Port deleted successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete port' },
      { status: 500 }
    );
  }
} 