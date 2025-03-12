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
      rss2: `${baseUrl}/api/rss`
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

    // Fetch latest car listings with proper date handling
    const listings = await db.collection('Listing')
      .find({ 
        status: 'active'
      })
      .sort({ 
        createdAt: -1,
        _id: -1  // Secondary sort by _id if createdAt is same
      })
      .limit(50)  // Increased limit to ensure we have items
      .toArray();

    // Add car listings to feed with proper date handling
    listings.forEach(listing => {
      const price = listing.price ? `$${listing.price.toLocaleString()}` : 'Contact for Price';
      const imageUrl = listing.image || `${baseUrl}/default-car.jpg`;
      
      // Ensure we have a valid date
      const itemDate = listing.createdAt ? new Date(listing.createdAt) : new Date();
      
      feed.addItem({
        title: `[NEW VEHICLE] ${listing.year} ${listing.make} ${listing.model} - ${price}`,
        id: listing._id.toString(),
        link: `${baseUrl}/cars/${listing._id}`,
        description: `${listing.year} ${listing.make} ${listing.model} - ${price}${listing.mileage ? ` - ${listing.mileage.toLocaleString()} miles` : ''}`,
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
        date: itemDate,
        image: imageUrl,
        category: [{ name: 'Cars' }],
        custom_elements: [
          {'vehicle:make': listing.make || ''},
          {'vehicle:model': listing.model || ''},
          {'vehicle:year': listing.year || ''},
          {'vehicle:price': price},
          {'pubDate': itemDate.toUTCString()},
          {'lastBuildDate': new Date().toUTCString()}
        ]
      });
    });

    // Fetch latest blog posts with proper date handling
    const blogPosts = await db.collection('BlogPost')
      .find({ 
        status: 'published'
      })
      .sort({ 
        createdAt: -1,
        _id: -1  // Secondary sort by _id if createdAt is same
      })
      .limit(20)
      .toArray();

    // Add blog posts to feed with proper date handling
    blogPosts.forEach(post => {
      const imageUrl = post.image || `${baseUrl}/default-blog.jpg`;
      const itemDate = post.createdAt ? new Date(post.createdAt) : new Date();
      
      feed.addItem({
        title: `[BLOG] ${post.title}`,
        id: post._id.toString(),
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
        date: itemDate,
        image: imageUrl,
        category: [{ name: 'Blog' }],
        custom_elements: [
          {'blog:category': post.category || 'General'},
          {'pubDate': itemDate.toUTCString()},
          {'lastBuildDate': new Date().toUTCString()}
        ]
      });
    });

    // If no items were added, add a default item to prevent empty feed
    if (listings.length === 0 && blogPosts.length === 0) {
      feed.addItem({
        title: '[INFO] Global Drive Motors Feed',
        id: 'default-feed-item',
        link: baseUrl,
        description: 'Welcome to Global Drive Motors RSS Feed',
        content: 'New vehicles and blog posts will appear here as they are added.',
        date: new Date(),
        custom_elements: [
          {'pubDate': new Date().toUTCString()},
          {'lastBuildDate': new Date().toUTCString()}
        ]
      });
    }

    // Return the feed with proper headers for Zapier
    return new Response(feed.rss2(), {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('RSS Feed Error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title><description>Error generating RSS feed</description></channel></rss>`, 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
} 