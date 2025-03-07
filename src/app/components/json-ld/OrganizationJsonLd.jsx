export default function OrganizationJsonLd() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "name": "Global Drive Motors",
    "description": "Leading exporter of Japanese vehicles and Kei trucks worldwide, specializing in USA imports. Offering premium used cars with comprehensive shipping and documentation services.",
    "url": "https://globaldrivemotors.com",
    "logo": "https://globaldrivemotors.com/images/logo.png",
    "sameAs": [
      "https://facebook.com/globaldrivemotors",
      "https://twitter.com/globaldrivemotors",
      "https://instagram.com/globaldrivemotors"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "Japan"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "priceRange": "$$",
    "openingHours": "Mo-Fr 09:00-18:00",
    "telephone": "+81-90-8846-3843",
    "email": "info@globaldrivemotors.com",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Vehicle Catalog",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Japanese Kei Trucks",
          "description": "Mini trucks perfect for various applications"
        },
        {
          "@type": "OfferCatalog",
          "name": "Premium Used Cars",
          "description": "High-quality used vehicles from Japan"
        }
      ]
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
    />
  )
} 