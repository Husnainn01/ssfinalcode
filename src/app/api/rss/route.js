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

    // Calculate a more generous time threshold (24 hours ago instead of 1 hour)
    // This helps during testing to make sure content is visible
    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - 24); // Extended to 24 hours for testing

    // For debugging, get at least one item, even if it's older
    const listings = await db.collection('Listing')
      .find({ 
        status: 'active',
        // Temporarily comment out the time filter for testing
        // createdAt: { $gte: timeThreshold }
      })
      .sort({ 
        createdAt: -1,
        _id: -1
      })
      .limit(5)
      .toArray();

    // For debugging, get at least one item, even if it's older
    const blogPosts = await db.collection('BlogPost')
      .find({ 
        status: 'published',
        // Temporarily comment out the time filter for testing
        // createdAt: { $gte: timeThreshold }
      })
      .sort({ 
        createdAt: -1,
        _id: -1
      })
      .limit(5)
      .toArray();

    console.log(`Found ${listings.length} listings and ${blogPosts.length} blog posts for the feed`);

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
        // Use a direct Cloudinary URL format
        imageUrl = `https://res.cloudinary.com/globaldrivemotors/image/upload/${imageUrl}`;
      }

      // Force a current date for testing purposes
      const itemDate = new Date(); // Always use current date during testing
      
      // Create a unique ID that always changes for testing
      const uniqueId = `vehicle-${listing._id.toString()}-${Date.now()}`;

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

#${listing.make.toLowerCase().replace(/\s+/g, '')} #${listing.model.toLowerCase().replace(/\s+/g, '')} #globaldrivemotors #newlisting #testingzapier`;

      feed.addItem({
        title: `🚗 LISTING UPDATE: ${listing.year} ${listing.make} ${listing.model} - ${new Date().toLocaleTimeString()}`,
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

    // Add blog posts to feed with similar handling for testing
    blogPosts.forEach(post => {
      hasContent = true;
      
      // Handle Cloudinary image URL for blog posts
      let imageUrl = post.image || `${baseUrl}/default-blog.jpg`;
      if (imageUrl && !imageUrl.startsWith('http')) {
        // Remove any leading slashes
        imageUrl = imageUrl.replace(/^\/+/, '');
        imageUrl = `https://res.cloudinary.com/globaldrivemotors/image/upload/${imageUrl}`;
      }

      // Force a current date for testing purposes
      const itemDate = new Date(); // Always use current date during testing
      
      // Create a unique ID that always changes for testing
      const uniqueId = `blog-${post._id.toString()}-${Date.now()}`;

      const postDescription = `<p><img src="${imageUrl}" alt="${post.title}" /></p>${post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : '')}`;
      
      feed.addItem({
        title: `📝 BLOG UPDATE: ${post.title} - ${new Date().toLocaleTimeString()}`,
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