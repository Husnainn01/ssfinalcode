import { Feed } from 'feed';
import prisma from '@/lib/prisma';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaldrivemotors.com';

  const feed = new Feed({
    title: 'Global Drive Motors',
    description: 'Latest vehicles and blog posts from Global Drive Motors',
    id: 'https://www.globaldrivemotors.com/',
    link: 'https://www.globaldrivemotors.com/',
    language: 'en',
    image: 'https://www.globaldrivemotors.com/logo.png',
    favicon: 'https://www.globaldrivemotors.com/favicon.ico',
    copyright: `All rights reserved ${new Date().getFullYear()}, Global Drive Motors`,
    updated: new Date(),
    generator: 'Global Drive Motors RSS Feed',
    feedLinks: {
      rss2: 'https://www.globaldrivemotors.com/api/rss'
    },
  });

  try {
    // Fetch latest listings
    const listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        slug: true,
        title: true,
        description: true,
        price: true,
        make: true,
        model: true,
        year: true,
        image: true,
        createdAt: true
      }
    });

    // Fetch latest blog posts
    const blogPosts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        slug: true,
        title: true,
        content: true,
        image: true,
        createdAt: true,
        category: true
      }
    });

    // Add listings to feed
    listings.forEach(listing => {
      feed.addItem({
        title: listing.title,
        id: listing.slug,
        link: `${baseUrl}/listings/${listing.slug}`,
        description: listing.description,
        content: `
          <h2>${listing.year} ${listing.make} ${listing.model}</h2>
          <p>Price: $${listing.price.toLocaleString()}</p>
          <img src="${listing.image}" alt="${listing.title}" />
          <p>${listing.description}</p>
        `,
        date: new Date(listing.createdAt),
        image: listing.image
      });
    });

    // Add blog posts to feed
    blogPosts.forEach(post => {
      feed.addItem({
        title: post.title,
        id: post.slug,
        link: `${baseUrl}/blog/${post.slug}`,
        description: post.content.substring(0, 200) + '...',
        content: post.content,
        date: new Date(post.createdAt),
        image: post.image,
        category: [{ name: post.category }]
      });
    });

    // Return the feed as RSS 2.0
    return new Response(feed.rss2(), {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=0, s-maxage=3600', // Cache for 1 hour on CDN
      },
    });

  } catch (error) {
    console.error('RSS Feed Error:', error);
    return new Response('Error generating RSS feed', { status: 500 });
  }
} 