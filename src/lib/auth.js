import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import AdminUser from '@/models/AdminUser';
import dbConnect from './mongodb';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'chendanvasu');

export async function verifyAuth(request) {
  try {
    await dbConnect();
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');

    if (!token) {
      console.log('No token found');
      return { success: false };
    }

    const { payload } = await jwtVerify(token.value, secretKey);

    const user = await AdminUser.findById(payload.userId)
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
  return new SignJWT({ 
    userId: user._id.toString(),
    role: user.role,
    email: user.email
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secretKey);
}