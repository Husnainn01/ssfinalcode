import { useState, useEffect } from 'react'
import {
  validateVehicleJsonLd,
  validateOrganizationJsonLd,
  validateFaqJsonLd,
  validateContactJsonLd
} from './utils/validateJsonLd'

const validators = {
  Vehicle: validateVehicleJsonLd,
  AutoDealer: validateOrganizationJsonLd,
  FAQPage: validateFaqJsonLd,
  ContactPage: validateContactJsonLd
}

export default function JsonLdWrapper({ data, type }) {
  const [validatedData, setValidatedData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const validateData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get the appropriate validator
        const validator = validators[data['@type']]
        if (!validator) {
          throw new Error(`No validator found for type: ${data['@type']}`)
        }

        // Validate the data
        await validator(data)
        setValidatedData(data)
      } catch (err) {
        console.error('JSON-LD Validation Error:', err)
        setError(err.message)
        
        // In development, throw the error
        if (process.env.NODE_ENV === 'development') {
          console.warn('JSON-LD Validation Failed:', {
            type: data['@type'],
            error: err.message,
            data
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    validateData()
  }, [data])

  // Don't render anything if there's an error in production
  if (error && process.env.NODE_ENV === 'production') {
    return null
  }

  // Show error in development
  if (error && process.env.NODE_ENV === 'development') {
    return (
      <script
        type="application/json"
        data-testid="json-ld-error"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ error, data }, null, 2)
        }}
      />
    )
  }

  // Don't render anything while loading
  if (isLoading) {
    return null
  }

  // Render the validated JSON-LD
  return validatedData ? (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(validatedData) }}
    />
  ) : null
} 