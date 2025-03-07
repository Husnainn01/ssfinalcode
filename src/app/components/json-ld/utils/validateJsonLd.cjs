/**
 * Validates basic JSON-LD structure
 */
function validateBasicJsonLd(data) {
  if (!data) {
    throw new Error('JSON-LD data is required')
  }

  if (data['@context'] !== 'https://schema.org' && data['@context'] !== 'http://schema.org') {
    throw new Error('Invalid or missing @context')
  }

  if (!data['@type']) {
    throw new Error('Missing @type')
  }

  return true
}

/**
 * Validates Vehicle JSON-LD data
 */
function validateVehicleJsonLd(data) {
  // First validate basic structure
  validateBasicJsonLd(data)

  // Check if it's a vehicle type
  if (data['@type'] !== 'Vehicle' && data['@type'] !== 'Car' && data['@type'] !== 'AutomobileVehicle') {
    throw new Error('Invalid vehicle type')
  }

  // Check required fields
  const requiredFields = ['name', 'description', 'model', 'manufacturer']
  const missingFields = requiredFields.filter(field => !data[field])
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
  }

  // Validate vehicle engine if present
  if (data.vehicleEngine) {
    if (!data.vehicleEngine['@type'] || data.vehicleEngine['@type'] !== 'EngineSpecification') {
      throw new Error('Invalid vehicleEngine specification')
    }
  }

  // Validate mileage if present
  if (data.mileageFromOdometer) {
    if (!data.mileageFromOdometer['@type'] || !data.mileageFromOdometer.value) {
      throw new Error('Invalid mileage specification')
    }
  }

  return true
}

/**
 * Validates Organization JSON-LD data
 */
function validateOrganizationJsonLd(data) {
  validateBasicJsonLd(data)

  // Check if it's an organization type
  const orgTypes = ['Organization', 'LocalBusiness', 'AutoDealer']
  if (!orgTypes.includes(data['@type'])) {
    throw new Error('Invalid organization type')
  }

  // Check required fields
  const requiredFields = ['name']
  const missingFields = requiredFields.filter(field => !data[field])
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
  }

  // Validate URL if present
  if (data.url) {
    try {
      new URL(data.url)
    } catch (e) {
      throw new Error('Invalid URL')
    }
  }

  return true
}

/**
 * Validates FAQ JSON-LD data
 */
function validateFaqJsonLd(data) {
  validateBasicJsonLd(data)

  // Check if it's a FAQPage type
  if (data['@type'] !== 'FAQPage') {
    throw new Error('Invalid FAQ type')
  }

  // Check for mainEntity
  if (!data.mainEntity || !Array.isArray(data.mainEntity)) {
    throw new Error('Missing or invalid mainEntity')
  }

  // Validate each FAQ item
  data.mainEntity.forEach((item, index) => {
    if (item['@type'] !== 'Question') {
      throw new Error(`Invalid question type at index ${index}`)
    }

    if (!item.name) {
      throw new Error('Missing question text')
    }

    if (!item.acceptedAnswer || item.acceptedAnswer['@type'] !== 'Answer') {
      throw new Error(`Invalid answer at question "${item.name}"`)
    }

    if (!item.acceptedAnswer.text) {
      throw new Error(`Missing answer text for question "${item.name}"`)
    }
  })

  return true
}

/**
 * Validates Contact JSON-LD data
 */
function validateContactJsonLd(data) {
  validateBasicJsonLd(data)

  // Check for mainEntity
  if (!data.mainEntity || data.mainEntity['@type'] !== 'Organization') {
    throw new Error('Missing or invalid mainEntity')
  }

  // Check required fields
  if (!data.mainEntity.name) {
    throw new Error('Missing organization name')
  }

  // Validate contact points if present
  if (data.mainEntity.contactPoint) {
    if (!Array.isArray(data.mainEntity.contactPoint)) {
      throw new Error('contactPoint must be an array')
    }

    data.mainEntity.contactPoint.forEach((point, index) => {
      if (point['@type'] !== 'ContactPoint') {
        throw new Error(`Invalid contact point type at index ${index}`)
      }

      if (!point.contactType || !point.telephone) {
        throw new Error('Missing required fields in ContactPoint')
      }
    })
  }

  return true
}

module.exports = {
  validateBasicJsonLd,
  validateVehicleJsonLd,
  validateOrganizationJsonLd,
  validateFaqJsonLd,
  validateContactJsonLd
} 