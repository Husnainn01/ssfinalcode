import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Car from '@/models/Car';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const car = await Car.findById(id);
    if (!car) {
      return NextResponse.json(
        { message: 'Car not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(car);

  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching car' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const data = await request.json();

    console.log('Updating car with ID:', id);
    console.log('Update data:', data);

    // Ensure images array is properly handled
    if (data.images) {
      console.log('New image order:', data.images);
    }

    // Update the car with new data
    const updatedCar = await Car.findByIdAndUpdate(
      id,
      { 
        $set: {
          ...data,
          // Ensure images array is set exactly as provided
          images: data.images || []
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedCar) {
      console.log('Car not found');
      return NextResponse.json(
        { message: 'Car not found' },
        { status: 404 }
      );
    }

    console.log('Successfully updated car:', updatedCar);

    // Force revalidation
    try {
      const timestamp = Date.now();
      await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/revalidate?path=/cars/${id}&t=${timestamp}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/revalidate?path=/admin/dashboard/listing&t=${timestamp}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/revalidate?path=/cars&t=${timestamp}`),
      ]);
    } catch (revalidateError) {
      console.error('Revalidation error:', revalidateError);
      // Continue with the response even if revalidation fails
    }

    return NextResponse.json(updatedCar);

  } catch (error) {
    console.error('Error updating car:', error);
    return NextResponse.json(
      { message: error.message || 'Error updating car' },
      { status: 500 }
    );
  }
} 