import VerificationSession from './VerificationSession';
import { generateVerificationCode } from './utils';
import dbConnect from './dbConnect';

export async function storeVerificationSession(email, code = null) {
  await dbConnect();
  
  // Generate code if not provided
  const verificationCode = code || generateVerificationCode();
  
  // Create expiration date (10 minutes from now)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  // Remove any existing sessions for this email
  await VerificationSession.deleteMany({ email });

  // Create new verification session
  const session = new VerificationSession({
    email,
    code: verificationCode,
    expiresAt
  });

  await session.save();
  
  return verificationCode;
}

export async function getVerificationSession(email) {
  await dbConnect();
  
  const session = await VerificationSession.findOne({
    email,
    expiresAt: { $gt: new Date() }
  });

  return session;
}

export async function clearVerificationSession(email) {
  await dbConnect();
  await VerificationSession.deleteMany({ email });
}

export async function verifyCode(email, code) {
  const session = await getVerificationSession(email);
  
  if (!session) {
    throw new Error('Verification session not found or expired');
  }

  if (session.code !== code) {
    throw new Error('Invalid verification code');
  }

  // Clear the session after successful verification
  await clearVerificationSession(email);
  
  return true;
} 