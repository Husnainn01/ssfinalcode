import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/dbConnect';
import Document from '@/models/Document';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    console.log('Delete request for document ID:', id);
    
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
    
    // Verify the token with multiple keys
    const user = await verifyTokenWithMultipleKeys(tokenToUse);
    
    if (!user) {
      console.log('Token verification failed after trying all keys');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid authentication token' 
      }, { status: 401 });
    }
    
    console.log('User authenticated for delete:', user);
    
    // Connect to database
    await dbConnect();
    
    // Find document to delete
    const document = await Document.findById(id);
    
    if (!document) {
      console.log('Document not found:', id);
      return NextResponse.json({
        success: false,
        error: 'Document not found'
      }, { status: 404 });
    }
    
    // If document has a publicId, delete from Cloudinary
    if (document.publicId) {
      try {
        console.log('Deleting from Cloudinary:', document.publicId);
        await cloudinary.uploader.destroy(document.publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }
    
    // Delete from database
    const result = await Document.findByIdAndDelete(id);
    
    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete document'
      }, { status: 500 });
    }
    
    console.log('Document successfully deleted:', id);
    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });
    
  } catch (error) {
    console.error('Error in delete handler:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete document'
    }, { status: 500 });
  }
} 