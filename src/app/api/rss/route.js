import { Feed } from 'feed';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaldrivemotors.com';

  const feed = new Feed({
    title: 'Global Drive Motors Updates',
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
      rss2: `${baseUrl}/api/rss`,
      json: `${baseUrl}/api/rss/json`
    },
    author: {
      name: 'Global Drive Motors',
      email: 'info@globaldrivemotors.com',
      link: baseUrl
    }
  });

  try {
    await dbConnect();
    const db = mongoose.connection;

    // Fetch latest car listings
    const listings = await db.collection('Listing')
      .find({ 
        status: 'active',
        createdAt: { $exists: true }
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    // Add car listings to feed
    listings.forEach(listing => {
      const price = listing.price ? `$${listing.price.toLocaleString()}` : 'Contact for Price';
      const imageUrl = listing.image || `${baseUrl}/default-car.jpg`;
      
      feed.addItem({
        title: `[NEW VEHICLE] ${listing.year} ${listing.make} ${listing.model}`,
        id: `car-${listing._id.toString()}`,
        link: `${baseUrl}/cars/${listing._id}`,
        description: `${listing.year} ${listing.make} ${listing.model} - ${price}`,
        content: `
          <div>
            <img src="${imageUrl}" alt="${listing.year} ${listing.make} ${listing.model}" style="max-width: 100%; height: auto;"/>
            <h2>${listing.year} ${listing.make} ${listing.model}</h2>
            <p><strong>Price:</strong> ${price}</p>
            ${listing.mileage ? `<p><strong>Mileage:</strong> ${listing.mileage.toLocaleString()} miles</p>` : ''}
            ${listing.engineSize ? `<p><strong>Engine:</strong> ${listing.engineSize}</p>` : ''}
            ${listing.transmission ? `<p><strong>Transmission:</strong> ${listing.transmission}</p>` : ''}
            ${listing.description ? `<p>${listing.description}</p>` : ''}
            <p><a href="${baseUrl}/cars/${listing._id}">View Full Details</a></p>
          </div>
        `,
        date: new Date(listing.createdAt),
        image: imageUrl,
        category: [
          { name: 'Cars' },
          { name: listing.make },
          { name: listing.type || 'Vehicle' }
        ],
        custom_elements: [
          { 'vehicle:make': listing.make },
          { 'vehicle:model': listing.model },
          { 'vehicle:year': listing.year },
          { 'vehicle:price': listing.price },
          { 'vehicle:type': listing.type || 'Not Specified' },
          { 'vehicle:mileage': listing.mileage || 'Not Specified' },
          { 'vehicle:transmission': listing.transmission || 'Not Specified' },
          { 'vehicle:engineSize': listing.engineSize || 'Not Specified' },
          { 'listing:status': 'active' },
          { 'listing:location': listing.location || 'Not Specified' }
        ]
      });
    });

    // Fetch latest blog posts
    const blogPosts = await db.collection('BlogPost')
      .find({ 
        status: 'published',
        createdAt: { $exists: true }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Add blog posts to feed
    blogPosts.forEach(post => {
      const imageUrl = post.image || `${baseUrl}/default-blog.jpg`;
      
      feed.addItem({
        title: `[BLOG] ${post.title}`,
        id: `blog-${post._id.toString()}`,
        link: `${baseUrl}/blog/${post._id}`,
        description: post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : ''),
        content: `
          <div>
            <img src="${imageUrl}" alt="${post.title}" style="max-width: 100%; height: auto;"/>
            <h1>${post.title}</h1>
            ${post.content || ''}
            <p><a href="${baseUrl}/blog/${post._id}">Read Full Article</a></p>
          </div>
        `,
        date: new Date(post.createdAt),
        image: imageUrl,
        category: [
          { name: 'Blog' },
          { name: post.category || 'General' }
        ],
        custom_elements: [
          { 'blog:category': post.category || 'General' },
          { 'blog:author': post.author || 'Global Drive Motors' },
          { 'content:type': 'blog_post' },
          { 'post:status': 'published' }
        ]
      });
    });

    // Return the feed as RSS 2.0 with proper headers
    return new Response(feed.rss2(), {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=0, s-maxage=300', // Cache for 5 minutes on CDN
        'Access-Control-Allow-Origin': '*',
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