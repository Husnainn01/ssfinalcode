import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

async function verifyTurnstileToken(token) {
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    }
  )

  const data = await response.json()
  return data.success
}

export async function POST(req) {
  try {
    const { firstName, lastName, email, subject, message, to, turnstileToken } = await req.json()

    // Verify Turnstile token
    const isTokenValid = await verifyTurnstileToken(turnstileToken)
    if (!isTokenValid) {
      return NextResponse.json(
        { error: 'Invalid security token' },
        { status: 400 }
      )
    }

    // Rate limiting (optional but recommended)
    // You can implement rate limiting here using Redis or similar

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
    })

    // Enhanced HTML Email Template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9fafb;
            }
            .email-wrapper {
              background-color: #f9fafb;
              padding: 40px 20px;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .header {
              background-color: #629584;
              color: white;
              padding: 30px 40px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .header p {
              margin: 10px 0 0;
              opacity: 0.9;
              font-size: 16px;
            }
            .content {
              padding: 40px;
            }
            .info-section {
              margin-bottom: 30px;
              padding: 20px;
              background-color: #f8fafc;
              border-radius: 8px;
            }
            .info-row {
              margin-bottom: 20px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 15px;
            }
            .info-row:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .label {
              font-weight: 600;
              color: #629584;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 8px;
            }
            .value {
              color: #1f2937;
              font-size: 16px;
            }
            .message-box {
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              padding: 20px 40px;
              background-color: #f8fafc;
              color: #6b7280;
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
            }
            .timestamp {
              color: #9ca3af;
              font-size: 12px;
              margin-top: 10px;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #629584;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin-top: 20px;
            }
            @media only screen and (max-width: 600px) {
              .header, .content, .footer {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <div class="header">
                <h1>New Contact Form Submission</h1>
                <p>You've received a new message from your website</p>
              </div>
              
              <div class="content">
                <div class="info-section">
                  <div class="info-row">
                    <div class="label">Contact Information</div>
                    <div class="value">
                      ${firstName} ${lastName}<br>
                      <a href="mailto:${email}" style="color: #629584; text-decoration: none;">${email}</a>
                    </div>
                  </div>

                  <div class="info-row">
                    <div class="label">Subject</div>
                    <div class="value">${subject}</div>
                  </div>

                  <div class="info-row">
                    <div class="label">Message</div>
                    <div class="value message-box">
                      ${message.replace(/\n/g, '<br />')}
                    </div>
                  </div>
                </div>

                <div style="text-align: center;">
                  <a href="mailto:${email}" class="button">Reply to ${firstName}</a>
                </div>
              </div>

              <div class="footer">
                <p>This is an automated email from SS Holdings Contact Form</p>
                <p>© ${new Date().getFullYear()} SS Holdings. All rights reserved.</p>
                <div class="timestamp">
                  Received on ${new Date().toLocaleString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: to,
      subject: `New Contact Form Message: ${subject}`,
      html: htmlTemplate,
      // Fallback plain text version
      text: `
        New Contact Form Submission

        From: ${firstName} ${lastName}
        Email: ${email}
        Subject: ${subject}

        Message:
        ${message}

        Received on: ${new Date().toLocaleString()}

        © ${new Date().getFullYear()} SS Holdings. All rights reserved.
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Message sent: %s', info.messageId)

    return NextResponse.json({ 
      message: 'Email sent successfully',
      messageId: info.messageId 
    })

  } catch (error) {
    console.error('Failed to send email:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send email', 
        details: error.message 
      },
      { status: 500 }
    )
  }
} 