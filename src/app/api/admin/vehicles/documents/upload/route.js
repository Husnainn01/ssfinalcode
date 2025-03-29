import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Document from '@/models/Document';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Update the folderPath to use this structure
const getDocumentFolder = (type) => {
  const folderMap = {
    'invoice': 'invoices',
    'purchase_agreement': 'purchase-agreements',
    'shipping_document': 'shipping',
    'customs_document': 'customs',
    'other': 'other'
  };
  return folderMap[type] || 'other';
};

// Get all potential secret keys
const getSecretKeys = () => {
  const secrets = [
    process.env.JWT_SECRET || 'chendanvasu',
    process.env.JWT_SECRET_KEY,
    'chendanvasu' // Hardcoded fallback
  ].filter(Boolean);
  
  return secrets.map(secret => new TextEncoder().encode(secret));
};

// Try to verify with multiple potential keys
async function verifyTokenWithMultipleKeys(token) {
  const secretKeys = getSecretKeys();
  console.log(`Attempting verification with ${secretKeys.length} possible keys`);
  
  for (const key of secretKeys) {
    try {
      const { payload } = await jwtVerify(token, key);
      console.log('Token verified successfully with key:', payload);
      return payload;
    } catch (err) {
      console.log('Verification failed with a key, trying next...');
    }
  }
  
  console.error('Failed to verify with any known keys');
  return null;
}

export async function POST(request) {
  try {
    // Get cookies
    const cookieStore = cookies();
    console.log('Available cookies:', cookieStore.getAll().map(c => c.name));
    
    const adminToken = cookieStore.get('admin_token')?.value;
    const customerToken = cookieStore.get('customer_token')?.value;
    const token = cookieStore.get('token')?.value;
    
    // Log which token we're using
    let tokenToUse = null;
    if (adminToken) {
      console.log('Using admin token');
      tokenToUse = adminToken;
    } else if (customerToken) {
      console.log('Using customer token');
      tokenToUse = customerToken;
    } else if (token) {
      console.log('Using token');
      tokenToUse = token;
    }
    
    if (!tokenToUse) {
      console.log('No authentication token found in cookies');
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }
    
    // Verify the token
    const user = await verifyTokenWithMultipleKeys(tokenToUse);
    
    if (!user) {
      console.log('Token verification failed after trying all keys');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid authentication token' 
      }, { status: 401 });
    }
    
    console.log('User authenticated:', user);
    
    // Connect to database
    await dbConnect();
    
    // Process form data
    const formData = await request.formData();
    
    // Log all form fields for debugging
    console.log("Form data received:");
    for (const [key, value] of formData.entries()) {
      console.log(`- ${key}: ${value instanceof File ? value.name : value}`);
    }
    
    // Validate required fields
    const file = formData.get('file');
    const vehicleId = formData.get('vehicleId');
    const documentType = formData.get('documentType');
    
    const missingFields = [];
    if (!file) missingFields.push('file');
    if (!vehicleId) missingFields.push('vehicleId');
    if (!documentType) missingFields.push('documentType');
    
    if (missingFields.length > 0) {
      console.log(`Missing required fields: ${missingFields.join(', ')}`);
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        missingFields
      }, { status: 400 });
    }
    
    // Validate file is actually a File object
    if (!(file instanceof File)) {
      console.log('File is not a valid File object');
      return NextResponse.json({
        success: false,
        error: 'Invalid file format'
      }, { status: 400 });
    }
    
    // Get file buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Define folder structure
    const folder = `documents/${documentType}/${vehicleId}`;
    console.log(`Uploading to Cloudinary folder: ${folder}`);
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      // Use stream to upload
      const { Readable } = require('stream');
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
    
    console.log('Cloudinary upload successful:', result.secure_url);
    
    // Create document record
    const document = new Document({
      name: file.name,
      originalName: file.name,
      type: documentType,
      vehicleId,
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
      uploadedBy: user.userId || user.id,
      uploadedAt: new Date(),
    });
    
    const savedDocument = await document.save();
    console.log('Document saved to database:', savedDocument._id);
    
    return NextResponse.json({
      success: true,
      document: savedDocument
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Upload failed'
    }, { status: 500 });
  }
} 