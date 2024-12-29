import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();

    // Get the users collection
    const usersCollection = db.collection('adminusers');
    
    // For now, let's get the first super_admin user
    // Later you can modify this to get the actual logged-in user
    const currentUser = await usersCollection.findOne({ role: 'super_admin' });

    await client.close();

    if (!currentUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      username: currentUser.username,
      role: currentUser.role,
      email: currentUser.email
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return Response.json(
      { error: 'Failed to fetch user', details: error.message },
      { status: 500 }
    );
  }
} 