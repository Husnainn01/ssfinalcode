import { NextResponse } from 'next/server';
import { getVerificationSession, clearVerificationSession } from '@/lib/server-utils';

export async function POST(req) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Get the stored verification session
    const session = await getVerificationSession(email);

    if (!session) {
      return NextResponse.json(
        { error: 'Verification session not found or expired' },
        { status: 400 }
      );
    }

    // Check if the code matches
    if (session.code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Clear the verification session after successful verification
    await clearVerificationSession(email);

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in verify-code:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
} 