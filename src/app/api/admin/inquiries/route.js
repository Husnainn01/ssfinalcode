import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Get admin info from headers (set by middleware)
    const adminRole = request.headers.get('x-admin-role');
    
    // Check permissions based on role for viewing inquiries
    if (!['admin', 'editor', 'moderator', 'viewer'].includes(adminRole)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions to view inquiries'
      }, { status: 403 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const archived = searchParams.get('archived') || 'false';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Build query
    let query = {};
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Archived filter
    if (archived === 'true') {
      query.isArchived = true;
    } else {
      // For non-archived inquiries, include both where isArchived is false 
      // AND where isArchived doesn't exist
      query.$or = [
        { isArchived: false },
        { isArchived: { $exists: false } }
      ];
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { referenceId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Use the correct collection - customerInquiries
    const inquiryCollection = mongoose.connection.db.collection('customerInquiries');
    
    // Count total documents for each status
    const counts = await Promise.all([
      inquiryCollection.countDocuments({ isArchived: false }),
      inquiryCollection.countDocuments({ status: 'pending', isArchived: false }),
      inquiryCollection.countDocuments({ status: 'answered', isArchived: false }),
      inquiryCollection.countDocuments({ status: 'closed', isArchived: false })
    ]);
    
    // Get sort order
    let sortOrder = {};
    switch (sort) {
      case 'newest':
        sortOrder = { createdAt: -1 };
        break;
      case 'oldest':
        sortOrder = { createdAt: 1 };
        break;
      case 'updated':
        sortOrder = { updatedAt: -1 };
        break;
      case 'priority':
        sortOrder = { 
          status: 1,
          updatedAt: -1 
        };
        break;
      default:
        sortOrder = { createdAt: -1 };
    }
    
    // Get inquiries with pagination
    const skip = (page - 1) * limit;
    const inquiries = await inquiryCollection
      .find(query)
      .sort(sortOrder)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Calculate if there are unread messages
    const inquiriesWithUnread = inquiries.map(inquiry => {
      // Check if there are any replies from customer that haven't been marked as read
      const unreadMessages = inquiry.replies ? 
        inquiry.replies.filter(reply => !reply.isAdmin && !reply.readByAdmin).length : 0;
      
      return {
        ...inquiry,
        unreadMessages
      };
    });
    
    console.log("Fetching inquiries with query:", JSON.stringify(query, null, 2));
    
    return NextResponse.json({
      success: true,
      inquiries: inquiriesWithUnread,
      pagination: {
        total: counts[0],
        page,
        limit,
        totalPages: Math.ceil(counts[0] / limit)
      },
      counts: {
        all: counts[0],
        pending: counts[1],
        answered: counts[2],
        closed: counts[3]
      }
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch inquiries: ' + error.message
    }, { status: 500 });
  }
}

// Helper function to generate mock data for development/testing
function generateMockResponse() {
  const mockInquiries = Array.from({ length: 25 }, (_, i) => {
    const statuses = ["pending", "answered", "closed"];
    const categories = ["vehicle", "general", "support"];
    
    return {
      _id: `inq_${i + 1}`,
      subject: `Inquiry about ${i % 3 === 0 ? "vehicle purchase" : i % 3 === 1 ? "shipping options" : "account issues"}`,
      customer: {
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
      },
      customerName: `Customer ${i + 1}`,
      customerEmail: `customer${i + 1}@example.com`,
      status: statuses[i % 3],
      category: categories[i % 3],
      createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
      updatedAt: new Date(Date.now() - (i * 43200000)).toISOString(),
      unreadMessages: i % 5 === 0 ? 1 : 0,
      referenceId: i % 2 === 0 ? `REF-${1000 + i}` : null
    };
  });
  
  return {
    inquiries: mockInquiries,
    pagination: {
      total: mockInquiries.length,
      page: 1,
      limit: 50,
      totalPages: 1
    },
    counts: {
      all: mockInquiries.length,
      pending: mockInquiries.filter(i => i.status === "pending").length,
      answered: mockInquiries.filter(i => i.status === "answered").length,
      closed: mockInquiries.filter(i => i.status === "closed").length
    }
  };
} 