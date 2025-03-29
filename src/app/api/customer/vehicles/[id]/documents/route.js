import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with the correct environment variable names
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log("Cloudinary cloud name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
console.log("Cloudinary config status:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? "Configured" : "Missing");

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    console.log(`Fetching documents for vehicle ID: ${id}`);
    
    // Verify customer authentication
    const cookieStore = cookies();
    const token = cookieStore.get('customer_token') || cookieStore.get('token');
    
    if (!token) {
      return NextResponse.json({ 
        success: false,
        message: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }
    
    try {
      // First check if we have document records in the documents collection
      let documentRecords = [];
      try {
        documentRecords = await mongoose.connection.db.collection('documents')
          .find({ vehicleId: id })
          .sort({ uploadedAt: -1 })
          .toArray();
        
        if (documentRecords.length === 0 && ObjectId.isValid(id)) {
          // Try with ObjectId
          documentRecords = await mongoose.connection.db.collection('documents')
            .find({ vehicleId: new ObjectId(id) })
            .sort({ uploadedAt: -1 })
            .toArray();
        }
      } catch (err) {
        console.error('Error fetching document records:', err);
      }
      
      // If we have document records, use them
      if (documentRecords.length > 0) {
        const formattedDocs = documentRecords.map(doc => ({
          id: doc._id.toString(),
          name: doc.name || doc.fileName || 'Unnamed Document',
          type: doc.type || doc.fileType || getFileTypeFromPath(doc.path || doc.url || ''),
          url: doc.url || '',
          cloudinaryId: doc.cloudinaryId || '',
          dateAdded: doc.uploadedAt || doc.dateAdded || new Date(),
          fileSize: doc.fileSize || doc.size || 0,
          category: doc.category || getDocumentCategory(doc)
        }));
        
        return NextResponse.json({
          success: true,
          documents: formattedDocs
        });
      }
      
      // Get vehicle data
      const vehicle = await mongoose.connection.db.collection('agreedvehicles')
        .findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : id });
      
      if (!vehicle) {
        return NextResponse.json({
          success: false, 
          message: 'Vehicle not found'
        }, { status: 404 });
      }
      
      // Based on the folder structure seen in the screenshot
      const documentCategories = [
        'customs_document',
        'invoice',
        'purchase_agreement', 
        'shipping_document',
        'other'
      ];
      
      let allDocuments = [];
      
      // Based on the screenshot, we can see the exact folder structure
      // Let's directly fetch resources from each category folder for this vehicle ID
      for (const category of documentCategories) {
        try {
          console.log(`Directly checking documents/${category}/${id}/`);
          
          // Try image resources first
          try {
            const imageResources = await cloudinary.api.resources({
              type: 'upload',
              prefix: `documents/${category}/${id}`,
              max_results: 100,
              resource_type: 'image'
            });
            
            console.log(`Found ${imageResources.resources?.length || 0} image resources in ${category}/${id}`);
            
            if (imageResources.resources && imageResources.resources.length > 0) {
              const docs = imageResources.resources.map(resource => {
                // Get the original name from the path or create a friendly name
                const rawFileName = getFileNameFromPath(resource.public_id);
                let displayName = rawFileName;
                
                // If it looks like a gibberish name (random characters), use a more friendly name
                if (/^[a-z0-9]{10,}$/i.test(rawFileName) && !rawFileName.includes('.')) {
                  // Create a friendly name based on document category and format
                  const fileExt = resource.format || 'jpg';
                  displayName = `${formatCategoryName(category)} (${formatDate(resource.created_at)}).${fileExt}`;
                }
                
                return {
                  id: resource.public_id,
                  name: displayName,
                  originalName: rawFileName,
                  type: resource.format || getFileTypeFromPath(resource.public_id) || 'jpg',
                  cloudinaryId: resource.public_id,
                  url: resource.secure_url,
                  dateAdded: new Date(resource.created_at),
                  fileSize: resource.bytes,
                  category: category,
                  resourceType: 'image'
                };
              });
              
              allDocuments = [...allDocuments, ...docs];
            }
          } catch (imageErr) {
            console.log(`No image resources found in ${category}/${id}: ${imageErr.message}`);
          }
          
          // Try raw resources (PDFs, docs, etc.)
          try {
            const rawResources = await cloudinary.api.resources({
              type: 'upload',
              prefix: `documents/${category}/${id}`,
              max_results: 100,
              resource_type: 'raw'
            });
            
            console.log(`Found ${rawResources.resources?.length || 0} raw resources in ${category}/${id}`);
            
            if (rawResources.resources && rawResources.resources.length > 0) {
              const docs = rawResources.resources.map(resource => ({
                id: resource.public_id,
                name: getFileNameFromPath(resource.public_id),
                type: getFileTypeFromPath(resource.public_id) || 'pdf',
                cloudinaryId: resource.public_id,
                url: resource.secure_url,
                dateAdded: new Date(resource.created_at),
                fileSize: resource.bytes,
                category: category,
                resourceType: 'raw'
              }));
              
              allDocuments = [...allDocuments, ...docs];
            }
          } catch (rawErr) {
            console.log(`No raw resources found in ${category}/${id}: ${rawErr.message}`);
          }
          
          // Try video resources (just in case)
          try {
            const videoResources = await cloudinary.api.resources({
              type: 'upload',
              prefix: `documents/${category}/${id}`,
              max_results: 100,
              resource_type: 'video'
            });
            
            console.log(`Found ${videoResources.resources?.length || 0} video resources in ${category}/${id}`);
            
            if (videoResources.resources && videoResources.resources.length > 0) {
              const docs = videoResources.resources.map(resource => ({
                id: resource.public_id,
                name: getFileNameFromPath(resource.public_id),
                type: getFileTypeFromPath(resource.public_id) || 'mp4',
                cloudinaryId: resource.public_id,
                url: resource.secure_url,
                dateAdded: new Date(resource.created_at),
                fileSize: resource.bytes,
                category: category,
                resourceType: 'video'
              }));
              
              allDocuments = [...allDocuments, ...docs];
            }
          } catch (videoErr) {
            console.log(`No video resources found in ${category}/${id}: ${videoErr.message}`);
          }
          
        } catch (err) {
          console.error(`Error checking ${category}/${id}:`, err.message);
        }
      }
      
      // If we found documents
      if (allDocuments.length > 0) {
        console.log(`Found a total of ${allDocuments.length} documents for vehicle ${id}`);
        return NextResponse.json({
          success: true,
          documents: allDocuments
        });
      }
      
      // No documents found
      console.log(`No documents found for vehicle ${id}`);
      return NextResponse.json({
        success: true,
        documents: [],
        message: 'No documents found for this vehicle'
      });
    } catch (error) {
      console.error('Error processing request:', error);
      return NextResponse.json({ 
        success: false,
        message: 'Error processing request',
        error: error.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
}

// Helper function to extract file name from path
function getFileNameFromPath(path) {
  if (!path) return 'Unnamed Document';
  const parts = path.split('/');
  return parts[parts.length - 1];
}

// Helper function to extract file type from path
function getFileTypeFromPath(path) {
  if (!path) return '';
  const parts = path.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

// Helper function to determine document category from metadata
function getDocumentCategory(doc) {
  if (!doc) return 'other';
  
  const name = (doc.name || doc.fileName || '').toLowerCase();
  const type = (doc.type || doc.fileType || '').toLowerCase();
  
  if (name.includes('customs') || name.includes('import') || name.includes('export')) {
    return 'customs_document';
  } else if (name.includes('invoice') || name.includes('bill') || name.includes('receipt')) {
    return 'invoice';
  } else if (name.includes('purchase') || name.includes('agreement') || name.includes('contract')) {
    return 'purchase_agreement';
  } else if (name.includes('shipping') || name.includes('transport') || name.includes('delivery')) {
    return 'shipping_document';
  }
  
  return 'other';
}

// Add this function to the file for formatting category names
function formatCategoryName(category) {
  if (!category) return 'Document';
  
  const words = category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  );
  
  return words.join(' ');
}

// And a simple date formatting function
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch (err) {
    return 'Unknown Date';
  }
} 