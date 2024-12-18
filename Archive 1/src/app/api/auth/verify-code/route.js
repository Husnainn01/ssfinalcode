import { NextResponse } from 'next/server';
import { verifyCode } from '@/lib/server-utils';

export async function POST(req) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Verify the code
    await verifyCode(email, code);

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in verify-code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify code' },
      { status: 400 }
    );
  }
} 