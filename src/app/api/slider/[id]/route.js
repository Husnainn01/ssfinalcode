import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Slider from '@/models/Slider';
import cloudinary from '@/lib/cloudinary';

// GET single slider
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const slider = await Slider.findById(params.id);
    
    if (!slider) {
      return NextResponse.json(
        { error: 'Slider not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(slider);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch slider' },
      { status: 500 }
    );
  }
}

// PUT update slider
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // First find the existing slider
    const existingSlider = await Slider.findById(params.id);
    
    if (!existingSlider) {
      return NextResponse.json(
        { error: 'Slider not found' },
        { status: 404 }
      );
    }

    // Create update object with existing values as fallbacks
    const updateData = {
      imageUrl: data.imageUrl || existingSlider.imageUrl,
      public_id: data.public_id || existingSlider.public_id,
      order: data.order ?? existingSlider.order,
      isActive: data.isActive ?? existingSlider.isActive,
      title: data.title ?? existingSlider.title ?? '',
      description: data.description ?? existingSlider.description ?? '',
      link: data.link ?? existingSlider.link ?? '',
      highlight: data.highlight ?? existingSlider.highlight ?? ''
    };

    // Use findOneAndUpdate with validation disabled
    const slider = await Slider.findOneAndUpdate(
      { _id: params.id },
      updateData,
      { 
        new: true,
        runValidators: false // Disable validation for update
      }
    );
    
    return NextResponse.json(slider);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update slider' },
      { status: 500 }
    );
  }
}

// DELETE slider
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const slider = await Slider.findById(params.id);
    
    if (!slider) {
      return NextResponse.json(
        { error: 'Slider not found' },
        { status: 404 }
      );
    }

    try {
      // Delete image from Cloudinary if public_id exists
      if (slider.public_id) {
        await cloudinary.uploader.destroy(slider.public_id);
      }
    } catch (cloudinaryError) {
      console.error('Error deleting image from Cloudinary:', cloudinaryError);
      // Continue with deletion even if Cloudinary delete fails
    }

    // Delete slider from database
    await Slider.findByIdAndDelete(params.id);
    
    return NextResponse.json({ 
      message: 'Slider deleted successfully',
      success: true 
    });
  } catch (error) {
    console.error('Error deleting slider:', error);
    return NextResponse.json(
      { error: 'Failed to delete slider' },
      { status: 500 }
    );
  }
} 