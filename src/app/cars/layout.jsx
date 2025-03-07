import Header from '@/components/template/header'
import Footer from '@/components/template/footer'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Cars For Sale | Japanese Cars & Kei Trucks Export',
  description: 'Browse our extensive collection of Japanese vehicles including Kei trucks, premium cars, and commercial vehicles available for worldwide export. Specialized in USA imports.',
  openGraph: {
    title: 'Cars For Sale | Japanese Cars & Kei Trucks Export',
    description: 'Browse our extensive collection of Japanese vehicles including Kei trucks, premium cars, and commercial vehicles available for worldwide export. Specialized in USA imports.',
    url: 'https://globaldrivemotors.com/cars',
    siteName: 'Global Drive Motors',
    images: [
      {
        url: 'https://res.cloudinary.com/dkbgkjqvs/image/upload/v1704267000/gdm-og-image_ixvvzm.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  }
}

export default function CarsLayout({ children }) {
  return (
    <>
      <Header />
      <main className="bg-[#E2F1E7]">
        {children}
      </main>
      <Footer />
    </>
  )
} 