import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { SignJWT } from 'jose';

const SECRET_KEY = new TextEncoder().encode('chendanvasu');

const VALID_ROLES = {
  'role_admin': 'admin',
  'role_editor': 'editor',
  'role_moderator': 'moderator',
  'role_viewer': 'viewer'
};

export async function POST(request) {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected');

    const { email, password } = await request.json();
    console.log('Login attempt for:', email);

    // Find user with detailed logging
    console.log('Searching for user in database...');
    const user = await AdminUser.findOne({ email });
    console.log('User details:', {
      email: user.email,
      role: user.role,
      name: user.name,
      _id: user._id
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    console.log('Password validation:', isValid ? 'Success' : 'Failed');

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user has a valid role
    console.log('Checking role:', user.role);
    const normalizedRole = VALID_ROLES[user.role];
    console.log('Normalized role:', normalizedRole);
    
    if (!normalizedRole) {
      console.log('Invalid role detected:', user.role);
      return NextResponse.json(
        { success: false, message: `Invalid user role: ${user.role}` },
        { status: 403 }
      );
    }

    // Create token using jose with the same secret key
    const token = await new SignJWT({ 
      userId: user._id.toString(),
      role: normalizedRole,
      email: user.email,
      name: user.name
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(SECRET_KEY);

    console.log('Token generated successfully');

    // Set cookie
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          role: normalizedRole,
          name: user.name
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
