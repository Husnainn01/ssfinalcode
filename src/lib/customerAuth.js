import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import CustomerUser from './CustomerUser';
import { connectDB } from './mongodb';

export async function verifyCustomerAuth() {
  try {
    await connectDB();
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    // Check for token existence
    if (!token) {
      console.log('No token found');
      return { success: false, message: 'No token found' };
    }

    // Verify the token
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    
    // Verify this is a customer token
    if (decoded.type !== 'customer') {
      console.log('Not a customer token');
      return { success: false, message: 'Invalid token type' };
    }

    // Find the user
    const user = await CustomerUser.findById(decoded.userId)
      .select('-password')
      .lean();

    if (!user || user.status !== 'active') {
      console.log('User not found or inactive');
      return { success: false, message: 'User not found or inactive' };
    }

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        type: 'customer'
      }
    };
  } catch (error) {
    console.error('Customer auth verification error:', error);
    return { success: false, message: 'Authentication failed' };
  }
}

export async function createCustomerToken(user) {
  try {
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        type: 'customer'
      },
      process.env.JWT_SECRET || 'chendanvasu',
      { expiresIn: '7d' }
    );
    console.log('Customer token created:', !!token);
    return token;
  } catch (error) {
    console.error('Token creation error:', error);
    throw error;
  }
} 