import { MongoClient } from 'mongodb';

const statsCache = {
  data: null,
  timestamp: null,
  ttl: 30 * 1000
};

export async function GET() {
  try {
    // Check cache first
    const now = Date.now();
    if (statsCache.data && statsCache.timestamp && (now - statsCache.timestamp < statsCache.ttl)) {
      return Response.json(statsCache.data);
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();

    // Only fetch cars and posts stats
    const [cars, posts] = await Promise.all([
      db.collection('CarListing').find({}).toArray(),
      db.collection('BlogPost').find({}).toArray()
    ]);

    // Simplified stats without user management
    const stats = {
      cars: {
        total: cars.length,
        active: cars.filter(car => car.status === 'active').length
      },
      posts: {
        total: posts.length,
        published: posts.filter(post => post.status === 'Active').length
      },
      totalViews: 0
    };

    // Update cache
    statsCache.data = stats;
    statsCache.timestamp = now;

    await client.close();
    return Response.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return Response.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
} 