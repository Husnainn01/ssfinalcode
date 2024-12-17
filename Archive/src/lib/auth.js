import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import AdminUser from '@/models/AdminUser';
import { connectDB } from './mongodb';

export const authOptions = {
  providers: [
    // Remove or update this if you're not using NextAuth credentials
  ],
};

export async function verifyAuth(request) {
  try {
    await connectDB();
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');
    console.log('Admin token:', token);

    if (!token) {
      return { success: false };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    const user = await AdminUser.findById(decoded.userId)
      .select('-password')
      .lean();

    if (!user || user.status !== 'active') {
      return { success: false };
    }

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        lastName: user.lastName
      }
    };

  } catch (error) {
    console.error('Auth verification error:', error);
    return { success: false };
  }
}

export async function createAdminToken(user) {
  return jwt.sign(
    { 
      userId: user._id,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}