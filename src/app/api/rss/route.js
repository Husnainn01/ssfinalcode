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

    // Get the most recent listings - ONLY ACTIVE LISTINGS!
    const listings = await db.collection('CarListing')  // Using the correct collection name from Car.js
      .find({ 
        $or: [
          { visibility: "Active" },
          { visibility: { $ne: 'hidden' } }
        ],
        offerType: 'In Stock'           // Only in-stock cars
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

    console.log(`Found ${listings.length} listings for RSS feed. IDs: ${listings.map(l => l._id).join(', ')}`);

    // Track if we've added any real content
    let hasRealContent = false;

    // Add car listings to feed with ENHANCED format for Facebook
    listings.forEach(listing => {
      hasRealContent = true;
      
      // Get main image URL with proper formatting for Facebook
      let imageUrl = '';
      if (listing.image) {
        imageUrl = listing.image.startsWith('http') ? listing.image : 
          `https://res.cloudinary.com/globaldrivemotors/image/upload/c_fill,f_auto,q_auto,w_1200,h_630/${listing.image.replace(/^\/+/, '')}`;
      } else if (listing.images && listing.images.length > 0) {
        const firstImage = listing.images[0];
        imageUrl = firstImage.startsWith('http') ? firstImage : 
          `https://res.cloudinary.com/globaldrivemotors/image/upload/c_fill,f_auto,q_auto,w_1200,h_630/${firstImage.replace(/^\/+/, '')}`;
      }
      
      // Format price with currency symbol
      const formattedPrice = listing.price ? 
        `${listing.priceCurrency || '$'}${listing.price.toLocaleString()}` : 
        'Contact for Price';
      
      // Format mileage with unit
      const formattedMileage = listing.mileage ? 
        `${listing.mileage.toLocaleString()} ${listing.mileageUnit || 'KM'}` : 
        'N/A';
      
      // Create a detailed title that includes key car info
      const detailedTitle = `${listing.year || ''} ${listing.make || ''} ${listing.model || ''} - ${formattedPrice}`;
      
      // Create a DETAILED, Facebook-friendly description
      const description = `
🚗 NEW ARRIVAL: ${listing.year || ''} ${listing.make || ''} ${listing.model || ''} - ${formattedPrice}

✅ Description: ${listing.description || listing.title || ''}

✅ Mileage: ${formattedMileage}
✅ Transmission: ${listing.vehicleTransmission || 'N/A'}
✅ Fuel Type: ${listing.fuelType || 'N/A'}
✅ Engine: ${listing.vehicleEngine || 'N/A'}
✅ Color: ${listing.color || 'N/A'}
✅ Body Type: ${listing.bodyType || 'N/A'}
${listing.carFeature && listing.carFeature.length > 0 ? `✅ Features: ${listing.carFeature.slice(0, 3).join(', ')}${listing.carFeature.length > 3 ? '...' : ''}` : ''}

View more details and photos: ${baseUrl}/cars/${listing._id}

#globaldrivemotors #carsforsale ${listing.make ? '#' + listing.make.toLowerCase().replace(/\s+/g, '') : ''} ${listing.model ? '#' + listing.model.toLowerCase().replace(/\s+/g, '') : ''}
      `.trim();

      // Generate a publication date (use item date or current date)
      const pubDate = listing.createdAt ? new Date(listing.createdAt) : new Date();
      
      // Add the item with ENHANCED data for Facebook
      feed.addItem({
        title: detailedTitle,
        id: `vehicle-${listing._id.toString()}`,
        link: `${baseUrl}/cars/${listing._id}`,
        description: description,
        content: description,
        date: pubDate,
        published: pubDate,
        image: imageUrl,
        // Add custom data that Zapier can access
        custom_elements: [
          {'car:image': imageUrl},
          {'car:price': formattedPrice},
          {'car:make': listing.make || ''},
          {'car:model': listing.model || ''},
          {'car:year': listing.year ? listing.year.toString() : ''},
          {'enclosure': {
            _attr: {
              url: imageUrl,
              type: 'image/jpeg',
              length: '20000'
            }
          }}
        ]
      });
    });

    // Add blog posts with ENHANCED format for Facebook
    blogPosts.forEach(post => {
      hasRealContent = true;
      
      // Get image URL with proper formatting for Facebook
      let imageUrl = '';
      if (post.image) {
        imageUrl = post.image.startsWith('http') ? post.image : 
          `https://res.cloudinary.com/globaldrivemotors/image/upload/c_fill,f_auto,q_auto,w_1200,h_630/${post.image.replace(/^\/+/, '')}`;
      }
      
      // Create a detailed blog post description
      const description = `
📝 NEW BLOG: ${post.title}

${post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : '')}

Read the full article: ${baseUrl}/blog/${post._id}

#globaldrivemotors #autoblog #carnews
      `.trim();

      // Generate a publication date (use item date or current date)
      const pubDate = post.createdAt ? new Date(post.createdAt) : new Date();
      
      // Add the item with ENHANCED data for Facebook
      feed.addItem({
        title: post.title,
        id: `blog-${post._id.toString()}`,
        link: `${baseUrl}/blog/${post._id}`,
        description: description,
        content: description,
        date: pubDate,
        published: pubDate,
        image: imageUrl,
        // Add custom data that Zapier can access
        custom_elements: [
          {'blog:image': imageUrl},
          {'enclosure': {
            _attr: {
              url: imageUrl,
              type: 'image/jpeg',
              length: '20000'
            }
          }}
        ]
      });
    });

    // If no real content was added, add a default item
    if (!hasRealContent) {
      // Create a timestamp to ensure uniqueness
      const timestamp = Date.now();
      const currentDate = new Date();
      
      // Default image
      const defaultImage = `${baseUrl}/logo.png`;
      
      feed.addItem({
        title: "Global Drive Motors Updates",
        id: `default-${timestamp}`,
        link: `${baseUrl}?t=${timestamp}`,
        description: "Latest vehicles and blog posts from Global Drive Motors. Check back soon for new listings!",
        content: "Latest vehicles and blog posts from Global Drive Motors. Check back soon for new listings!",
        date: currentDate,
        published: currentDate,
        image: defaultImage,
        custom_elements: [
          {'enclosure': {
            _attr: {
              url: defaultImage,
              type: 'image/png',
              length: '20000'
            }
          }}
        ]
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
    // Return a minimal valid RSS on error
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