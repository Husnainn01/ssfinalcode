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
        _id: -1
      })
      .limit(50)
      .toArray();

    // Add car listings to feed with proper date handling
    listings.forEach(listing => {
      const price = listing.price ? `$${listing.price.toLocaleString()}` : 'Contact for Price';
      const imageUrl = listing.image || `${baseUrl}/default-car.jpg`;
      const itemDate = listing.createdAt ? new Date(listing.createdAt) : new Date();
      
      // Create a more structured title and description for better Zapier detection
      const title = `🚗 NEW LISTING: ${listing.year} ${listing.make} ${listing.model}`;
      const description = `
        🚘 Vehicle: ${listing.year} ${listing.make} ${listing.model}
        💰 Price: ${price}
        ${listing.mileage ? `📊 Mileage: ${listing.mileage.toLocaleString()} miles` : ''}
        ${listing.engineSize ? `🔧 Engine: ${listing.engineSize}` : ''}
        ${listing.transmission ? `⚙️ Transmission: ${listing.transmission}` : ''}
      `.trim();

      feed.addItem({
        title: title,
        id: `vehicle-${listing._id.toString()}-${Date.now()}`, // Add timestamp for uniqueness
        link: `${baseUrl}/cars/${listing._id}`,
        description: description,
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <img src="${imageUrl}" alt="${listing.year} ${listing.make} ${listing.model}" style="width: 100%; height: auto; border-radius: 8px;"/>
            <h2 style="color: #333; margin-top: 15px;">${listing.year} ${listing.make} ${listing.model}</h2>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <p style="margin: 5px 0;"><strong>💰 Price:</strong> ${price}</p>
              ${listing.mileage ? `<p style="margin: 5px 0;"><strong>📊 Mileage:</strong> ${listing.mileage.toLocaleString()} miles</p>` : ''}
              ${listing.engineSize ? `<p style="margin: 5px 0;"><strong>🔧 Engine:</strong> ${listing.engineSize}</p>` : ''}
              ${listing.transmission ? `<p style="margin: 5px 0;"><strong>⚙️ Transmission:</strong> ${listing.transmission}</p>` : ''}
            </div>
            ${listing.description ? `<p style="color: #666;">${listing.description}</p>` : ''}
            <a href="${baseUrl}/cars/${listing._id}" style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Full Details</a>
          </div>
        `,
        date: itemDate,
        image: imageUrl,
        category: [
          { name: 'Cars' },
          { name: listing.make },
          { name: 'New Listing' }
        ],
        custom_elements: [
          {'vehicle:make': listing.make || ''},
          {'vehicle:model': listing.model || ''},
          {'vehicle:year': listing.year || ''},
          {'vehicle:price': price},
          {'vehicle:mileage': listing.mileage ? `${listing.mileage.toLocaleString()} miles` : ''},
          {'vehicle:engine': listing.engineSize || ''},
          {'vehicle:transmission': listing.transmission || ''},
          {'listing:type': 'vehicle'},
          {'listing:status': 'active'},
          {'listing:timestamp': Date.now()},
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