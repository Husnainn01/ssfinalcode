export const metadata = {
  metadataBase: new URL('https://globaldrivemotors.com'),
  title: {
    default: 'Global Drive Motors | Japanese Kei Trucks & Used Cars Export',
    template: '%s | Global Drive Motors'
  },
  description: 'Global Drive Motors - Your trusted source for Japanese Kei trucks and premium used cars. Specializing in Kei truck exports to USA with comprehensive shipping and documentation services. Leading supplier of mini trucks, commercial vehicles, and quality used cars worldwide.',
  keywords: [
    'used cars',
    'car export',
    'japanese used cars',
    'kei trucks',
    'mini trucks',
    'japanese mini trucks',
    'kei truck export',
    'usa kei truck import',
    'japanese commercial vehicles',
    'mini truck dealer usa',
    'right hand drive trucks',
    'japanese kei vehicles',
    'agricultural vehicles',
    'utility vehicles',
    'daihatsu hijet',
    'suzuki carry',
    'honda acty',
    'subaru sambar',
    'mitsubishi minicab',
    'global car trade',
    'vehicle export',
    'premium used vehicles',
    'international car shipping',
    'car dealership',
    'auto export',
    'used car dealer',
    'usa vehicle import',
    'japanese vehicle export'
  ],
  authors: [{ name: 'Global Drive Motors' }],
  creator: 'Global Drive Motors',
  publisher: 'Global Drive Motors',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Global Drive Motors | Japanese Kei Trucks & Used Cars Export',
    description: 'Specialized in exporting Japanese Kei trucks to USA and worldwide. Your trusted source for mini trucks, commercial vehicles, and premium used cars with comprehensive shipping and documentation services.',
    url: 'https://globaldrivemotors.com',
    siteName: 'Global Drive Motors',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Global Drive Motors - Japanese Kei Trucks and Premium Used Cars',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Drive Motors | Japanese Kei Trucks & Used Cars Export',
    description: 'Specialized in Japanese Kei truck exports to USA. Your trusted source for mini trucks and premium used cars.',
    images: ['/images/twitter-image.jpg'],
    creator: '@globaldrivemotors',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://globaldrivemotors.com',
    languages: {
      'en-US': 'https://globaldrivemotors.com',
    },
  },
};

export const adminMetadata = {
  title: 'Admin Dashboard - JDM Global',
  description: 'Admin dashboard for managing Kei trucks, car listings and content',
};

export const customerMetadata = {
  title: 'Customer Dashboard - JDM Global',
  description: 'Customer dashboard for managing vehicle orders and preferences',
};