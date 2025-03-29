import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AdminUser from '@/models/AdminUser';
import { SignJWT } from 'jose';
import { rateLimit } from '@/lib/rate-limit';

const SECRET_KEY = new TextEncoder().encode('chendanvasu');

const VALID_ROLES = {
  'role_admin': 'admin',
  'role_editor': 'editor',
  'role_moderator': 'moderator',
  'role_viewer': 'viewer'
};

// Configure the rate limiter for login
const loginLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per interval
});

export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const loginToken = `login_${ip}`;
    
    // Apply rate limiting - 5 login attempts per minute per IP
    try {
      await loginLimiter.check(request, 5, loginToken);
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many login attempts. Please try again in a minute.'
        }, 
        { status: 429 }
      );
    }
    
    console.log('Connecting to database...');
    await dbConnect();
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
