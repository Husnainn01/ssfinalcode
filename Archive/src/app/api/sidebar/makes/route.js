import dbConnect from '@/lib/dbConnect';
import Make from "@/models/make";

export async function GET() {
  try {
    await dbConnect();
    
    // const fetchSidebarData = async () => {
    //   try {
    //     const makesResponse = await fetch(`${baseUrl}/api/sidebar/makes`);
    //     if (!makesResponse.ok) {
    //       throw new Error('Failed to fetch makes');
    //     }
    //     const makesData = await makesResponse.json();
    //     if (!Array.isArray(makesData)) {
    //       console.error('Makes data is not an array:', makesData);
    //       setMakes([]);
    //       return;
    //     }
    //     setMakes(makesData);
    //   } catch (error) {
    //     console.error("Error fetching sidebar data:", error);
    //     setMakes([]);
    //   }
    // };
    
    const makes = await Make.aggregate([
      {
        $lookup: {
          from: "listings",
          localField: "name",
          foreignField: "make",
          as: "vehicles"
        }
      },
      {
        $project: {
          name: 1,
          logo: 1,
          count: { $size: "$vehicles" }
        }
      }
    ]);

    return Response.json(makes);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 