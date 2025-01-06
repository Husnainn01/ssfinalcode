import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/dbConnect';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'No token provided' 
      }, { status: 401 });
    }

    const payload = await verifyToken(token);
    console.log('Profile payload:', payload);

    if (!payload || !payload.userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid token' 
      }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(payload.userId)
      .select('-password')
      .lean();

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const verified = await jwtVerify(token, SECRET_KEY);
    const { payload } = verified;
    
    await dbConnect();
    const data = await request.json();
    
    // Find and update user
    const updatedUser = await AdminUser.findOneAndUpdate(
      { email: payload.email },
      { 
        $set: {
          name: data.name,
          // Add other fields you want to allow updating
          updatedAt: new Date()
        }
      },
      { 
        new: true,
        select: '-password' // Exclude password from response
      }
    );

    if (!updatedUser) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update profile' 
    }, { status: 500 });
  }
}
