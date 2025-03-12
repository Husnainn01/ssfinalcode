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

    // IMPORTANT CHANGE: Always include the most recent listings and blog posts
    // without time filtering to ensure Zapier has something to process
    const listings = await db.collection('Listing')
      .find({ 
        status: 'active',
      })
      .sort({ 
        createdAt: -1,
        _id: -1
      })
      .limit(3) // Limit to fewer items to avoid overwhelming Zapier
      .toArray();

    const blogPosts = await db.collection('BlogPost')
      .find({ 
        status: 'published',
      })
      .sort({ 
        createdAt: -1,
        _id: -1
      })
      .limit(2) // Limit to fewer items to avoid overwhelming Zapier
      .toArray();

    console.log(`Found ${listings.length} listings and ${blogPosts.length} blog posts for the feed`);

    // Add car listings to feed with proper date handling
    let hasContent = false;
    
    listings.forEach(listing => {
      hasContent = true;
      
      // IMPORTANT: Create a timestamp-based ID that changes with each request
      const currentTimestamp = Date.now();
      const uniqueId = `vehicle-${listing._id.toString()}-${currentTimestamp}`;
      
      // IMPROVED IMAGE HANDLING FOR FACEBOOK
      // Format Cloudinary URL with transformation parameters that Facebook likes
      let imageUrl = listing.image || `${baseUrl}/default-car.jpg`;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = imageUrl.replace(/^\/+/, '');
        // Use these transformation parameters for better Facebook compatibility
        imageUrl = `https://res.cloudinary.com/globaldrivemotors/image/upload/c_fill,f_auto,q_auto,w_1200,h_630/${imageUrl}`;
      }
      
      // Force the date to be current to ensure "newness"
      const itemDate = new Date();
      
      // Format price with currency
      const formattedPrice = listing.price ? 
        `${listing.priceCurrency || '$'}${listing.price.toLocaleString()}` : 
        'Contact for Price';
      
      // Get additional images if available
      const additionalImages = [];
      if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
        listing.images.slice(0, 3).forEach(img => {
          if (img && !img.startsWith('http')) {
            img = img.replace(/^\/+/, '');
            additionalImages.push(`https://res.cloudinary.com/globaldrivemotors/image/upload/${img}`);
          } else if (img) {
            additionalImages.push(img);
          }
        });
      }
      
      // Format car features
      const carFeatures = [];
      if (listing.carFeature && Array.isArray(listing.carFeature)) {
        listing.carFeature.forEach(feature => {
          carFeatures.push(`✅ ${feature}`);
        });
      }
      
      // Format car safety features
      const carSafetyFeatures = [];
      if (listing.carSafetyFeature && Array.isArray(listing.carSafetyFeature)) {
        listing.carSafetyFeature.forEach(feature => {
          carSafetyFeatures.push(`🛡️ ${feature}`);
        });
      }
      
      // Format mileage with unit
      const formattedMileage = listing.mileage ? 
        `${listing.mileage.toLocaleString()} ${listing.mileageUnit || 'KM'}` : 
        '';
      
      // Get category
      const category = listing.category || '';
      
      // MODIFIED: Start with an image tag for better Facebook scraping
      const detailedDescription = `
<img src="${imageUrl}" alt="${listing.year} ${listing.make} ${listing.model}" />

🚗 ${listing.year} ${listing.make} ${listing.model} - ${listing.color || ''} ${listing.itemCondition || ''}

${listing.title ? listing.title.toUpperCase() : ''}

💰 Price: ${formattedPrice}
📊 Mileage: ${formattedMileage}
⚙️ Transmission: ${listing.vehicleTransmission || ''}
⛽ Fuel Type: ${listing.fuelType || ''}
🔧 Engine: ${listing.vehicleEngine || ''}

${listing.description ? listing.description.substring(0, 200) + '...' : ''}

📞 PLEASE CALL FOR MORE INFORMATION
✅ TEST DRIVE WELCOME
🚚 DELIVERY OPTIONS AVAILABLE

🌐 View more details and photos: ${baseUrl}/cars/${listing._id}

#${listing.make?.toLowerCase().replace(/\s+/g, '') || 'car'} #${listing.model?.toLowerCase().replace(/\s+/g, '') || 'auto'} #globaldrivemotors
      `.trim();

      // Create more Facebook-friendly HTML content
      const htmlContent = `
        <div>
          <img src="${imageUrl}" alt="${listing.year} ${listing.make} ${listing.model}" style="max-width:100%; height:auto; display:block; margin-bottom:15px;" />
          <h2>${listing.year} ${listing.make} ${listing.model} - ${formattedPrice}</h2>
          <p>${listing.description || ''}</p>
          <p>
            <strong>Mileage:</strong> ${formattedMileage}<br>
            <strong>Transmission:</strong> ${listing.vehicleTransmission || ''}<br>
            <strong>Fuel Type:</strong> ${listing.fuelType || ''}<br>
            <strong>Engine:</strong> ${listing.vehicleEngine || ''}
          </p>
          <p>View more details and photos: <a href="${baseUrl}/cars/${listing._id}?utm_source=facebook&utm_medium=post&utm_campaign=listing&t=${currentTimestamp}">${baseUrl}/cars/${listing._id}</a></p>
        </div>
      `;

      // SIMPLIFIED FEED ITEM FOR BETTER FACEBOOK COMPATIBILITY
      feed.addItem({
        title: `🚗 NEW: ${listing.year} ${listing.make} ${listing.model} - ${formattedPrice}`,
        id: uniqueId,
        link: `${baseUrl}/cars/${listing._id}?utm_source=facebook&utm_medium=post&utm_campaign=listing&t=${currentTimestamp}`,
        description: detailedDescription,
        content: htmlContent,
        date: itemDate,
        // IMPORTANT: Facebook seems to prefer the simpler enclosure tag for images
        enclosure: {
          url: imageUrl,
          type: 'image/jpeg',
          length: '0'
        },
        // SIMPLIFIED CUSTOM ELEMENTS
        custom_elements: [
          // This format is particularly important for Facebook's RSS reader
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
          // Remove excessive custom elements that might confuse Facebook
          {'vehicle:make': listing.make || ''},
          {'vehicle:model': listing.model || ''},
          {'vehicle:year': listing.year || ''},
          {'pubDate': itemDate.toUTCString()},
          {'guid': uniqueId, isPermaLink: "false"}
        ]
      });
    });

    // Similarly update blog posts for better Facebook compatibility
    blogPosts.forEach(post => {
      hasContent = true;
      
      const currentTimestamp = Date.now() + 1;
      const uniqueId = `blog-${post._id.toString()}-${currentTimestamp}`;
      
      // IMPROVED IMAGE HANDLING FOR FACEBOOK
      let imageUrl = post.image || `${baseUrl}/default-blog.jpg`;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = imageUrl.replace(/^\/+/, '');
        // Use these transformation parameters for better Facebook compatibility
        imageUrl = `https://res.cloudinary.com/globaldrivemotors/image/upload/c_fill,f_auto,q_auto,w_1200,h_630/${imageUrl}`;
      }

      const itemDate = new Date();
      
      // MODIFIED: Start with an image tag for better Facebook scraping
      const simplifiedBlogDescription = `
<img src="${imageUrl}" alt="${post.title}" />

📝 NEW BLOG POST: ${post.title}

${post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : '')}

🌐 Read the full article: ${baseUrl}/blog/${post._id}

#globaldrivemotors #autoblog #carnews
      `.trim();
      
      // SIMPLIFIED FEED ITEM FOR BETTER FACEBOOK COMPATIBILITY
      feed.addItem({
        title: `📝 NEW BLOG: ${post.title}`,
        id: uniqueId,
        link: `${baseUrl}/blog/${post._id}?utm_source=facebook&utm_medium=post&utm_campaign=blog&t=${currentTimestamp}`,
        description: simplifiedBlogDescription,
        content: `<div><img src="${imageUrl}" alt="${post.title}" style="max-width:100%; height:auto; display:block; margin-bottom:15px;" /><h2>${post.title}</h2><p>${post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : '')}</p></div>`,
        date: itemDate,
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
          {'pubDate': itemDate.toUTCString()},
          {'guid': uniqueId, isPermaLink: "false"}
        ]
      });
    });

    // Update default item too
    if (!hasContent) {
      const defaultDate = new Date();
      const currentTimestamp = Date.now() + 2;
      let defaultImageUrl = `${baseUrl}/logo.png`;
      if (!defaultImageUrl.startsWith('http')) {
        defaultImageUrl = `https://res.cloudinary.com/globaldrivemotors/image/upload/c_fill,f_auto,q_auto,w_1200,h_630/${defaultImageUrl.replace(`${baseUrl}/`, '')}`;
      }

      feed.addItem({
        title: `🚗 Global Drive Motors Updates`,
        id: `default-${currentTimestamp}`,
        link: `${baseUrl}?t=${currentTimestamp}`,
        description: `<img src="${defaultImageUrl}" alt="Global Drive Motors" /><p>New vehicles and blog posts will appear here soon. Check back later!</p>`,
        date: defaultDate,
        enclosure: {
          url: defaultImageUrl,
          type: 'image/png',
          length: '0'
        },
        custom_elements: [
          {'media:content': {
            _attr: {
              url: defaultImageUrl,
              medium: 'image',
              type: 'image/png'
            }
          }},
          {'pubDate': defaultDate.toUTCString()},
          {'guid': `default-${currentTimestamp}`, isPermaLink: "false"}
        ]
      });
    }

    // Add headers that can help with image display on Facebook
    return new Response(feed.rss2(), {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('RSS Feed Error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"><channel><title>Error</title><description>Error generating RSS feed: ${error.message}</description></channel></rss>`, 
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