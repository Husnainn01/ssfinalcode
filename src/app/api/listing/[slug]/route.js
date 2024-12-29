import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Car from '@/models/Car';
import slugify from 'slugify';

// GET method - Get car by slug
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { slug } = params;
    const car = await Car.findOne({ slug });
    
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
    
    // Generate slug from title
    const slug = slugify(data.title, {
      lower: true,
      strict: true
    });

    // Handle images array properly
    const carData = {
      ...data,
      slug,
      images: data.images || [], // Ensure images array exists
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
        fetch(`${baseUrl}/api/revalidate?path=/admin/dashboard/listing&t=${timestamp}`)
      ]);
    } catch (revalidateError) {
      console.error('Revalidation error:', revalidateError);
      // Continue even if revalidation fails
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

    // Ensure images array is properly handled
    if (data.images) {
      console.log('New image order:', data.images);
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
      const timestamp = Date.now();
      await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/revalidate?path=/cars/${slug}&t=${timestamp}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/revalidate?path=/admin/dashboard/listing&t=${timestamp}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/revalidate?path=/cars&t=${timestamp}`)
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