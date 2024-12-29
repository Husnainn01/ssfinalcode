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
    const { name, email, country, city, telephone, carDetails } = data;

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const inquiryId = `INQ-${Date.now().toString().slice(-6)}`;

    const mailOptions = {
      from: 'csd@ss-japan.com',
      to: 'csd@ss-japan.com',
      subject: `New Vehicle Inquiry: ${carDetails.model} (${carDetails.year}) - ${inquiryId}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              .header { background-color: #2E0846; color: white; padding: 30px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .header p { margin: 10px 0 0; opacity: 0.9; }
              .inquiry-id { background: #3a0a5c; display: inline-block; padding: 5px 10px; border-radius: 4px; margin-top: 10px; }
              .section { margin: 0; padding: 25px; border-bottom: 1px solid #eee; }
              .section h2 { color: #2E0846; margin-top: 0; font-size: 20px; border-bottom: 2px solid #2E0846; padding-bottom: 8px; }
              .car-image { width: 100%; max-width: 500px; height: auto; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px; }
              .detail-item { padding: 12px; background: #f8f9fa; border-radius: 6px; border-left: 3px solid #2E0846; }
              .detail-item strong { color: #2E0846; display: block; margin-bottom: 4px; }
              .price { font-size: 28px; color: #2E0846; font-weight: bold; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin-top: 20px; }
              .price span { display: block; font-size: 14px; color: #666; margin-top: 5px; }
              .image-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 20px; }
              .image-gallery img { width: 100%; height: 150px; object-fit: cover; border-radius: 6px; }
              .footer { padding: 20px; text-align: center; background: #f8f9fa; }
              .footer img { height: 40px; margin-bottom: 15px; }
              .contact-info { margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; }
              .highlight { background: #ffeb3b33; padding: 2px 5px; border-radius: 3px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="https://ss-japan.com/ss-logo6.png" alt="SS Holdings" style="height: 40px; margin-bottom: 15px;">
                <h1>New Vehicle Inquiry</h1>
                <p>Received on ${currentDate}</p>
                <div class="inquiry-id">Reference ID: ${inquiryId}</div>
              </div>

              <div class="section">
                <h2>🚗 Vehicle Details</h2>
                <img src="${carDetails.images?.[0]}" class="car-image" alt="${carDetails.model}" />
                <div class="details-grid">
                  <div class="detail-item">
                    <strong>Model</strong>
                    ${carDetails.model}
                  </div>
                  <div class="detail-item">
                    <strong>Year</strong>
                    ${carDetails.year}
                  </div>
                  <div class="detail-item">
                    <strong>Make</strong>
                    ${carDetails.make || 'N/A'}
                  </div>
                  <div class="detail-item">
                    <strong>Stock No.</strong>
                    <span class="highlight">${carDetails.stockNo || 'N/A'}</span>
                  </div>
                  <div class="detail-item">
                    <strong>Mileage</strong>
                    ${carDetails.mileage ? carDetails.mileage + ' km' : 'N/A'}
                  </div>
                  <div class="detail-item">
                    <strong>Fuel Type</strong>
                    ${carDetails.fuelType || 'N/A'}
                  </div>
                  <div class="detail-item">
                    <strong>Transmission</strong>
                    ${carDetails.transmission || 'N/A'}
                  </div>
                  <div class="detail-item">
                    <strong>Color</strong>
                    ${carDetails.color || 'N/A'}
                  </div>
                </div>
                <div class="price">
                  $${carDetails.price.toLocaleString()}
                  <span>FOB Japan</span>
                </div>
              </div>

              <div class="section">
                <h2>👤 Customer Information</h2>
                <div class="details-grid">
                  <div class="detail-item">
                    <strong>Name</strong>
                    ${name}
                  </div>
                  <div class="detail-item">
                    <strong>Email</strong>
                    ${email}
                  </div>
                  <div class="detail-item">
                    <strong>Country</strong>
                    ${country}
                  </div>
                  <div class="detail-item">
                    <strong>City</strong>
                    ${city}
                  </div>
                  <div class="detail-item">
                    <strong>Phone</strong>
                    ${telephone}
                  </div>
                  <div class="detail-item">
                    <strong>Inquiry Date</strong>
                    ${currentDate}
                  </div>
                </div>
              </div>

              <div class="section">
                <h2>📸 Additional Images</h2>
                <div class="image-gallery">
                  ${carDetails.images?.slice(1, 4).map(img => `
                    <img src="${img}" alt="${carDetails.model}" />
                  `).join('') || 'No additional images available'}
                </div>
              </div>

              <div class="footer">
                <img src="https://ss-japan.com/ss-logo6.png" alt="SS Holdings" />
                <p><strong>SS Holdings Japan</strong></p>
                <div class="contact-info">
                  <p>📞 Contact: +81-80-4278-4732</p>
                  <p>📧 Email: csd@ss-japan.com</p>
                  <p>🌐 Website: www.ss-japan.com</p>
                </div>
                <p style="margin-top: 20px; font-size: 11px; color: #666;">
                  © ${new Date().getFullYear()} SS Holdings Japan. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Inquiry submitted successfully',
      referenceId: inquiryId
    });

  } catch (error) {
    console.error('Inquiry submission error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to submit inquiry' 
    }, { 
      status: 500 
    });
  }
} 