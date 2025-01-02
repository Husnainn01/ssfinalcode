import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import mongoose from 'mongoose';

// GET - Fetch single role
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const role = await User.findOne({
      _id: params.id,
      role: { $regex: /^role_/ }
    });
    
    if (!role) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ role }, { status: 200 });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: "Failed to fetch role" },
      { status: 500 }
    );
  }
}

// PUT - Update role
export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const data = await req.json();

    if (!data.name) {
      return NextResponse.json(
        { error: "Role name is required" },
        { status: 400 }
      );
    }

    const existingRole = await User.findOne({
      _id: { $ne: params.id },
      $or: [
        { email: data.email },
        { role: `role_${data.name.toLowerCase().replace(/\s+/g, '_')}` }
      ]
    });
    
    if (existingRole) {
      return NextResponse.json(
        { error: "Role with this name or email already exists" },
        { status: 400 }
      );
    }

    const updatedRole = await User.findOneAndUpdate(
      { 
        _id: params.id,
        role: { $regex: /^role_/ }
      },
      { 
        $set: {
          ...data,
          role: `role_${data.name.toLowerCase().replace(/\s+/g, '_')}`
        } 
      },
      { new: true }
    );

    if (!updatedRole) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ role: updatedRole }, { status: 200 });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

// DELETE - Delete role
export async function DELETE(req, { params }) {
  try {
    console.log('Attempting to delete role with ID:', params.id);
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({
        error: "Invalid role ID format"
      }, { status: 400 });
    }

    await dbConnect();

    // Find and delete the user/role
    const deletedRole = await User.findOneAndDelete({
      _id: params.id,
      // Don't delete the main admin
      role: { $ne: 'admin' }
    });

    console.log('Delete operation result:', deletedRole);

    if (!deletedRole) {
      return NextResponse.json({
        error: "Role not found or cannot be deleted (admin role is protected)"
      }, { status: 404 });
    }

    return NextResponse.json({
      message: "Role deleted successfully",
      deletedRole: {
        id: deletedRole._id,
        name: deletedRole.name,
        role: deletedRole.role
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Delete role error:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({
      error: "Failed to delete role",
      details: error.message
    }, { status: 500 });
  }
} 