import { Feed } from 'feed';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';

export async function GET(request) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaldrivemotors.com';

  // Create current date - ENSURE it's not in the future
  const currentDate = new Date();
  
  const feed = new Feed({
    title: 'Global Drive Motors Updates',
    description: 'Latest vehicles and blog posts from Global Drive Motors',
    id: baseUrl,
    link: baseUrl,
    language: 'en',
    image: `${baseUrl}/logo.png`,
    favicon: `${baseUrl}/favicon.ico`,
    copyright: `All rights reserved ${currentDate.getFullYear()}, Global Drive Motors`,
    updated: currentDate,
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

    // Get the most recent listings
    const listings = await db.collection('Listing')
      .find({ 
        status: 'active',
      })
      .sort({ 
        createdAt: -1,
        _id: -1
      })
      .limit(5)
      .toArray();

    const blogPosts = await db.collection('BlogPost')
      .find({ 
        status: 'published',
      })
      .sort({ 
        createdAt: -1,
        _id: -1
      })
      .limit(5)
      .toArray();

    console.log(`Found ${listings.length} listings and ${blogPosts.length} blog posts for the feed`);

    // Track if we've added any real content
    let hasRealContent = false;

    // Add car listings to feed with SIMPLIFIED format for Facebook
    listings.forEach(listing => {
      hasRealContent = true;
      
      // Get main image URL
      let imageUrl = listing.image || '';
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = imageUrl.replace(/^\/+/, '');
        imageUrl = `https://res.cloudinary.com/globaldrivemotors/image/upload/c_fill,f_auto,q_auto,w_1200,h_630/${imageUrl}`;
      }
      
      // Format price
      const formattedPrice = listing.price ? 
        `${listing.priceCurrency || '$'}${listing.price.toLocaleString()}` : 
        'Contact for Price';
      
      // Format mileage
      const formattedMileage = listing.mileage ? 
        `${listing.mileage.toLocaleString()} ${listing.mileageUnit || 'KM'}` : 
        '';
      
      // Create a SIMPLE description - Facebook prefers plain text with line breaks
      const description = `
${listing.year} ${listing.make} ${listing.model} - ${formattedPrice}

${listing.description ? listing.description.substring(0, 200) + '...' : ''}

• Mileage: ${formattedMileage}
• Transmission: ${listing.vehicleTransmission || ''}
• Fuel Type: ${listing.fuelType || ''}
• Engine: ${listing.vehicleEngine || ''}

View more details: ${baseUrl}/cars/${listing._id}
      `.trim();

      // Generate a publication date (use item date or current date)
      const pubDate = listing.createdAt ? new Date(listing.createdAt) : new Date();
      
      // Add the item with MINIMAL custom elements
      feed.addItem({
        title: `${listing.year} ${listing.make} ${listing.model} - ${formattedPrice}`,
        id: `vehicle-${listing._id.toString()}`,
        link: `${baseUrl}/cars/${listing._id}`,
        description: description,
        content: description,
        date: pubDate,
        published: pubDate,
        image: imageUrl
      });
    });

    // Add blog posts with SIMPLIFIED format for Facebook
    blogPosts.forEach(post => {
      hasRealContent = true;
      
      // Get image URL
      let imageUrl = post.image || '';
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = imageUrl.replace(/^\/+/, '');
        imageUrl = `https://res.cloudinary.com/globaldrivemotors/image/upload/c_fill,f_auto,q_auto,w_1200,h_630/${imageUrl}`;
      }
      
      // Create a SIMPLE description
      const description = `
${post.title}

${post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : '')}

Read the full article: ${baseUrl}/blog/${post._id}
      `.trim();

      // Generate a publication date (use item date or current date)
      const pubDate = post.createdAt ? new Date(post.createdAt) : new Date();
      
      // Add the item with MINIMAL custom elements
      feed.addItem({
        title: post.title,
        id: `blog-${post._id.toString()}`,
        link: `${baseUrl}/blog/${post._id}`,
        description: description,
        content: description,
        date: pubDate,
        published: pubDate,
        image: imageUrl
      });
    });

    // If no real content was added, add a default item
    // This ensures Zapier always has something to process
    if (!hasRealContent) {
      // Create a timestamp to ensure uniqueness
      const timestamp = Date.now();
      const currentDate = new Date();
      
      feed.addItem({
        title: "Global Drive Motors Updates",
        id: `default-${timestamp}`,
        link: `${baseUrl}?t=${timestamp}`,
        description: "Latest vehicles and blog posts from Global Drive Motors. Check back soon for new listings!",
        content: "Latest vehicles and blog posts from Global Drive Motors. Check back soon for new listings!",
        date: currentDate,
        published: currentDate
      });
    }

    // Return the feed in RSS 2.0 format
    return new Response(feed.rss2(), {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'no-cache', // Set no-cache to ensure fresh content
        'Access-Control-Allow-Origin': '*' // Allow cross-origin requests
      }
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    // Return a minimal valid RSS on error to prevent Zapier from failing completely
    const timestamp = Date.now();
    const currentDate = new Date();
    
    const feed = new Feed({
      title: 'Global Drive Motors Updates',
      description: 'Latest vehicles and blog posts from Global Drive Motors',
      id: baseUrl,
      link: baseUrl,
      language: 'en',
      updated: currentDate
    });
    
    feed.addItem({
      title: "Global Drive Motors Updates",
      id: `error-${timestamp}`,
      link: baseUrl,
      description: "Please check back soon for new listings!",
      date: currentDate
    });
    
    return new Response(feed.rss2(), {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 