import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Car from '@/models/Car';
import slugify from 'slugify';

// GET method - Get car by slug and section
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    // Build query based on section if provided
    const query = section ? { slug, section } : { slug };
    const car = await Car.findOne(query);
    
    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(car);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch car' },
      { status: 500 }
    );
  }
}

// POST method - Create new car listing
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Validate section
    if (!['recent', 'popular'].includes(data.section)) {
      return NextResponse.json(
        { error: 'Invalid section. Must be either "recent" or "popular".' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = slugify(data.title, {
      lower: true,
      strict: true
    });

    // Handle images array properly
    const carData = {
      ...data,
      slug,
      images: data.images || [],
      section: data.section, // Ensure section is set
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const car = await Car.create(carData);
    
    // Fix revalidation URLs
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`;
      const timestamp = Date.now();
      await Promise.all([
        fetch(`${baseUrl}/api/revalidate?path=/cars&t=${timestamp}`),
        fetch(`${baseUrl}/api/revalidate?path=/admin/dashboard/listing&t=${timestamp}`),
        // Add section-specific revalidation
        fetch(`${baseUrl}/api/revalidate?path=/cars/${data.section}&t=${timestamp}`)
      ]);
    } catch (revalidateError) {
      console.error('Revalidation error:', revalidateError);
    }

    return NextResponse.json(
      { message: 'Car listing created successfully', car },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating car listing:', error);
    return NextResponse.json(
      { error: 'Failed to create car listing', details: error.message },
      { status: 500 }
    );
  }
}

// PUT method - Update car by slug
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { slug } = params;
    const data = await request.json();

    // Validate section if it's being updated
    if (data.section && !['recent', 'popular'].includes(data.section)) {
      return NextResponse.json(
        { error: 'Invalid section. Must be either "recent" or "popular".' },
        { status: 400 }
      );
    }

    const updatedCar = await Car.findOneAndUpdate(
      { slug },
      { 
        $set: {
          ...data,
          images: data.images || [],
          updatedAt: new Date()
        }
      },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedCar) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    // Force revalidation
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const timestamp = Date.now();
      await Promise.all([
        fetch(`${baseUrl}/api/revalidate?path=/cars/${slug}&t=${timestamp}`),
        fetch(`${baseUrl}/api/revalidate?path=/admin/dashboard/listing&t=${timestamp}`),
        fetch(`${baseUrl}/api/revalidate?path=/cars&t=${timestamp}`),
        // Add section-specific revalidation
        fetch(`${baseUrl}/api/revalidate?path=/cars/${updatedCar.section}&t=${timestamp}`)
      ]);
    } catch (revalidateError) {
      console.error('Revalidation error:', revalidateError);
    }

    return NextResponse.json(updatedCar);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update car', details: error.message },
      { status: 500 }
    );
  }
}