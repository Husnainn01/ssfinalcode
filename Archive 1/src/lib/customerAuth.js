import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import CustomerUser from '@/lib/CustomerUser';
import { connectDB } from './mongodb';

export async function verifyCustomerAuth(request) {
  try {
    await connectDB();
    const cookieStore = cookies();
    const token = cookieStore.get('customer_token');

    if (!token) {
      return { success: false };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const user = await CustomerUser.findById(decoded.userId)
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
        name: user.name,
        lastName: user.lastName
      }
    };
  } catch (error) {
    console.error('Customer auth verification error:', error);
    return { success: false };
  }
}

export async function createCustomerToken(user) {
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      type: 'customer'
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
} 