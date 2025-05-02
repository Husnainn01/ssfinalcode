import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function POST(request) {
  try {
    const data = await request.json();
    const { searchParams } = data;
    
    // Format search parameters for email
    const searchDetails = Object.entries(searchParams)
      .map(([key, value]) => `${key}: ${value || 'Any'}`)
      .join('\n');

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Create email template
    const mailOptions = {
      from: 'csd@ss-japan.com',
      to: 'csd@ss-japan.com',
      subject: 'New Vehicle Alert Subscription',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2E0846; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .search-params { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
              .footer { text-align: center; padding-top: 20px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>New Vehicle Alert Subscription</h2>
                <p>Received on ${currentDate}</p>
              </div>
              
              <div class="content">
                <h3>Search Parameters:</h3>
                <div class="search-params">
                  <pre>${searchDetails}</pre>
                </div>
                
                <p>The user has subscribed to receive email alerts for vehicles matching these criteria.</p>
              </div>

              <div class="footer">
                <p>© ${new Date().getFullYear()} JDM Global. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ 
      success: true,
      message: 'Alert subscription email sent successfully'
    });

  } catch (error) {
    console.error('Alert subscription error:', error);
    return NextResponse.json({ 
      error: 'Failed to set alert' 
    }, { 
      status: 500 
    });
  }
} 