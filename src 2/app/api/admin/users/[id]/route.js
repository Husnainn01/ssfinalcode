import { NextResponse } from 'next/server';
import AdminUser from '@/models/AdminUser';
import dbConnect from '@/lib/dbConnect';

// Get specific admin user
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const user = await AdminUser.findById(params.id).select('-password');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Update admin user
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Remove password from update if not provided
    if (!data.password) {
      delete data.password;
    }

    const user = await AdminUser.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Delete admin user
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const user = await AdminUser.findByIdAndDelete(params.id);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 