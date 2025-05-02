import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendVerificationEmail({ email, code }) {
  try {
    await transporter.verify();
    console.log('SMTP connection verified');

    const mailOptions = {
      from: `"JDM Global" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify Your Email - JDM Global",
      text: `Your verification code is: ${code}. This code will expire in 10 minutes.`,
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <!-- Header with Logo -->
          <div style="text-align: center; padding: 20px 0; background-color: #f8f9fa; border-radius: 10px 10px 0 0;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png" alt="JDM Global Logo" style="height: 60px; margin-bottom: 10px;">
            <h1 style="color: #1a365d; margin: 10px 0; font-size: 24px;">Email Verification</h1>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
              Thank you for choosing JDM Global. To complete your registration, please use the verification code below:
            </p>

            <!-- Verification Code Box -->
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <p style="color: #4a5568; font-size: 14px; margin-bottom: 10px;">Your verification code is:</p>
              <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 2px dashed #2b6cb0; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; color: #2b6cb0; letter-spacing: 5px;">${code}</span>
              </div>
              <p style="color: #e53e3e; font-size: 14px; margin-top: 10px;">
                This code will expire in 10 minutes
              </p>
            </div>

            <!-- Security Notice -->
            <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #c53030; margin-bottom: 10px; font-size: 18px;">Security Notice</h3>
              <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
                If you didn't request this verification code, please ignore this email or contact our support team immediately.
              </p>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #f0fff4; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #276749; margin-bottom: 10px; font-size: 18px;">Next Steps</h3>
              <ol style="color: #4a5568; font-size: 14px; line-height: 1.6; margin-left: 20px;">
                <li style="margin-bottom: 8px;">Enter this code on the verification page</li>
                <li style="margin-bottom: 8px;">Complete your profile setup</li>
                <li style="margin-bottom: 8px;">Start exploring our shipping services</li>
              </ol>
            </div>

            <!-- Support Section -->
            <div style="background-color: #ebf8ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #2c5282; margin-bottom: 10px; font-size: 18px;">Need Help?</h3>
              <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
                If you're having trouble with verification, our support team is here to help:
                <br>
                <a href="mailto:support@ssholdings.com" style="color: #2b6cb0; text-decoration: none;">support@ssholdings.com</a>
              </p>
            </div>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #718096; font-size: 14px;">
                Best regards,<br>
                <strong>The JDM Global Team</strong>
              </p>

              <!-- Social Media Links -->
              <div style="margin-top: 20px;">
                <a href="#" style="margin: 0 10px; text-decoration: none;">
                  <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/linkedin.png" alt="LinkedIn" style="height: 24px;">
                </a>
                <a href="#" style="margin: 0 10px; text-decoration: none;">
                  <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/twitter.png" alt="Twitter" style="height: 24px;">
                </a>
              </div>

              <!-- Legal Footer -->
              <p style="color: #a0aec0; font-size: 12px; margin-top: 20px;">
                © ${new Date().getFullYear()} JDM Global. All rights reserved.<br>
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    console.log('Attempting to send verification email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', info.messageId);
    
    return true;
  } catch (error) {
    console.error('Detailed email error:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    });
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

export async function sendWelcomeEmail({ email, firstName, lastName }) {
  try {
    await transporter.verify();
    console.log('SMTP connection verified for welcome email');

    const displayName = firstName ? `${firstName} ${lastName || ''}` : 'Valued Customer';
    
    const mailOptions = {
      from: `"JDM Global" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to JDM Global - Your Trusted Shipping Partner',
      text: `
        Dear ${displayName},
        
        Welcome to JDM Global! We're thrilled to have you join our global shipping community.
        
        Your account has been successfully created, and you now have access to our comprehensive shipping services platform.
        
        Next Steps:
        1. Complete your profile
        2. Explore our shipping services
        3. Track your shipments
        4. Manage your documents
        
        Need assistance? Our dedicated support team is available 24/7.
        
        Best regards,
        The JDM Global Team
      `,
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <!-- Header with Logo -->
          <div style="text-align: center; padding: 20px 0; background-color: #f8f9fa; border-radius: 10px 10px 0 0;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png" alt="JDM Global Logo" style="height: 60px; margin-bottom: 10px;">
            <h1 style="color: #1a365d; margin: 10px 0; font-size: 24px;">Welcome to JDM Global</h1>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">Dear ${displayName},</p>
            
            <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
              Welcome to JDM Global! We're thrilled to have you join our global shipping community. Your account has been successfully created, and you now have access to our comprehensive shipping services platform.
            </p>

            <!-- Getting Started Section -->
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h2 style="color: #2b6cb0; margin-bottom: 15px; font-size: 20px;">Getting Started</h2>
              <ul style="color: #4a5568; font-size: 16px; line-height: 1.6; padding-left: 20px;">
                <li style="margin-bottom: 12px;">Complete your profile information</li>
                <li style="margin-bottom: 12px;">Explore our range of shipping services</li>
                <li style="margin-bottom: 12px;">Set up tracking preferences</li>
                <li style="margin-bottom: 12px;">Review shipping documentation requirements</li>
              </ul>
            </div>

            <!-- Features Highlight -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
              <div style="background-color: #ebf8ff; padding: 15px; border-radius: 8px;">
                <h3 style="color: #2c5282; margin-bottom: 10px; font-size: 16px;">Global Tracking</h3>
                <p style="color: #4a5568; font-size: 14px;">Real-time tracking across our global network</p>
              </div>
              <div style="background-color: #e6fffa; padding: 15px; border-radius: 8px;">
                <h3 style="color: #285e61; margin-bottom: 10px; font-size: 16px;">24/7 Support</h3>
                <p style="color: #4a5568; font-size: 14px;">Dedicated support team always available</p>
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer-dashboard" 
                 style="background-color: #2b6cb0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Access Your Dashboard
              </a>
            </div>

            <!-- Support Section -->
            <div style="background-color: #f0fff4; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #276749; margin-bottom: 10px; font-size: 18px;">Need Assistance?</h3>
              <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
                Our dedicated support team is available 24/7 to assist you with any questions or concerns.
                Contact us at <a href="mailto:support@ssholdings.com" style="color: #2b6cb0; text-decoration: none;">support@ssholdings.com</a>
              </p>
            </div>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #718096; font-size: 14px;">
                Best regards,<br>
                <strong>The JDM Global Team</strong>
              </p>
              
              <!-- Social Media Links -->
              <div style="margin-top: 20px;">
                <a href="#" style="margin: 0 10px; text-decoration: none;">
                  <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/linkedin.png" alt="LinkedIn" style="height: 24px;">
                </a>
                <a href="#" style="margin: 0 10px; text-decoration: none;">
                  <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/twitter.png" alt="Twitter" style="height: 24px;">
                </a>
              </div>

              <!-- Legal Footer -->
              <p style="color: #a0aec0; font-size: 12px; margin-top: 20px;">
                © ${new Date().getFullYear()} JDM Global. All rights reserved.<br>
                This email was sent to you as part of your registration at JDM Global.
              </p>
            </div>
          </div>
        </div>
      `
    };

    console.log('Attempting to send welcome email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
} 