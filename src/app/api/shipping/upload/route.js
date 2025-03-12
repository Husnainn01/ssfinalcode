import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import dbConnect from '@/lib/dbConnect';
import ShippingSchedule from '@/models/ShippingSchedule';

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

    // First, validate that we have data
    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        { error: 'The uploaded file contains no data' },
        { status: 400 }
      );
    }

    // Log the first row to help with debugging
    console.log('First row data:', jsonData[0]);

    // Validate and transform the data before insertion
    const processedData = jsonData.map((row, index) => {
      // Validate required fields first
      const rowNumber = index + 2; // Add 2 because Excel starts at 1 and we have headers
      const missingFields = [];

      // Check for voyage number
      const voyageNo = row.voyageNo || row['VOY NO'] || row['Voyage No'] || row['VOYAGE NO'];
      if (!voyageNo) missingFields.push('Voyage Number');

      // Check for company
      const company = row.company || row['Company'] || row['COMPANY'] || row['Shipping Company'];
      if (!company) missingFields.push('Company');

      // Check for ship name
      const shipName = row.shipName || row['Ship Name'] || row['SHIP NAME'] || row['Vessel Name'];
      if (!shipName) missingFields.push('Ship Name');

      // Check for estimated time
      const estimatedTime = row.estimatedTime || row['Estimated Time'] || row['EST'] || row['EST TIME'];
      if (!estimatedTime) missingFields.push('Estimated Time');

      // Check for departure date
      const departureDateRaw = row.departureDate || row['Departure Date'] || row['DEPARTURE DATE'] || row['Departure'];
      if (!departureDateRaw) missingFields.push('Departure Date');

      // If any required fields are missing, throw an error
      if (missingFields.length > 0) {
        throw new Error(
          `Row ${rowNumber} is missing required fields: ${missingFields.join(', ')}`
        );
      }

      // Parse the date
      let parsedDate;
      if (typeof departureDateRaw === 'string') {
        // Try different date formats
        parsedDate = new Date(departureDateRaw);
      } else if (typeof departureDateRaw === 'number') {
        // Handle Excel serial number date format
        parsedDate = XLSX.SSF.parse_date_code(departureDateRaw);
      }

      // Validate the parsed date
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        throw new Error(
          `Invalid date format in row ${rowNumber} for voyage number ${voyageNo}. ` +
          'Please use YYYY-MM-DD format.'
        );
      }

      // Handle ports data
      const japanPorts = row.japanPorts || row['Japan Ports'] || row['JAPAN PORTS'] || '';
      const destinationPorts = row.destinationPorts || row['Destination Ports'] || row['DESTINATION PORTS'] || '';

      return {
        voyageNo: voyageNo.toString().trim(),
        company: company.toString().trim(),
        shipName: shipName.toString().trim(),
        japanPorts: typeof japanPorts === 'string' 
          ? japanPorts.split(',').map(port => port.trim()).filter(Boolean)
          : Array.isArray(japanPorts) 
            ? japanPorts
            : [],
        destinationPorts: typeof destinationPorts === 'string'
          ? destinationPorts.split(',').map(port => port.trim()).filter(Boolean)
          : Array.isArray(destinationPorts)
            ? destinationPorts
            : [],
        estimatedTime: parseInt(estimatedTime),
        departureDate: parsedDate,
        isActive: true
      };
    });

    // Insert the validated data into the database
    await ShippingSchedule.insertMany(processedData);

    return NextResponse.json({ 
      message: 'File processed successfully',
      count: processedData.length 
    });

  } catch (error) {
    console.error('Upload error details:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process file',
        details: 'Please ensure your Excel file has all required columns with correct data formats.'
      },
      { status: 500 }
    );
  }
} 