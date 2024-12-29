import dbConnect from '@/lib/dbConnect';
import Make from "@/models/make";

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const make = await Make.create(data);
    return Response.json(make);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const make = await Make.findByIdAndUpdate(data._id, data, { new: true });
    return Response.json(make);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { id } = await request.json();
    await Make.findByIdAndDelete(id);
    return Response.json({ message: "Make deleted successfully" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 