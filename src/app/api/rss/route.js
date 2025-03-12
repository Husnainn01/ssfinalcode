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

    // Calculate the time threshold (1 hour ago)
    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - 1);

    // Fetch only recent car listings
    const listings = await db.collection('Listing')
      .find({ 
        status: 'active',
        createdAt: { $gte: timeThreshold } // Only items created in the last hour
      })
      .sort({ 
        createdAt: -1,
        _id: -1
      })
      .limit(10) // Limit to fewer items since we're only getting recent ones
      .toArray();

    // Fetch only recent blog posts
    const blogPosts = await db.collection('BlogPost')
      .find({ 
        status: 'published',
        createdAt: { $gte: timeThreshold } // Only items created in the last hour
      })
      .sort({ 
        createdAt: -1,
        _id: -1
      })
      .limit(5) // Limit to fewer items since we're only getting recent ones
      .toArray();

    // Add car listings to feed with proper date handling
    let hasContent = false;
    
    listings.forEach(listing => {
      hasContent = true;
      const price = listing.price ? `$${listing.price.toLocaleString()}` : 'Contact for Price';
      
      // Handle Cloudinary image URL - ensure it's a full URL
      let imageUrl = listing.image || `${baseUrl}/default-car.jpg`;
      if (imageUrl && !imageUrl.startsWith('http')) {
        // Remove any leading slashes
        imageUrl = imageUrl.replace(/^\/+/, '');
        imageUrl = `https://res.cloudinary.com/globaldrivemotors/image/upload/${imageUrl}`;
      }

      const itemDate = listing.createdAt ? new Date(listing.createdAt) : new Date();
      
      // Create a unique ID that Zapier can use to detect new items
      const uniqueId = `vehicle-${listing._id.toString()}-${itemDate.getTime()}`;

      // Create a detailed description with all car specifications
      const detailedDescription = `<p><img src="${imageUrl}" alt="${listing.year} ${listing.make} ${listing.model}" /></p>
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

#${listing.make.toLowerCase().replace(/\s+/g, '')} #${listing.model.toLowerCase().replace(/\s+/g, '')} #globaldrivemotors #newlisting`;

      feed.addItem({
        title: `🚗 NEW LISTING: ${listing.year} ${listing.make} ${listing.model}`,
        id: uniqueId,
        link: `${baseUrl}/cars/${listing._id}`,
        description: detailedDescription,
        content: detailedDescription,
        date: itemDate,
        image: {
          url: imageUrl,
          title: `${listing.year} ${listing.make} ${listing.model}`
        },
        enclosure: {
          url: imageUrl,
          type: 'image/jpeg',
          length: '0'
        },
        custom_elements: [
          {'media:content': {
            _attr: {
              url: imageUrl,
              medium: 'image',
              type: 'image/jpeg'
            }
          }},
          {'media:thumbnail': {
            _attr: {
              url: imageUrl
            }
          }},
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

    // Add blog posts to feed with similar image handling
    blogPosts.forEach(post => {
      hasContent = true;
      
      // Handle Cloudinary image URL for blog posts
      let imageUrl = post.image || `${baseUrl}/default-blog.jpg`;
      if (imageUrl && !imageUrl.startsWith('http')) {
        // Remove any leading slashes
        imageUrl = imageUrl.replace(/^\/+/, '');
        imageUrl = `https://res.cloudinary.com/globaldrivemotors/image/upload/${imageUrl}`;
      }

      const itemDate = post.createdAt ? new Date(post.createdAt) : new Date();
      
      // Create a unique ID that Zapier can use to detect new items
      const uniqueId = `blog-${post._id.toString()}-${itemDate.getTime()}`;

      const postDescription = `<p><img src="${imageUrl}" alt="${post.title}" /></p>${post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : '')}`;
      
      feed.addItem({
        title: `📝 NEW BLOG: ${post.title}`,
        id: uniqueId,
        link: `${baseUrl}/blog/${post._id}`,
        description: postDescription,
        content: postDescription,
        date: itemDate,
        image: {
          url: imageUrl,
          title: post.title
        },
        enclosure: {
          url: imageUrl,
          type: 'image/jpeg',
          length: '0'
        },
        custom_elements: [
          {'media:content': {
            _attr: {
              url: imageUrl,
              medium: 'image',
              type: 'image/jpeg'
            }
          }},
          {'media:thumbnail': {
            _attr: {
              url: imageUrl
            }
          }},
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
      let defaultImageUrl = `${baseUrl}/logo.png`;
      if (!defaultImageUrl.startsWith('http')) {
        defaultImageUrl = `https://res.cloudinary.com/globaldrivemotors/image/upload/f_auto,q_auto/${defaultImageUrl.replace(`${baseUrl}/`, '')}`;
      }

      feed.addItem({
        title: '🚗 Welcome to Global Drive Motors Feed',
        id: `default-${Date.now()}`,
        link: baseUrl,
        description: 'New vehicles and blog posts will appear here automatically.',
        date: defaultDate,
        enclosure: {
          url: defaultImageUrl,
          type: 'image/png'
        },
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