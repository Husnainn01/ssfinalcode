export default function FaqJsonLd() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can I import a Kei truck to the USA?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Kei trucks that are 25 years or older can be imported to the USA under the 25-year rule. We handle all necessary documentation and compliance requirements for importing Japanese mini trucks to the United States."
        }
      },
      {
        "@type": "Question",
        "name": "What documentation do I need to import a vehicle?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Required documents include: Original Japanese Export Certificate, Bill of Lading, Sales Contract, Export Inspection Certificate, and EPA/DOT compliance documentation for vehicles over 25 years old. We assist with all documentation."
        }
      },
      {
        "@type": "Question",
        "name": "How long does shipping take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Shipping time varies by destination. Typically, it takes 4-6 weeks for USA shipments, including customs clearance. We provide real-time tracking and updates throughout the shipping process."
        }
      },
      {
        "@type": "Question",
        "name": "Do you provide warranty?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer various warranty options depending on the vehicle and destination. All vehicles undergo thorough inspection before shipping, and we provide detailed condition reports."
        }
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  )
} 