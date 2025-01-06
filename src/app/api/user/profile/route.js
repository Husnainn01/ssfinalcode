import dbConnect from "@/lib/dbConnect"
import { NextResponse } from "next/server"
import CustomerUser from "@/lib/CustomerUser"

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    const userType = request.headers.get('x-user-type');
    const authHeader = request.headers.get('Authorization');
    
    console.log('Profile request headers:', {
      userId,
      userEmail,
      userType,
      authHeader: authHeader ? 'Present' : 'Missing'
    });

    if (!userId || !userEmail || userType !== 'customer' || !authHeader) {
      console.log('Missing or invalid auth headers');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const user = await CustomerUser.findById(userId)
      .select('-password -__v')
      .lean();
    
    if (!user) {
      console.log('User not found:', userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profileData = {
      name: user.name || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phoneNumber?.number || '',
      countryCode: user.phoneNumber?.countryCode || '',
      postCode: user.address?.postCode || '',
      country: user.address?.country || '',
      port: user.address?.port || ''
    };

    console.log('Sending profile data:', profileData);
    return NextResponse.json(profileData);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    console.log('Starting PUT request for user profile')
    
    const userEmail = request.headers.get('x-user-email') || 
                     request.headers.get('x-middleware-request-x-user-email')
    
    if (!userEmail) {
      console.log('No user email in headers')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    await dbConnect()

    const updateData = {
      name: data.name,
      lastName: data.lastName,
      phoneNumber: {
        number: data.phone.replace(/\D/g, ''),
        countryCode: data.countryCode || "+92"
      },
      address: {
        postCode: data.postCode,
        country: data.country,
        port: data.port
      },
      updatedAt: new Date()
    }

    const result = await CustomerUser.findOneAndUpdate(
      {
        $or: [
          { email: userEmail },
          { emailConfirmation: userEmail }
        ]
      },
      { $set: updateData },
      { new: true, select: '-password' }
    )

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      message: "Profile updated successfully",
      user: result
    })
  } catch (error) {
    console.error("Error in profile PUT:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 