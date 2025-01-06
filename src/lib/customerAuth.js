import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import CustomerUser from './CustomerUser';
import dbConnect from './mongodb';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'chendanvasu');

export async function verifyCustomerAuth() {
  try {
    await dbConnect();
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    // Check for token existence
    if (!token) {
      console.log('No token found');
      return { success: false, message: 'No token found' };
    }

    // Verify the token
    const { payload } = await jwtVerify(token.value, secretKey);
    
    // Verify this is a customer token
    if (payload.type !== 'customer') {
      console.log('Not a customer token');
      return { success: false, message: 'Invalid token type' };
    }

    // Find the user
    const user = await CustomerUser.findById(payload.userId)
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
    const token = await new SignJWT({ 
      userId: user._id.toString(),
      email: user.email,
      type: 'customer'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secretKey);
      
    console.log('Customer token created:', !!token);
    return token;
  } catch (error) {
    console.error('Token creation error:', error);
    throw error;
  }
} 