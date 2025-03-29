import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { verifyAuth } from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(request) {
  try {
    // Configure Cloudinary with your credentials
    cloudinary.v2.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Verify authentication using your existing methods
    const cookieStore = cookies();
    const authToken = cookieStore.get('token');
    
    if (!authToken) {
      const headerToken = request.headers.get('authorization')?.split(' ')[1];
      if (!headerToken) {
        return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
      }
      
      const validToken = await verifyToken(headerToken);
      if (!validToken) {
        return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
      }
    } else {
      // Verify the cookie token
      const validToken = await verifyToken(authToken.value);
      if (!validToken) {
        return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
      }
    }

    // Create an array to store all found documents
    const allDocuments = [];
    
    // Define categories to check
    const categories = [
      'invoice',
      'purchase_agreement',
      'customs_document',
      'shipping_document',
      'other'
    ];
    
    // Define resource types to check
    const resourceTypes = ['image', 'raw', 'video'];
    
    console.log("Starting document search...");
    
    // Check for resources in each category and resource type
    for (const category of categories) {
      console.log(`Checking category: ${category}`);
      
      // For each resource type (image, raw, video)
      for (const resourceType of resourceTypes) {
        try {
          // IMPORTANT FIX: Use proper path structure - "upload" as the type parameter
          const result = await cloudinary.v2.api.resources({
            type: 'upload',
            resource_type: resourceType,
            prefix: category,
            max_results: 50
          });
          
          if (result.resources && result.resources.length > 0) {
            console.log(`Found ${result.resources.length} ${resourceType} resources in ${category}`);
            
            // Process each resource and add category information
            const processedDocs = result.resources.map(resource => ({
              ...resource,
              category: category,
              name: resource.public_id.split('/').pop(),
              resourceType: resourceType,
              dateAdded: new Date(resource.created_at).toISOString(),
              cloudinaryId: resource.public_id,
              fileSize: resource.bytes
            }));
            
            allDocuments.push(...processedDocs);
          }
        } catch (error) {
          console.log(`Error checking ${resourceType} resources in ${category}, trying other resource types`, error.error || error);
        }
      }
      
      // Also check for documents in the "documents/{category}" folder structure
      try {
        const folderPath = `documents/${category}`;
        for (const resourceType of resourceTypes) {
          try {
            const result = await cloudinary.v2.api.resources({
              type: 'upload',
              resource_type: resourceType,
              prefix: folderPath,
              max_results: 50
            });
            
            if (result.resources && result.resources.length > 0) {
              console.log(`Found ${result.resources.length} ${resourceType} resources in ${folderPath}`);
              
              const processedDocs = result.resources.map(resource => ({
                ...resource,
                category: category,
                name: resource.public_id.split('/').pop(),
                resourceType: resourceType,
                dateAdded: new Date(resource.created_at).toISOString(),
                cloudinaryId: resource.public_id,
                fileSize: resource.bytes
              }));
              
              allDocuments.push(...processedDocs);
            }
          } catch (error) {
            console.log(`Error checking ${resourceType} resources in ${folderPath}, trying other resource types`, error.error || error);
          }
        }
      } catch (error) {
        console.log(`Error checking documents/${category} folder`, error.error || error);
      }
    }
    
    // Try searching by tags as a fallback (if no documents were found by prefix)
    if (allDocuments.length === 0) {
      try {
        console.log("Trying to find documents by tags...");
        for (const resourceType of resourceTypes) {
          for (const category of categories) {
            try {
              const result = await cloudinary.v2.api.resources_by_tag(
                category,
                { resource_type: resourceType, max_results: 50 }
              );
              
              if (result.resources && result.resources.length > 0) {
                console.log(`Found ${result.resources.length} ${resourceType} resources with tag '${category}'`);
                
                const processedDocs = result.resources.map(resource => ({
                  ...resource,
                  category: category,
                  name: resource.public_id.split('/').pop(),
                  resourceType: resourceType,
                  dateAdded: new Date(resource.created_at).toISOString(),
                  cloudinaryId: resource.public_id,
                  fileSize: resource.bytes
                }));
                
                allDocuments.push(...processedDocs);
              }
            } catch (error) {
              console.log(`Error checking for tag ${category} in ${resourceType} resources`, error.error || error);
            }
          }
        }
      } catch (error) {
        console.log("Error searching by tags", error);
      }
    }
    
    console.log(`Document search complete. Found ${allDocuments.length} documents in total.`);
    
    if (allDocuments.length === 0) {
      console.log("No documents found");
      return NextResponse.json({
        success: true,
        message: "No documents found",
        documents: []
      });
    }
    
    return NextResponse.json({
      success: true,
      documents: allDocuments
    });
    
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// Helper function to get file extension from path or format
function getFileExtension(path) {
  if (!path) return "";
  const parts = path.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

// Helper function to create a friendly document name
function formatDocumentName(fileName, category) {
  // First check if it's a gibberish Cloudinary-generated name
  // These are typically random alphanumeric strings
  if (/^[a-z0-9]{10,}$/i.test(fileName)) {
    // Create a friendly name based on category and date
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const categoryNames = {
      'invoice': 'Invoice',
      'purchase_agreement': 'Purchase Agreement',
      'customs_document': 'Customs Document',
      'shipping_document': 'Shipping Document',
      'other': 'Document'
    };
    
    const extension = getFileExtension(fileName);
    const displayName = `${categoryNames[category] || 'Document'} (${dateStr})`;
    
    return extension ? `${displayName}.${extension}` : displayName;
  }
  
  // If not gibberish, use the original name
  return fileName;
} 