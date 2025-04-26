import { Feed } from 'feed';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaldrivemotors.com';
  
  // Create current date
  const currentDate = new Date();
  
  const feed = new Feed({
    title: 'Global Drive Motors - Zapier Test Feed',
    description: 'Test feed for Zapier integration',
    id: baseUrl,
    link: baseUrl,
    language: 'en',
    copyright: `All rights reserved ${currentDate.getFullYear()}, Global Drive Motors`,
    updated: currentDate
  });
  
  // Add a test item with current timestamp to ensure uniqueness
  const timestamp = Date.now();
  
  feed.addItem({
    title: "Zapier Test Item",
    id: `test-${timestamp}`,
    link: `${baseUrl}?test=${timestamp}`,
    description: "This is a test item for Zapier integration. If you can see this, the RSS feed is working correctly.",
    content: "This is a test item for Zapier integration. If you can see this, the RSS feed is working correctly.",
    date: currentDate
  });
  
  // Return the feed in RSS 2.0 format
  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    }
  });
} 