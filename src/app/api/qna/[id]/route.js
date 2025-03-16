import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Qna from '@/models/Qna';

// GET a single Q&A item by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const qnaItem = await Qna.findById(id);
    
    if (!qnaItem) {
      return NextResponse.json(
        { error: 'Q&A item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(qnaItem);
  } catch (error) {
    console.error('Error fetching Q&A item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Q&A item' },
      { status: 500 }
    );
  }
}

// PUT update a Q&A item
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const data = await request.json();
    
    // Validate required fields
    if (!data.question || !data.answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }
    
    const updatedQna = await Qna.findByIdAndUpdate(
      id,
      {
        question: data.question,
        answer: data.answer,
        category: data.category,
        isActive: data.isActive,
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedQna) {
      return NextResponse.json(
        { error: 'Q&A item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedQna);
  } catch (error) {
    console.error('Error updating Q&A item:', error);
    return NextResponse.json(
      { error: 'Failed to update Q&A item' },
      { status: 500 }
    );
  }
}

// DELETE a Q&A item
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const deletedQna = await Qna.findByIdAndDelete(id);
    
    if (!deletedQna) {
      return NextResponse.json(
        { error: 'Q&A item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Q&A item:', error);
    return NextResponse.json(
      { error: 'Failed to delete Q&A item' },
      { status: 500 }
    );
  }
} 