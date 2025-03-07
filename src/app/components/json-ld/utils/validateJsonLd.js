// Validate basic JSON-LD structure
export function validateBasicJsonLd(data) {
  if (!data) {
    throw new Error('JSON-LD data is required')
  }

  if (!data['@context'] || data['@context'] !== 'https://schema.org') {
    throw new Error('Invalid or missing @context. Must be "https://schema.org"')
  }

  if (!data['@type']) {
    throw new Error('Missing @type in JSON-LD data')
  }

  return true
}

// Validate Vehicle JSON-LD
export function validateVehicleJsonLd(data) {
  validateBasicJsonLd(data)

  const requiredFields = ['name', 'description', 'model', 'manufacturer']
  const missingFields = requiredFields.filter(field => !data[field])

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields in Vehicle JSON-LD: ${missingFields.join(', ')}`)
  }

  // Validate nested objects
  if (data.vehicleEngine) {
    if (!data.vehicleEngine['@type'] || data.vehicleEngine['@type'] !== 'EngineSpecification') {
      throw new Error('Invalid vehicleEngine specification')
    }
  }

  if (data.mileageFromOdometer) {
    if (!data.mileageFromOdometer['@type'] || !data.mileageFromOdometer.value) {
      throw new Error('Invalid mileageFromOdometer specification')
    }
  }

  return true
}

// Validate Organization JSON-LD
export function validateOrganizationJsonLd(data) {
  validateBasicJsonLd(data)

  const requiredFields = ['name', 'description', 'url']
  const missingFields = requiredFields.filter(field => !data[field])

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields in Organization JSON-LD: ${missingFields.join(', ')}`)
  }

  // Validate URL format
  try {
    new URL(data.url)
  } catch (e) {
    throw new Error('Invalid URL in Organization JSON-LD')
  }

  return true
}

// Validate FAQ JSON-LD
export function validateFaqJsonLd(data) {
  validateBasicJsonLd(data)

  if (!data.mainEntity || !Array.isArray(data.mainEntity)) {
    throw new Error('FAQ JSON-LD must have mainEntity array')
  }

  data.mainEntity.forEach((qa, index) => {
    if (!qa['@type'] || qa['@type'] !== 'Question') {
      throw new Error(`Invalid Question type at index ${index}`)
    }
    if (!qa.name) {
      throw new Error(`Missing question text at index ${index}`)
    }
    if (!qa.acceptedAnswer || !qa.acceptedAnswer['@type'] || qa.acceptedAnswer['@type'] !== 'Answer') {
      throw new Error(`Invalid Answer at index ${index}`)
    }
    if (!qa.acceptedAnswer.text) {
      throw new Error(`Missing answer text at index ${index}`)
    }
  })

  return true
}

// Validate Contact JSON-LD
export function validateContactJsonLd(data) {
  validateBasicJsonLd(data)

  if (!data.mainEntity || data.mainEntity['@type'] !== 'Organization') {
    throw new Error('Contact JSON-LD must have mainEntity of type Organization')
  }

  const mainEntity = data.mainEntity
  const requiredFields = ['name', 'contactPoint']
  const missingFields = requiredFields.filter(field => !mainEntity[field])

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields in Contact JSON-LD: ${missingFields.join(', ')}`)
  }

  if (!Array.isArray(mainEntity.contactPoint)) {
    throw new Error('contactPoint must be an array')
  }

  mainEntity.contactPoint.forEach((contact, index) => {
    if (!contact['@type'] || contact['@type'] !== 'ContactPoint') {
      throw new Error(`Invalid ContactPoint type at index ${index}`)
    }
    if (!contact.telephone || !contact.contactType) {
      throw new Error(`Missing required fields in ContactPoint at index ${index}`)
    }
  })

  return true
} 