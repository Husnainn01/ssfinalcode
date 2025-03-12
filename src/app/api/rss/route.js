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

    // Add car listings to feed with proper date handling
    let hasContent = false;
    
    listings.forEach(listing => {
      hasContent = true;
      const price = listing.price ? `$${listing.price.toLocaleString()}` : 'Contact for Price';
      const imageUrl = listing.image || `${baseUrl}/default-car.jpg`;
      const itemDate = listing.createdAt ? new Date(listing.createdAt) : new Date();
      
      // Create a detailed description with all car specifications
      const detailedDescription = `
🚗 ${listing.year} ${listing.make} ${listing.model}

💰 Price: ${price}
${listing.mileage ? `📊 Mileage: ${listing.mileage.toLocaleString()} miles` : ''}
${listing.engineSize ? `🔧 Engine: ${listing.engineSize}` : ''}
${listing.transmission ? `⚙️ Transmission: ${listing.transmission}` : ''}
${listing.fuelType ? `⛽ Fuel Type: ${listing.fuelType}` : ''}
${listing.bodyType ? `🚘 Body Type: ${listing.bodyType}` : ''}
${listing.color ? `🎨 Color: ${listing.color}` : ''}
${listing.seats ? `💺 Seats: ${listing.seats}` : ''}
${listing.doors ? `🚪 Doors: ${listing.doors}` : ''}
${listing.steering ? `🎯 Steering: ${listing.steering}` : ''}
${listing.drive ? `⚡ Drive: ${listing.drive}` : ''}

${listing.description || ''}

🌐 View more details and photos: ${baseUrl}/cars/${listing._id}

#${listing.make.toLowerCase().replace(/\s+/g, '')} #${listing.model.toLowerCase().replace(/\s+/g, '')} #globaldrivemotors #newlisting
      `.trim();

      feed.addItem({
        title: `🚗 NEW LISTING: ${listing.year} ${listing.make} ${listing.model}`,
        id: `vehicle-${listing._id.toString()}-${Date.now()}`,
        link: `${baseUrl}/cars/${listing._id}`,
        description: detailedDescription,
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <img src="${imageUrl}" alt="${listing.year} ${listing.make} ${listing.model}" style="width: 100%; height: auto; border-radius: 8px;"/>
            <h2 style="color: #333; margin-top: 15px;">${listing.year} ${listing.make} ${listing.model}</h2>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <p style="margin: 5px 0;"><strong>💰 Price:</strong> ${price}</p>
              ${listing.mileage ? `<p style="margin: 5px 0;"><strong>📊 Mileage:</strong> ${listing.mileage.toLocaleString()} miles</p>` : ''}
              ${listing.engineSize ? `<p style="margin: 5px 0;"><strong>🔧 Engine:</strong> ${listing.engineSize}</p>` : ''}
              ${listing.transmission ? `<p style="margin: 5px 0;"><strong>⚙️ Transmission:</strong> ${listing.transmission}</p>` : ''}
              ${listing.fuelType ? `<p style="margin: 5px 0;"><strong>⛽ Fuel Type:</strong> ${listing.fuelType}</p>` : ''}
              ${listing.bodyType ? `<p style="margin: 5px 0;"><strong>🚘 Body Type:</strong> ${listing.bodyType}</p>` : ''}
              ${listing.color ? `<p style="margin: 5px 0;"><strong>🎨 Color:</strong> ${listing.color}</p>` : ''}
              ${listing.seats ? `<p style="margin: 5px 0;"><strong>💺 Seats:</strong> ${listing.seats}</p>` : ''}
              ${listing.doors ? `<p style="margin: 5px 0;"><strong>🚪 Doors:</strong> ${listing.doors}</p>` : ''}
              ${listing.steering ? `<p style="margin: 5px 0;"><strong>🎯 Steering:</strong> ${listing.steering}</p>` : ''}
              ${listing.drive ? `<p style="margin: 5px 0;"><strong>⚡ Drive:</strong> ${listing.drive}</p>` : ''}
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
          { name: listing.model },
          { name: listing.bodyType || 'Vehicle' }
        ],
        custom_elements: [
          {'vehicle:make': listing.make || ''},
          {'vehicle:model': listing.model || ''},
          {'vehicle:year': listing.year || ''},
          {'vehicle:price': price},
          {'vehicle:mileage': listing.mileage ? `${listing.mileage.toLocaleString()} miles` : ''},
          {'vehicle:engine': listing.engineSize || ''},
          {'vehicle:transmission': listing.transmission || ''},
          {'vehicle:fuelType': listing.fuelType || ''},
          {'vehicle:bodyType': listing.bodyType || ''},
          {'vehicle:color': listing.color || ''},
          {'vehicle:seats': listing.seats || ''},
          {'vehicle:doors': listing.doors || ''},
          {'vehicle:steering': listing.steering || ''},
          {'vehicle:drive': listing.drive || ''},
          {'listing:type': 'vehicle'},
          {'listing:status': 'active'},
          {'listing:timestamp': Date.now()},
          {'pubDate': itemDate.toUTCString()},
          {'lastBuildDate': new Date().toUTCString()}
        ]
      });
    });

    // Add blog posts to feed
    blogPosts.forEach(post => {
      hasContent = true;
      const imageUrl = post.image || `${baseUrl}/default-blog.jpg`;
      const itemDate = post.createdAt ? new Date(post.createdAt) : new Date();
      
      feed.addItem({
        title: `📝 NEW BLOG: ${post.title}`,
        id: `blog-${post._id.toString()}-${Date.now()}`,
        link: `${baseUrl}/blog/${post._id}`,
        description: post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : ''),
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <img src="${imageUrl}" alt="${post.title}" style="width: 100%; height: auto; border-radius: 8px;"/>
            <h1 style="color: #333;">${post.title}</h1>
            ${post.content || ''}
            <a href="${baseUrl}/blog/${post._id}" style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Read Full Article</a>
          </div>
        `,
        date: itemDate,
        image: imageUrl,
        category: [{ name: 'Blog' }],
        custom_elements: [
          {'blog:category': post.category || 'General'},
          {'blog:type': 'post'},
          {'blog:status': 'published'},
          {'blog:timestamp': Date.now()},
          {'pubDate': itemDate.toUTCString()},
          {'lastBuildDate': new Date().toUTCString()}
        ]
      });
    });

    // Only add default item if no real content exists
    if (!hasContent) {
      const defaultDate = new Date();
      feed.addItem({
        title: '🚗 Welcome to Global Drive Motors Feed',
        id: `default-${Date.now()}`,
        link: baseUrl,
        description: 'New vehicles and blog posts will appear here automatically.',
        content: 'Stay tuned for new listings and blog posts!',
        date: defaultDate,
        custom_elements: [
          {'feed:type': 'default'},
          {'pubDate': defaultDate.toUTCString()},
          {'lastBuildDate': defaultDate.toUTCString()}
        ]
      });
    }

    // Return the feed with proper headers
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