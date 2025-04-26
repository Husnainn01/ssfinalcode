export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://globaldrivemotors.com'

  // Core pages
  const routes = [
    '',
    '/legal',
    '/sitemap',
    '/contact-us',
    '/about-us',
    '/banking',
    '/how-to-buy',
    '/FAQ',
    '/cars',
    '/blog',
    '/auth',
    '/customer-dashboard',
    '/search',
    '/cars/au',
    '/cars/us',
    '/cars/bs',
    '/cars/ca',
    '/cars/cl',
    '/cars/cy',
    '/cars/cd',
    '/cars/fj',
    '/cars/gy',
    '/cars/ie',
    '/cars/jm',
    '/cars/ke',
    '/cars/mu',
    '/cars/nz',
    '/cars/ng',
    '/cars/pk',
    '/cars/ph',
    '/cars/pl',
    '/cars/ro',
    '/api/rss',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '/api/rss' ? 'hourly' : 'daily',
    priority: route === '' ? 1 : route === '/api/rss' ? 0.9 : 0.8,
  }))

  return routes
} 