export async function GET() {
  // Create an extremely basic, hardcoded RSS feed
  const timestamp = Date.now();
  const date = new Date().toUTCString();
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Global Drive Motors - Basic Test</title>
    <link>https://www.globaldrivemotors.com</link>
    <description>Basic test feed for Zapier</description>
    <language>en-us</language>
    <pubDate>${date}</pubDate>
    <lastBuildDate>${date}</lastBuildDate>
    <item>
      <title>Test Item ${timestamp}</title>
      <link>https://www.globaldrivemotors.com/?test=${timestamp}</link>
      <description>This is a test item for Zapier integration.</description>
      <pubDate>${date}</pubDate>
      <guid>test-item-${timestamp}</guid>
    </item>
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    }
  });
} 