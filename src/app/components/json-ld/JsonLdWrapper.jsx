"use client"

import { useState, useEffect } from 'react'
import {
  validateVehicleJsonLd,
  validateOrganizationJsonLd,
  validateFaqJsonLd,
  validateContactJsonLd,
  validateBasicJsonLd
} from './utils/validateJsonLd'

const validators = {
  Vehicle: validateVehicleJsonLd,
  Organization: validateOrganizationJsonLd,
  FAQPage: validateFaqJsonLd,
  ContactPage: validateContactJsonLd,
  BlogPosting: validateBasicJsonLd
}

export default function JsonLdWrapper({ data }) {
  const [validatedData, setValidatedData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!data) {
      setError('No JSON-LD data provided')
      setIsLoading(false)
      return
    }

    try {
      // Basic validation for all JSON-LD
      validateBasicJsonLd(data)

      // Type-specific validation
      const validator = validators[data['@type']]
      if (validator) {
        validator(data)
      }

      setValidatedData(data)
      setError(null)
    } catch (err) {
      console.error('JSON-LD Validation Error:', err)
      setError(err.message)
      setValidatedData(null)
    } finally {
      setIsLoading(false)
    }
  }, [data])

  if (isLoading) return null

  if (error) {
    // In development, show the error
    if (process.env.NODE_ENV === 'development') {
      console.warn('JSON-LD Error:', error)
    }
    return null
  }

  if (!validatedData) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(validatedData) }}
    />
  )
} 