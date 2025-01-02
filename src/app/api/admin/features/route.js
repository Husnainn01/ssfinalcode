import dbConnect from "@/lib/dbConnect";
import Feature from "@/models/feature";

export async function GET() {
  try {
    await dbConnect();
    const features = await Feature.find().sort({ category: 1, name: 1 });
    return Response.json(features);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const feature = await Feature.create(data);
    return Response.json(feature);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const feature = await Feature.findByIdAndUpdate(data._id, data, { new: true });
    return Response.json(feature);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { id } = await request.json();
    await Feature.findByIdAndDelete(id);
    return Response.json({ message: "Feature deleted successfully" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 