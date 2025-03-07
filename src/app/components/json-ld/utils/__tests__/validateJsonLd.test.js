import {
  validateBasicJsonLd,
  validateVehicleJsonLd,
  validateOrganizationJsonLd,
  validateFaqJsonLd,
  validateContactJsonLd
} from '../validateJsonLd.js'

describe('JSON-LD Validation Tests', () => {
  // Basic JSON-LD Tests
  describe('validateBasicJsonLd', () => {
    test('should pass for valid basic JSON-LD', () => {
      const validData = {
        '@context': 'https://schema.org',
        '@type': 'Thing',
        'name': 'Test'
      }
      expect(() => validateBasicJsonLd(validData)).not.toThrow()
    })

    test('should throw error for missing data', () => {
      expect(() => validateBasicJsonLd(null)).toThrow('JSON-LD data is required')
    })

    test('should throw error for invalid @context', () => {
      const invalidData = {
        '@context': 'wrong-context',
        '@type': 'Thing'
      }
      expect(() => validateBasicJsonLd(invalidData)).toThrow('Invalid or missing @context')
    })
  })

  // Vehicle JSON-LD Tests
  describe('validateVehicleJsonLd', () => {
    const validVehicleData = {
      '@context': 'https://schema.org',
      '@type': 'Vehicle',
      'name': 'Test Vehicle',
      'description': 'A test vehicle',
      'model': 'Test Model',
      'manufacturer': 'Test Manufacturer',
      'vehicleEngine': {
        '@type': 'EngineSpecification',
        'engineType': 'Gas',
        'engineDisplacement': '2.0L'
      },
      'mileageFromOdometer': {
        '@type': 'QuantitativeValue',
        'value': 50000,
        'unitCode': 'KMT'
      }
    }

    test('should pass for valid vehicle data', () => {
      expect(() => validateVehicleJsonLd(validVehicleData)).not.toThrow()
    })

    test('should throw error for missing required fields', () => {
      const invalidData = {
        '@context': 'https://schema.org',
        '@type': 'Vehicle'
      }
      expect(() => validateVehicleJsonLd(invalidData)).toThrow('Missing required fields')
    })

    test('should throw error for invalid engine specification', () => {
      const invalidEngineData = {
        ...validVehicleData,
        vehicleEngine: { engineType: 'Gas' } // Missing @type
      }
      expect(() => validateVehicleJsonLd(invalidEngineData)).toThrow('Invalid vehicleEngine specification')
    })
  })

  // Organization JSON-LD Tests
  describe('validateOrganizationJsonLd', () => {
    const validOrgData = {
      '@context': 'https://schema.org',
      '@type': 'AutoDealer',
      'name': 'Test Dealer',
      'description': 'A test dealer',
      'url': 'https://example.com'
    }

    test('should pass for valid organization data', () => {
      expect(() => validateOrganizationJsonLd(validOrgData)).not.toThrow()
    })

    test('should throw error for invalid URL', () => {
      const invalidData = {
        ...validOrgData,
        url: 'not-a-url'
      }
      expect(() => validateOrganizationJsonLd(invalidData)).toThrow('Invalid URL')
    })
  })

  // FAQ JSON-LD Tests
  describe('validateFaqJsonLd', () => {
    const validFaqData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'Test Question',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Test Answer'
          }
        }
      ]
    }

    test('should pass for valid FAQ data', () => {
      expect(() => validateFaqJsonLd(validFaqData)).not.toThrow()
    })

    test('should throw error for missing question', () => {
      const invalidData = {
        ...validFaqData,
        mainEntity: [
          {
            '@type': 'Question',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Test Answer'
            }
          }
        ]
      }
      expect(() => validateFaqJsonLd(invalidData)).toThrow('Missing question text')
    })
  })

  // Contact JSON-LD Tests
  describe('validateContactJsonLd', () => {
    const validContactData = {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      'mainEntity': {
        '@type': 'Organization',
        'name': 'Test Org',
        'contactPoint': [
          {
            '@type': 'ContactPoint',
            'telephone': '+1-234-567-8900',
            'contactType': 'customer service'
          }
        ]
      }
    }

    test('should pass for valid contact data', () => {
      expect(() => validateContactJsonLd(validContactData)).not.toThrow()
    })

    test('should throw error for invalid contact point', () => {
      const invalidData = {
        ...validContactData,
        mainEntity: {
          '@type': 'Organization',
          'name': 'Test Org',
          'contactPoint': [
            {
              '@type': 'ContactPoint'
              // Missing required fields
            }
          ]
        }
      }
      expect(() => validateContactJsonLd(invalidData)).toThrow('Missing required fields in ContactPoint')
    })
  })
}) 