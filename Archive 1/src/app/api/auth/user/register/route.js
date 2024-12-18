import { NextResponse } from 'next/server';
import CustomerUser from '@/lib/CustomerUser';
import dbConnect from '@/lib/dbConnect';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req) {
  try {
    await dbConnect();
    
    const userData = await req.json();
    
    // Check if user already exists
    const existingUser = await CustomerUser.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = new CustomerUser({
      name: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      emailConfirmation: userData.email, // Since it's already verified
      phoneNumber: {
        countryCode: userData.phoneNumber.countryCode,
        number: userData.phoneNumber.number
      },
      address: {
        country: userData.address.country,
        port: userData.address.port,
        postCode: userData.address.postCode
      },
      password: userData.password,
      status: 'active'
    });

    // Save the user
    await newUser.save();

    // Send welcome email
    await sendWelcomeEmail({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName
    });

    // Return success response without sensitive data
    return NextResponse.json(
      { 
        message: 'Registration successful',
        user: newUser.getPublicProfile()
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
} 