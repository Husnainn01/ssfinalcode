import { NextResponse } from 'next/server';
import { storeVerificationSession } from '@/lib/server-utils';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate and store verification code
    const code = await storeVerificationSession(email);

    // Send verification email
    await sendVerificationEmail({ email, code });

    return NextResponse.json(
      { message: 'Verification code sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in send-verification:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
} 