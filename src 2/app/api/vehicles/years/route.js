import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: 30 }, 
      (_, i) => currentYear - i
    );
    
    return NextResponse.json(years);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch years' }, { status: 500 });
  }
} 