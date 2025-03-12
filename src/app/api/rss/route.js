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
      
      // Handle main image
      let imageUrl = listing.image || `${baseUrl}/default-car.jpg`;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = imageUrl.replace(/^\/+/, '');
        imageUrl = `https://res.cloudinary.com/globaldrivemotors/image/upload/${imageUrl}`;
      }
      
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
      
      // Format price with currency
      const formattedPrice = listing.price ? 
        `${listing.priceCurrency || '$'}${listing.price.toLocaleString()}` : 
        'Contact for Price';
      
      // Format mileage with unit
      const formattedMileage = listing.mileage ? 
        `${listing.mileage.toLocaleString()} ${listing.mileageUnit || 'KM'}` : 
        '';
      
      // Get category
      const category = listing.category || '';
      
      // Prepare the full description including all details
      const detailedDescription = `
🚗 ${listing.year} ${listing.make} ${listing.model} - ${listing.color || ''} ${listing.itemCondition || ''}

${listing.title ? listing.title.toUpperCase() : ''}

${listing.description ? listing.description : ''}

📋 CAR OVERVIEW:
• Stock Number: ${listing.stockNumber || ''}
• VIN: ${listing.vin || ''}
• Mileage: ${formattedMileage}
• Condition: ${listing.itemCondition || ''}
• Availability: ${listing.availability || 'In Stock'}
• Body Type: ${listing.bodyType || ''}
• Color: ${listing.color || ''}
• Drive Wheel: ${listing.driveWheelConfiguration || ''}
• Doors: ${listing.numberOfDoors || ''}
• Fuel Type: ${listing.fuelType || ''}
• Engine: ${listing.vehicleEngine || ''}
• Seating: ${listing.vehicleSeatingCapacity || ''}
• Transmission: ${listing.vehicleTransmission || ''}
• Cylinders: ${listing.cylinders || ''}
• Country: ${listing.country || ''}
${category ? `• Category: ${category}` : ''}

${carFeatures.length > 0 ? '⭐ FEATURES:\n' + carFeatures.join('\n') : ''}

${carSafetyFeatures.length > 0 ? '🛡️ SAFETY FEATURES:\n' + carSafetyFeatures.join('\n') : ''}

📞 PLEASE CALL FOR MORE INFORMATION
✅ TEST DRIVE WELCOME
🚚 DELIVERY OPTIONS AVAILABLE
📋 VEHICLE FULLY CHECKED AND WARRANTED

🌐 View more details and photos: ${baseUrl}/cars/${listing._id}

#${listing.make?.toLowerCase().replace(/\s+/g, '') || 'car'} #${listing.model?.toLowerCase().replace(/\s+/g, '') || 'auto'} #globaldrivemotors #${listing.itemCondition?.toLowerCase() || 'used'}cars
      `.trim();

      // Create clean HTML version for RSS readers that includes multiple images
      const htmlDescription = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="display: flex; overflow-x: auto; gap: 10px; margin-bottom: 15px;">
            <img src="${imageUrl}" alt="${listing.year} ${listing.make} ${listing.model}" style="min-width: 280px; height: 210px; object-fit: cover; border-radius: 8px;"/>
            ${additionalImages.map(img => `<img src="${img}" alt="${listing.year} ${listing.make} ${listing.model}" style="min-width: 280px; height: 210px; object-fit: cover; border-radius: 8px;"/>`).join('')}
          </div>
          
          <h2 style="font-size: 24px; margin: 15px 0 10px;">${listing.year} ${listing.make} ${listing.model} - ${listing.color || ''}</h2>
          <h3 style="font-size: 20px; margin: 0 0 15px; color: #e63946;">${formattedPrice}</h3>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <p style="font-size: 16px; line-height: 1.5; white-space: pre-line;">${listing.description || ''}</p>
          </div>
          
          <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="margin-top: 0;">Car Overview</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div><strong>Stock Number:</strong> ${listing.stockNumber || ''}</div>
              <div><strong>VIN:</strong> ${listing.vin || ''}</div>
              <div><strong>Mileage:</strong> ${formattedMileage}</div>
              <div><strong>Condition:</strong> ${listing.itemCondition || ''}</div>
              <div><strong>Body Type:</strong> ${listing.bodyType || ''}</div>
              <div><strong>Color:</strong> ${listing.color || ''}</div>
              <div><strong>Drive Wheel:</strong> ${listing.driveWheelConfiguration || ''}</div>
              <div><strong>Doors:</strong> ${listing.numberOfDoors || ''}</div>
              <div><strong>Fuel Type:</strong> ${listing.fuelType || ''}</div>
              <div><strong>Engine:</strong> ${listing.vehicleEngine || ''}</div>
              <div><strong>Seating:</strong> ${listing.vehicleSeatingCapacity || ''}</div>
              <div><strong>Transmission:</strong> ${listing.vehicleTransmission || ''}</div>
              <div><strong>Cylinders:</strong> ${listing.cylinders || ''}</div>
              <div><strong>Country:</strong> ${listing.country || ''}</div>
              ${category ? `<div><strong>Category:</strong> ${category}</div>` : ''}
            </div>
          </div>
          
          ${carFeatures.length > 0 ? `
          <div style="background: #f0f8f0; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="margin-top: 0;">Features</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              ${listing.carFeature.map(feature => `<div>✅ ${feature}</div>`).join('')}
            </div>
          </div>` : ''}
          
          ${carSafetyFeatures.length > 0 ? `
          <div style="background: #fff8f0; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="margin-top: 0;">Safety Features</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              ${listing.carSafetyFeature.map(feature => `<div>🛡️ ${feature}</div>`).join('')}
            </div>
          </div>` : ''}
          
          <a href="${baseUrl}/cars/${listing._id}" style="display: inline-block; background: #e63946; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;">View Full Details</a>
        </div>
      `;

      // Make the item date always current for testing
      const itemDate = new Date();
      const uniqueId = `vehicle-${listing._id.toString()}-${Date.now()}`;

      feed.addItem({
        title: `🚗 ${listing.year} ${listing.make} ${listing.model} - ${formattedPrice}`,
        id: uniqueId,
        link: `${baseUrl}/cars/${listing._id}`,
        description: detailedDescription,
        content: htmlDescription,
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
          // Include up to 3 additional images for platforms that support it
          ...additionalImages.map(imgUrl => ({
            'media:content': {
              _attr: {
                url: imgUrl,
                medium: 'image',
                type: 'image/jpeg'
              }
            }
          })),
          {'vehicle:title': listing.title || ''},
          {'vehicle:make': listing.make || ''},
          {'vehicle:model': listing.model || ''},
          {'vehicle:year': listing.year || ''},
          {'vehicle:price': formattedPrice},
          {'vehicle:mileage': formattedMileage},
          {'vehicle:engine': listing.vehicleEngine || ''},
          {'vehicle:transmission': listing.vehicleTransmission || ''},
          {'vehicle:fuelType': listing.fuelType || ''},
          {'vehicle:bodyType': listing.bodyType || ''},
          {'vehicle:color': listing.color || ''},
          {'vehicle:seats': listing.vehicleSeatingCapacity || ''},
          {'vehicle:doors': listing.numberOfDoors || ''},
          {'vehicle:vin': listing.vin || ''},
          {'vehicle:stockNumber': listing.stockNumber || ''},
          {'vehicle:condition': listing.itemCondition || 'Used'},
          {'vehicle:cylinders': listing.cylinders || ''},
          {'vehicle:driveWheel': listing.driveWheelConfiguration || ''},
          {'vehicle:country': listing.country || ''},
          {'vehicle:category': category},
          {'vehicle:availability': listing.availability || 'In Stock'},
          {'vehicle:offerType': listing.offerType || ''},
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