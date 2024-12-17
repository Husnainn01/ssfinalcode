export async function GET(req) {
  try {
    // Fetch dashboard stats
    const stats = {
      totalUsers: await db.collection('users').countDocuments(),
      totalCars: await db.collection('cars').countDocuments(),
      totalPosts: await db.collection('posts').countDocuments(),
      totalViews: await db.collection('views').countDocuments()
    };
    
    return Response.json(stats);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 