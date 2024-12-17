import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected');

    // Debug database connection
    const dbName = mongoose.connection.db.databaseName;
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Current database:', dbName);
    console.log('Available collections:', collections.map(c => c.name));

    const { email, password } = await request.json();
    console.log('Login attempt for:', email);

    // Find user with detailed logging
    console.log('Searching for user in database...');
    
    // Debug query
    const usersCollection = mongoose.connection.db.collection('users');
    const userDoc = await usersCollection.findOne({ email });
    console.log('Direct MongoDB query result:', userDoc);

    const user = await AdminUser.findOne({ email });
    console.log('Mongoose query result:', user);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    console.log('Password validation:', isValid ? 'Success' : 'Failed'); // Debug log

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create token
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          lastName: user.lastName
        }
      },
      { status: 200 }
    );

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
