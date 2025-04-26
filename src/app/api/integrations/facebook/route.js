export async function GET() {
  return new Response(JSON.stringify({
    status: "ready",
    message: "Facebook integration API endpoint is ready. This will be used by Zapier to post to Facebook.",
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    }
  });
} 