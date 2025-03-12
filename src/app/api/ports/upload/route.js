import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import dbConnect from '@/lib/dbConnect';
import Port from '@/models/Port';

export async function POST(request) {
  try {
    await dbConnect();
    
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file buffer to array buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Assume first sheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        { error: 'The uploaded file contains no data' },
        { status: 400 }
      );
    }

    // Valid regions
    const validRegions = ['Africa', 'Asia', 'Europe', 'Middle East', 'Oceania'];

    // Validate and transform the data
    const processedData = jsonData.map((row, index) => {
      const rowNumber = index + 2; // Excel starts at 1 and we have headers

      // Get values with different possible column names
      const region = row.Region || row['region'] || row['REGION'];
      const portName = row['Port Name'] || row['port_name'] || row['PORT NAME'] || row.name;
      const country = row.Country || row['country'] || row['COUNTRY'];
      const isActive = row['Is Active'] || row['is_active'] || row['IS ACTIVE'];

      // Validate required fields
      if (!region || !portName || !country) {
        throw new Error(
          `Row ${rowNumber} is missing required fields. Region, Port Name, and Country are required.`
        );
      }

      // Validate region
      if (!validRegions.includes(region)) {
        throw new Error(
          `Invalid region "${region}" in row ${rowNumber}. Must be one of: ${validRegions.join(', ')}`
        );
      }

      return {
        region: region.trim(),
        name: portName.toString().trim().toUpperCase(),
        country: country.toString().trim(),
        isActive: isActive === 'TRUE' || isActive === true || isActive === 1
      };
    });

    // Insert the validated data
    await Port.insertMany(processedData);

    return NextResponse.json({ 
      message: 'Ports data processed successfully',
      count: processedData.length 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process file',
        details: 'Please ensure your Excel file has all required columns with correct data formats.'
      },
      { status: 500 }
    );
  }
} 