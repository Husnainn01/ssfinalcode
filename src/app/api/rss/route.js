import { Feed } from 'feed';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaldrivemotors.com';

  const feed = new Feed({
    title: 'Global Drive Motors',
    description: 'Latest vehicles and blog posts from Global Drive Motors',
    id: baseUrl,
    link: baseUrl,
    language: 'en',
    image: `${baseUrl}/logo.png`,
    favicon: `${baseUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, Global Drive Motors`,
    updated: new Date(),
    generator: 'Global Drive Motors RSS Feed',
    feedLinks: {
      rss2: `${baseUrl}/api/rss`
    },
    author: {
      name: 'Global Drive Motors',
      link: baseUrl
    }
  });

  try {
    await dbConnect();
    const db = mongoose.connection;

    // Fetch latest listings with error handling
    const listings = await db.collection('Listing')
      .find({ status: 'active' }) // Only fetch active listings
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    // Fetch latest published blog posts
    const blogPosts = await db.collection('BlogPost')
      .find({ status: 'published' }) // Only fetch published posts
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    // Add listings to feed with enhanced content
    listings.forEach(listing => {
      const formattedPrice = listing.price ? `$${listing.price.toLocaleString()}` : 'Contact for Price';
      const imageUrl = listing.image || `${baseUrl}/default-car.jpg`;
      
      feed.addItem({
        title: `${listing.year} ${listing.make} ${listing.model} - ${formattedPrice}`,
        id: listing._id.toString(),
        link: `${baseUrl}/cars/${listing._id}`,
        description: listing.description || `${listing.year} ${listing.make} ${listing.model}`,
        content: `
          <div style="font-family: Arial, sans-serif;">
            <h2>${listing.year} ${listing.make} ${listing.model}</h2>
            <p style="font-size: 18px; font-weight: bold;">Price: ${formattedPrice}</p>
            <img src="${imageUrl}" alt="${listing.year} ${listing.make} ${listing.model}" style="max-width: 100%; height: auto;"/>
            ${listing.mileage ? `<p>Mileage: ${listing.mileage.toLocaleString()} miles</p>` : ''}
            ${listing.description ? `<p>${listing.description}</p>` : ''}
            <p><a href="${baseUrl}/cars/${listing._id}">View Full Details</a></p>
          </div>
        `,
        date: new Date(listing.createdAt || new Date()),
        image: imageUrl,
        category: [{ name: 'Cars' }]
      });
    });

    // Add blog posts to feed with enhanced content
    blogPosts.forEach(post => {
      const imageUrl = post.image || `${baseUrl}/default-blog.jpg`;
      const excerpt = post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : '');
      
      feed.addItem({
        title: post.title,
        id: post._id.toString(),
        link: `${baseUrl}/blog/${post._id}`,
        description: excerpt,
        content: `
          <div style="font-family: Arial, sans-serif;">
            <h1>${post.title}</h1>
            ${imageUrl ? `<img src="${imageUrl}" alt="${post.title}" style="max-width: 100%; height: auto;"/>` : ''}
            <div>${post.content || ''}</div>
            <p><a href="${baseUrl}/blog/${post._id}">Read Full Article</a></p>
          </div>
        `,
        date: new Date(post.createdAt || post.date || new Date()),
        image: imageUrl,
        category: post.category ? [{ name: post.category }] : [{ name: 'Blog' }]
      });
    });

    // Return the feed as RSS 2.0 with proper headers
    return new Response(feed.rss2(), {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=0, s-maxage=3600', // Cache for 1 hour on CDN
        'Access-Control-Allow-Origin': '*', // Allow CORS
      },
    });

  } catch (error) {
    console.error('RSS Feed Error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>Error generating RSS feed</error>`, 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/xml'
        }
      }
    );
  }
} 