import { SignJWT, jwtVerify } from 'jose';

// Create a consistent secret key
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'chendanvasu';
  return new TextEncoder().encode(secret);
};

export async function createToken(payload) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(getSecretKey());
    return token;
  } catch (error) {
    console.error('Token creation error:', error);
    throw error;
  }
}

export async function verifyToken(token) {
  try {
    const secretKey = getSecretKey();
    console.log('Secret key length:', secretKey.length); // Debug line
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error('Token verification error details:', error);
    return null;
  }
}

// Export the secret key getter for consistency
export function getJwtSecretKey() {
  return getSecretKey();
} 