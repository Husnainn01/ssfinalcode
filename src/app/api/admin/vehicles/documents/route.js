import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Document from '@/models/Document';
import mongoose from 'mongoose';
import AdminUser from '@/models/AdminUser';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Get the vehicleId from query params
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');

    let query = {};
    if (vehicleId) {
      query.vehicleId = vehicleId;
    }

    // Fetch documents with populated vehicle data
    const documents = await Document.find(query)
      .populate({
        path: 'vehicleId',
        select: 'make model year stockNumber'
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    // Format the documents
    const formattedDocuments = documents.map(doc => ({
      ...doc,
      vehicleInfo: doc.vehicleId ? 
        `${doc.vehicleId.year} ${doc.vehicleId.make} ${doc.vehicleId.model} (HSW-${doc.vehicleId.stockNumber})` : 
        null
    }));

    return NextResponse.json({
      success: true,
      documents: formattedDocuments
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 