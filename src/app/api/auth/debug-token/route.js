import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    const customerToken = req.cookies.get('customer_token');
    
    if (!customerToken?.value) {
      return NextResponse.json({
        status: 'error',
        message: 'No token found'
      });
    }

    const payload = jwt.verify(
      customerToken.value, 
      process.env.JWT_SECRET || 'chendanvasu'
    );

    return NextResponse.json({
      status: 'success',
      tokenExists: true,
      payload: {
        userId: payload.userId,
        email: payload.email,
        type: payload.type,
        exp: new Date(payload.exp * 1000).toISOString()
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      tokenExists: !!req.cookies.get('customer_token')
    });
  }
} 