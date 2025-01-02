import { NextResponse } from 'next/server';

const carMakes = [
  "Toyota",
  "Honda",
  "Nissan",
  "Mazda",
  "Mitsubishi",
  "Subaru",
  "Suzuki",
  "Lexus",
  "Daihatsu",
  "Isuzu",
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Volkswagen",
  "Hyundai",
  "Kia",
  "Ford",
  "Chevrolet"
].sort();

export async function GET() {
  try {
    return NextResponse.json(carMakes);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch makes' }, { status: 500 });
  }
} 