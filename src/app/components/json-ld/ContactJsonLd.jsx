export default function ContactJsonLd() {
  const contactData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Global Drive Motors",
    "description": "Get in touch with our team for vehicle inquiries, import assistance, and customer support.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Global Drive Motors",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+81-90-8846-3843",
          "contactType": "sales",
          "areaServed": ["US", "AU", "NZ", "UK", "CA", "MORE"],
          "availableLanguage": ["English", "Japanese", "ALL"]
        },
        {
          "@type": "ContactPoint",
          "telephone": "+81-90-8846-3843",
          "contactType": "customer support",
          "areaServed": ["US", "AU", "NZ", "UK", "CA", "MORE"],
          "availableLanguage": ["English", "Japanese", "ALL"]
        }
      ],
      "email": "info@globaldrivemotors.com",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "Japan"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(contactData) }}
    />
  )
} 