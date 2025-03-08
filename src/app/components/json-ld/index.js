"use client"

import JsonLdWrapper from './JsonLdWrapper'

export function JsonLd({ data }) {
  return <JsonLdWrapper data={data} />
}

export function BlogPostJsonLd({ data }) {
  return (
    <JsonLdWrapper
      data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        ...data,
      }}
    />
  )
}

export function OrganizationJsonLd({ data }) {
  return (
    <JsonLdWrapper
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        ...data,
      }}
    />
  )
}

export function FaqJsonLd({ data }) {
  return (
    <JsonLdWrapper
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        ...data,
      }}
    />
  )
}

export function ContactJsonLd({ data }) {
  return (
    <JsonLdWrapper
      data={{
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        ...data,
      }}
    />
  )
}

// Base JSON-LD components
export { default as JsonLd } from './JsonLd'
export { generateVehicleJsonLd, generateVehicleListingJsonLd } from './JsonLd'

// FAQ JSON-LD
export { default as FaqJsonLd } from './FaqJsonLd'

// Contact JSON-LD
export { default as ContactJsonLd } from './ContactJsonLd'

// Validation utilities
export * from './utils/validateJsonLd' 