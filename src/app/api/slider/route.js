import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Slider from '@/models/Slider';

// GET all sliders
export async function GET() {
  try {
    await dbConnect();
    const sliders = await Slider.find().sort({ order: 1 });
    return NextResponse.json(sliders);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sliders' },
      { status: 500 }
    );
  }
}

// POST new slider
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Only validate required fields (image related)
    if (!data.imageUrl || !data.public_id) {
      return NextResponse.json(
        { error: 'Image URL and public ID are required' },
        { status: 400 }
      );
    }

    const slider = await Slider.create({
      title: data.title || '', // Make title optional with default empty string
      description: data.description || '', // Make description optional with default empty string
      imageUrl: data.imageUrl,
      public_id: data.public_id,
      order: data.order || 0,
      isActive: data.isActive ?? true,
      link: data.link || '',
      highlight: data.highlight || ''
    });

    return NextResponse.json(slider, { status: 201 });
  } catch (error) {
    console.error('Slider creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create slider' },
      { status: 500 }
    );
  }
} 