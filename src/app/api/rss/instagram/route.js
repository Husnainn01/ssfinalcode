import { Feed } from 'feed';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';

// Add export config to disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.jdmglobalcars.com';

  // Create current date - ENSURE it's not in the future
  const currentDate = new Date();
  
  const feed = new Feed({
    title: 'JDM Global Cars Updates',
    description: 'Latest vehicles and blog posts from JDM Global Cars',
    id: baseUrl,
    link: baseUrl,
    language: 'en',
    image: `${baseUrl}/logo.png`,
    favicon: `${baseUrl}/favicon.ico`,
    copyright: `All rights reserved ${currentDate.getFullYear()}, JDM Global Cars`,
    updated: currentDate,
    generator: 'JDM Global Cars Instagram Feed',
    feedLinks: {
      rss2: `${baseUrl}/api/rss/instagram`
    },
    author: {
      name: 'JDM Global Cars',
      email: 'info@jdmglobalcars.com',
      link: baseUrl
    }
  });

  try {
    await dbConnect();
    const db = mongoose.connection;

    // Get the most recent listings - ONLY ACTIVE LISTINGS!
    const listings = await db.collection('CarListing')
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

    // Get blog posts that are active/published
    const blogPosts = await db.collection('BlogPost')
      .find({ 
        $or: [
          { visibility: "Active" },
          { status: 'published' }
        ]
      })
      .sort({ 
        createdAt: -1,
        _id: -1
      })
      .limit(5)
      .toArray();

    console.log(`Found ${listings.length} car listings and ${blogPosts.length} blog posts for Instagram feed`);

    // Track if we've added any real content
    let hasRealContent = false;

    // Add car listings to feed with ENHANCED format for Instagram
    listings.forEach(listing => {
      hasRealContent = true;
      
      // Get main image URL with proper formatting for Instagram
      // IMPORTANT: Force JPG format for Instagram compatibility
      let imageUrl = '';
      if (listing.image) {
        imageUrl = listing.image.startsWith('http') ? listing.image : 
          `https://res.cloudinary.com/jdmglobalcars/image/upload/c_fill,f_jpg,q_auto,w_1200,h_630/${listing.image.replace(/^\/+/, '')}`;
      } else if (listing.images && listing.images.length > 0) {
        const firstImage = listing.images[0];
        imageUrl = firstImage.startsWith('http') ? firstImage : 
          `https://res.cloudinary.com/jdmglobalcars/image/upload/c_fill,f_jpg,q_auto,w_1200,h_630/${firstImage.replace(/^\/+/, '')}`;
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
      
      // Create a DETAILED, Instagram-friendly description
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

#jdmglobalcars #carsforsale ${listing.make ? '#' + listing.make.toLowerCase().replace(/\s+/g, '') : ''} ${listing.model ? '#' + listing.model.toLowerCase().replace(/\s+/g, '') : ''}
      `.trim();

      // Generate a publication date (use item date or current date)
      const pubDate = listing.createdAt ? new Date(listing.createdAt) : new Date();
      
      // Add the item with ENHANCED data for Instagram
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
              type: 'image/jpeg', // Always set to JPEG for Instagram
              length: '20000'
            }
          }}
        ]
      });
    });

    // Add blog posts with ENHANCED format for Instagram
    blogPosts.forEach(post => {
      hasRealContent = true;
      
      // Get image URL with proper formatting for Instagram
      // IMPORTANT: Force JPG format for Instagram compatibility
      let imageUrl = '';
      
      // Check for various image field possibilities in the blog post
      if (post.image) {
        imageUrl = post.image.startsWith('http') ? post.image : 
          `https://res.cloudinary.com/di2nkhwfy/image/upload/c_fill,f_jpg,q_auto,w_1200,h_630/${post.image.replace(/^\/+/, '')}`;
      } else if (post.thumbnail) {
        imageUrl = post.thumbnail.startsWith('http') ? post.thumbnail : 
          `https://res.cloudinary.com/di2nkhwfy/image/upload/c_fill,f_jpg,q_auto,w_1200,h_630/${post.thumbnail.replace(/^\/+/, '')}`;
      }
      
      // Extract plain text from HTML content for description
      let plainTextContent = '';
      if (post.content) {
        // Very basic HTML stripping - for a more robust solution, use a proper HTML parser
        plainTextContent = post.content
          .replace(/<[^>]*>/g, ' ') // Remove HTML tags
          .replace(/\s+/g, ' ')     // Replace multiple spaces with a single space
          .trim()
          .substring(0, 300) + '...';
      }
      
      // Use excerpt if available, otherwise use the content
      const excerpt = post.excerpt || plainTextContent || '';
      
      // Get categories and tags
      const categories = post.category ? post.category.split(',').map(c => c.trim()) : [];
      const tags = post.tag ? post.tag.split(',').map(t => t.trim()) : [];
      
      // Create hashtags from categories and tags
      const hashtags = [...categories, ...tags].map(item => 
        `#${item.toLowerCase().replace(/\s+/g, '')}`
      ).join(' ');
      
      // Create a detailed blog post description
      const description = `
📝 NEW BLOG: ${post.title}

${excerpt}

Read the full article: ${baseUrl}/blog/${post._id}

${hashtags} #jdmglobalcars #autoblog
      `.trim();

      // Generate a publication date (use item date or current date)
      const pubDate = post.createdAt ? new Date(post.createdAt) : 
                      post.date ? new Date(post.date) : new Date();
      
      // Add the item with ENHANCED data for Instagram
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
          {'blog:category': post.category || ''},
          {'blog:tags': post.tag || ''},
          {'enclosure': {
            _attr: {
              url: imageUrl,
              type: 'image/jpeg', // Always set to JPEG for Instagram
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
      
      // Default image - ensure it's JPG for Instagram
      const defaultImage = `${baseUrl}/logo.png`;
      
      feed.addItem({
        title: "JDM Global Cars Updates",
        id: `default-${timestamp}`,
        link: `${baseUrl}?t=${timestamp}`,
        description: "Latest vehicles and blog posts from JDM Global Cars. Check back soon for new listings!",
        content: "Latest vehicles and blog posts from JDM Global Cars. Check back soon for new listings!",
        date: currentDate,
        published: currentDate,
        image: defaultImage,
        custom_elements: [
          {'enclosure': {
            _attr: {
              url: defaultImage,
              type: 'image/jpeg', // Always set to JPEG for Instagram
              length: '20000'
            }
          }}
        ]
      });
    }

    // Return the feed in RSS 2.0 format with stronger cache control
    return new Response(feed.rss2(), {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'Access-Control-Allow-Origin': '*' // Allow cross-origin requests
      }
    });
  } catch (error) {
    console.error('Error generating Instagram RSS feed:', error);
    // Return a minimal valid RSS on error to prevent Zapier from failing completely
    const timestamp = Date.now();
    
    const feed = new Feed({
      title: 'JDM Global Cars Updates',
      description: 'Latest vehicles and blog posts from JDM Global Cars',
      id: baseUrl,
      link: baseUrl,
      language: 'en',
      updated: currentDate
    });
    
    feed.addItem({
      title: "JDM Global Cars Updates",
      id: `error-${timestamp}`,
      link: baseUrl,
      description: "Please check back soon for new listings!",
      date: currentDate
    });
    
    return new Response(feed.rss2(), {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache', 
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
