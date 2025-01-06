import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CustomerUser from '@/models/CustomerUser';

export const runtime = 'nodejs'; // Force Node.js runtime

export async function GET(request) {
  try {
    await connectDB();
    // Your database operations here
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 