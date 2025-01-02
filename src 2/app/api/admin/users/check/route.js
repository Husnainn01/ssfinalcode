import { NextResponse } from 'next/server';
import AdminUser from '@/models/AdminUser';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
  try {
    const conn = await dbConnect();
    
    // Find all users and exclude password field
    const users = await AdminUser.find({}, '-password');
    
    // Get a count of users
    const count = await AdminUser.countDocuments();
    
    return NextResponse.json({
      success: true,
      count,
      users,
      databaseName: conn.connection.db.databaseName
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Optional: Add an endpoint to delete a specific user
export async function DELETE(request) {
  try {
    const { email } = await request.json();
    await dbConnect();
    
    const result = await AdminUser.deleteOne({ email });
    
    return NextResponse.json({
      success: true,
      deleted: result.deletedCount > 0,
      message: result.deletedCount > 0 
        ? 'User deleted successfully' 
        : 'User not found'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 