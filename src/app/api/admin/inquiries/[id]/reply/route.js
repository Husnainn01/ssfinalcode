import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import nodemailer from 'nodemailer';

// Use the same hard-coded secret key as in your middleware
const SECRET_KEY = new TextEncoder().encode('chendanvasu');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function POST(request, { params }) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Get the token
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');
    
    // Debug - log all cookies
    console.log('All cookies:', cookieStore.getAll().map(c => c.name));
    
    if (!token) {
      console.error('No admin_token cookie found');
      return NextResponse.json({ 
        error: 'Unauthorized - No admin token found',
        available_cookies: cookieStore.getAll().map(c => c.name)
      }, { status: 401 });
    }
    
    // Verify the token
    try {
      // Use the same SECRET_KEY as used in middleware
      const { payload } = await jwtVerify(token.value, SECRET_KEY);
      
      // Log successful token verification
      console.log('Token verified successfully for admin:', payload.email, 'role:', payload.role);
      
      // Verify this is an admin token
      if (payload.role !== 'admin' && payload.role !== 'super_admin' && 
          payload.role !== 'editor' && payload.role !== 'moderator' && 
          payload.role !== 'viewer') {
        return NextResponse.json({ 
          error: 'Unauthorized - Insufficient permissions', 
          role: payload.role 
        }, { status: 403 });
      }
      
      const data = await request.json();
      
      // Validate required fields
      if (!data.message) {
        return NextResponse.json({ error: 'Message is required' }, { status: 400 });
      }
      
      // Get the inquiry
      const inquiry = await mongoose.connection.db
        .collection('customerInquiries')
        .findOne({
          _id: new mongoose.Types.ObjectId(params.id)
        });
      
      if (!inquiry) {
        return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
      }
      
      // Create the reply
      const reply = {
        _id: new mongoose.Types.ObjectId(),
        message: data.message,
        isAdmin: true,
        adminName: payload.name || 'Admin',
        adminId: payload.userId || payload.id,
        createdAt: new Date(),
        readByCustomer: false
      };
      
      // Add the reply to the replies array and update status
      await mongoose.connection.db
        .collection('customerInquiries')
        .updateOne(
          { _id: new mongoose.Types.ObjectId(params.id) },
          { 
            $push: { replies: reply },
            $set: { 
              updatedAt: new Date(),
              status: data.status || 'answered' // Update status based on input or default to 'answered'
            }
          }
        );
      
      // Get customer information
      const customer = await mongoose.connection.db
        .collection('customerusers')
        .findOne({ _id: new mongoose.Types.ObjectId(inquiry.userId) });
      
      if (customer) {
        // Create a notification for the customer
        const notification = {
          _id: new mongoose.Types.ObjectId(),
          userId: customer._id,
          title: "New Reply to Your Inquiry",
          message: `Support team has replied to your inquiry: "${inquiry.subject}"`,
          type: "inquiry",
          inquiryId: inquiry._id.toString(),
          createdAt: new Date(),
          isRead: false,
          details: [
            { label: "Subject", value: inquiry.subject },
            { label: "Replied by", value: payload.name || 'Admin' },
            { label: "Date", value: new Date().toLocaleString() }
          ]
        };
        
        await mongoose.connection.db
          .collection('customerNotifications')
          .insertOne(notification);
        
        // Send email notification if customer has an email
        if (customer.email) {
          try {
            // Format the email content
            const emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">New Reply to Your Inquiry</h2>
                <p>Dear ${customer.name || 'Customer'},</p>
                <p>Our support team has replied to your inquiry: <strong>${inquiry.subject}</strong></p>
                <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #0070f3; margin: 20px 0;">
                  <p style="margin: 0;"><em>${data.message}</em></p>
                </div>
                <p>Please log in to your account to view the full conversation and reply if needed.</p>
                <div style="margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site.com'}/customer-dashboard/inquiries/${params.id}" 
                     style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                    View Inquiry
                  </a>
                </div>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            `;
            
            await transporter.sendMail({
              from: `"JDM Global Support" <${process.env.EMAIL_USER}>`,
              to: customer.email,
              subject: `New Reply to Your Inquiry: ${inquiry.subject}`,
              html: emailContent
            });
            
            console.log(`Email notification sent to ${customer.email}`);
          } catch (emailError) {
            console.error('Error sending email notification:', emailError);
            // Continue execution even if email fails
          }
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        replyId: reply._id,
        message: 'Reply submitted successfully' 
      });
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ 
        error: 'Invalid token: ' + error.message,
        tokenPreview: token?.value ? token.value.substring(0, 20) + '...' : 'No token value'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Error submitting reply:', error);
    return NextResponse.json({ error: 'Failed to submit reply: ' + error.message }, { status: 500 });
  }
} 