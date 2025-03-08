import Blog from './blog'
import Header from '@/components/template/header'
import Footer from '@/components/template/footer'
import { BlogPostJsonLd } from '@/app/components/json-ld'

// Generate metadata for the blog post
export async function generateMetadata({ params }) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaldrivemotors.com'
    const response = await fetch(`${baseUrl}/api/posts/${params.post}`, { next: { revalidate: 3600 } })
    const post = await response.json()
    
    if (!post) {
      return {
        title: 'Blog Post Not Found',
        description: 'The requested blog post could not be found.'
      }
    }
    
    return {
      title: `${post.title} | Global Drive Motors Blog`,
      description: post.excerpt || `Read about ${post.title} on the Global Drive Motors blog.`,
      openGraph: {
        title: post.title,
        description: post.excerpt || `Read about ${post.title} on the Global Drive Motors blog.`,
        url: `${baseUrl}/blog/${params.post}`,
        siteName: 'Global Drive Motors',
        images: [
          {
            url: post.image || 'https://res.cloudinary.com/dkbgkjqvs/image/upload/v1704267000/gdm-og-image_ixvvzm.jpg',
            width: 1200,
            height: 630,
          },
        ],
        locale: 'en_US',
        type: 'article',
        publishedTime: post.date,
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Blog Post | Global Drive Motors',
      description: 'Read our latest blog post on Global Drive Motors.'
    }
  }
}

export default async function BlogPost({ params }) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaldrivemotors.com'
    const response = await fetch(`${baseUrl}/api/posts/${params.post}`, { next: { revalidate: 3600 } })
    const post = await response.json()

    const blogJsonLd = {
      headline: post.title,
      image: post.image,
      datePublished: post.date,
      dateModified: post.updatedAt || post.date,
      author: {
        '@type': 'Organization',
        name: 'Global Drive Motors'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Global Drive Motors',
        logo: {
          '@type': 'ImageObject',
          url: 'https://res.cloudinary.com/dkbgkjqvs/image/upload/v1704267000/gdm-og-image_ixvvzm.jpg'
        }
      },
      description: post.excerpt || `Read about ${post.title} on the Global Drive Motors blog.`
    }

    return (
      <>
        <BlogPostJsonLd data={blogJsonLd} />
        <Header />
        <main className="bg-[#E2F1E7] py-10">
          <Blog id={params.post} />
        </main>
        <Footer />
      </>
    )
  } catch (error) {
    console.error('Error in BlogPost:', error)
    return (
      <>
        <Header />
        <main className="bg-[#E2F1E7] py-10">
          <Blog id={params.post} />
        </main>
        <Footer />
      </>
    )
  }
}