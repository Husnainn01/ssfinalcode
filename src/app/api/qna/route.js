import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Qna from '@/models/Qna';

// GET all Q&A items
export async function GET() {
  try {
    await dbConnect();
    
    const qnaItems = await Qna.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(qnaItems);
  } catch (error) {
    console.error('Error fetching Q&A items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Q&A items' },
      { status: 500 }
    );
  }
}

// POST create a new Q&A item
export async function POST(request) {
  try {
    await dbConnect();
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.question || !data.answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }
    
    const newQna = await Qna.create({
      question: data.question,
      answer: data.answer,
      category: data.category || 'General',
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
    
    return NextResponse.json(newQna, { status: 201 });
  } catch (error) {
    console.error('Error creating Q&A item:', error);
    return NextResponse.json(
      { error: 'Failed to create Q&A item' },
      { status: 500 }
    );
  }
} 