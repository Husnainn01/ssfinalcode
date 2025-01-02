import { SignJWT, jwtVerify } from 'jose';

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'chendanvasu';
  return new TextEncoder().encode(secret);
};

export async function createToken(payload) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(getSecretKey());
    return token;
  } catch (error) {
    console.error('Token creation error:', error);
    throw error;
  }
}

export async function verifyToken(token) {
  try {
    console.log('Verifying token:', token.substring(0, 20) + '...');
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    console.log('Token verified successfully:', payload);
    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export { getSecretKey }; 