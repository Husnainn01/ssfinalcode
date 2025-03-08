"use client"

import JsonLdWrapper from './JsonLdWrapper'
import { generateVehicleJsonLd, generateVehicleListingJsonLd } from './JsonLd'
import { 
  validateVehicleJsonLd,
  validateOrganizationJsonLd,
  validateFaqJsonLd,
  validateContactJsonLd,
  validateBasicJsonLd 
} from './utils/validateJsonLd'

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

// Export utility functions
export {
  generateVehicleJsonLd,
  generateVehicleListingJsonLd,
  validateVehicleJsonLd,
  validateOrganizationJsonLd,
  validateFaqJsonLd,
  validateContactJsonLd,
  validateBasicJsonLd
} 