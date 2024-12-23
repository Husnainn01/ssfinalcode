import { NextResponse } from 'next/server';

const carModels = {
  "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Land Cruiser", "Prius", "Yaris", "Crown"],
  "Honda": ["Civic", "Accord", "CR-V", "HR-V", "Pilot", "Fit", "Odyssey"],
  "Nissan": ["Altima", "Sentra", "Rogue", "Pathfinder", "X-Trail", "Murano", "GT-R"],
  "Mazda": ["Mazda3", "Mazda6", "CX-5", "CX-30", "MX-5", "CX-9"],
  "Mitsubishi": ["Outlander", "Eclipse Cross", "ASX", "Pajero", "Triton"],
  "Subaru": ["Impreza", "Forester", "Outback", "Legacy", "WRX", "BRZ"],
  // Add more as needed
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');

    if (!make || !carModels[make]) {
      return NextResponse.json([]);
    }

    return NextResponse.json(carModels[make].sort());
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
} 