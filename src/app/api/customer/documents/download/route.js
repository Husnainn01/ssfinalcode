import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Download API - Cloudinary cloud name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

export async function GET(request) {
  try {
    // Get document ID from query parameters
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');
    const resourceType = searchParams.get('resourceType') || 'raw';
    
    if (!documentId) {
      return NextResponse.json({
        success: false,
        message: 'Document ID is required'
      }, { status: 400 });
    }
    
    // Verify authentication
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ 
        success: false,
        message: 'Authentication required' 
      }, { status: 401 });
    }
    
    try {
      // Verify JWT
      jwt.verify(token, process.env.JWT_SECRET);
      
      // Generate download URL from Cloudinary
      console.log(`Generating download URL for document ID: ${documentId}, resource type: ${resourceType}`);
      
      // Generate a download URL (set attachment: true to force download)
      const downloadUrl = cloudinary.v2.url(documentId, {
        resource_type: resourceType,
        flags: 'attachment'
      });
      
      return NextResponse.json({
        success: true,
        downloadUrl,
        message: 'Download URL generated'
      });
    } catch (error) {
      console.error('Error generating download URL:', error);
      return NextResponse.json({ 
        success: false,
        message: 'Error generating download URL',
        error: error.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing download request:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
} 