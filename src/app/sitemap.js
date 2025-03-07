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
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }))

  // You can also add dynamic routes here
  // For example, if you want to add all blog posts:
  const posts = await fetchAllBlogPosts()
  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...routes, ...blogRoutes]
} 