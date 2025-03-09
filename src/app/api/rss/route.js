import { Feed } from 'feed';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaldrivemotors.com';

  const feed = new Feed({
    title: 'Global Drive Motors',
    description: 'Latest vehicles and blog posts from Global Drive Motors',
    id: 'https://www.globaldrivemotors.com/',
    link: 'https://www.globaldrivemotors.com/',
    language: 'en',
    image: 'https://www.globaldrivemotors.com/logo.png',
    favicon: 'https://www.globaldrivemotors.com/favicon.ico',
    copyright: `All rights reserved ${new Date().getFullYear()}, Global Drive Motors`,
    updated: new Date(),
    generator: 'Global Drive Motors RSS Feed',
    feedLinks: {
      rss2: 'https://www.globaldrivemotors.com/api/rss'
    },
  });

  try {
    await dbConnect();
    const db = mongoose.connection;

    // Fetch latest listings
    const listings = await db.collection('Listing').find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    // Fetch latest blog posts
    const blogPosts = await db.collection('BlogPost').find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    // Add listings to feed
    listings.forEach(listing => {
      feed.addItem({
        title: listing.title,
        id: listing._id.toString(),
        link: `${baseUrl}/cars/${listing._id}`,
        description: listing.description || `${listing.year} ${listing.make} ${listing.model}`,
        content: `
          <h2>${listing.year} ${listing.make} ${listing.model}</h2>
          <p>Price: $${listing.price?.toLocaleString()}</p>
          <img src="${listing.image}" alt="${listing.title}" />
          <p>${listing.description || ''}</p>
        `,
        date: new Date(listing.createdAt || new Date()),
        image: listing.image
      });
    });

    // Add blog posts to feed
    blogPosts.forEach(post => {
      feed.addItem({
        title: post.title,
        id: post._id.toString(),
        link: `${baseUrl}/blog/${post._id}`,
        description: post.excerpt || post.content?.substring(0, 200) + '...',
        content: post.content,
        date: new Date(post.createdAt || post.date || new Date()),
        image: post.image,
        category: [{ name: post.category }]
      });
    });

    // Return the feed as RSS 2.0
    return new Response(feed.rss2(), {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=0, s-maxage=3600', // Cache for 1 hour on CDN
      },
    });

  } catch (error) {
    console.error('RSS Feed Error:', error);
    return new Response('Error generating RSS feed', { status: 500 });
  }
} 