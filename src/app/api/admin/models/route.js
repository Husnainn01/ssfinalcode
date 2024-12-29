import dbConnect from '@/lib/dbConnect';
import Model from "@/models/model";

export async function GET() {
  try {
    await dbConnect();
    const models = await Model.find().populate('make').sort({ name: 1 });
    return Response.json(models);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const model = await Model.create(data);
    return Response.json(model);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const model = await Model.findByIdAndUpdate(data._id, data, { new: true });
    return Response.json(model);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { id } = await request.json();
    await Model.findByIdAndDelete(id);
    return Response.json({ message: "Model deleted successfully" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 