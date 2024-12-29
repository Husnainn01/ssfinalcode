import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import mongoose from 'mongoose';

// GET - Fetch all roles
export async function GET() {
  try {
    console.log('Attempting database connection...');
    await dbConnect();
    console.log('Database connected successfully');

    // Log connection state
    console.log('Connection state:', mongoose.connection.readyState);

    // Simple query to get all roles
    console.log('Executing roles query...');
    const roles = await User.find({
      $or: [
        { role: { $regex: /^role_/ } },  // Roles with role_ prefix
        { role: 'admin' }                // Include admin role
      ]
    })
    .select('name lastName email role status permissions')
    .lean();

    console.log(`Found ${roles.length} roles`);
    
    if (roles.length > 0) {
      console.log('Sample role:', JSON.stringify(roles[0], null, 2));
    }

    return NextResponse.json({ 
      roles,
      count: roles.length,
      timestamp: new Date().toISOString()
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      connectionState: mongoose.connection.readyState
    });

    return NextResponse.json({
      error: "Failed to fetch roles",
      details: error.message,
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// POST - Create new role
export async function POST(req) {
  try {
    await dbConnect();
    
    const data = await req.json();
    console.log('Received data:', data);

    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if role already exists in users collection
    const existingRole = await User.findOne({ 
      $or: [
        { email: data.email },
        { role: data.role }
      ]
    });
    
    if (existingRole) {
      return NextResponse.json(
        { error: "Role with this name or email already exists" },
        { status: 400 }
      );
    }

    // Create new role document in users collection
    const role = await User.create({
      name: data.name,
      lastName: data.lastName || 'Role',
      email: data.email,
      password: data.password,
      role: `role_${data.name.toLowerCase().replace(/\s+/g, '_')}`, // Add role_ prefix
      status: data.status || 'active',
      permissions: data.permissions || {}
    });

    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error.message || "Failed to create role" },
      { status: 500 }
    );
  }
} 