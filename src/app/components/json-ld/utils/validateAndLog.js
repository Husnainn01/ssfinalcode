import {
  validateBasicJsonLd,
  validateVehicleJsonLd,
  validateOrganizationJsonLd,
  validateFaqJsonLd,
  validateContactJsonLd
} from './validateJsonLd.js';

/**
 * Validates JSON-LD data based on its @type and logs any issues
 * @param {Object} data - The JSON-LD data to validate
 * @param {string} componentName - The name of the component using this validation
 * @returns {boolean} - Whether the data is valid
 */
export function validateJsonLdData(data, componentName = 'Unknown Component') {
  if (!data) {
    console.error(`[JSON-LD] Invalid data in ${componentName}: Data is null or undefined`);
    return false;
  }

  try {
    // First validate basic structure
    validateBasicJsonLd(data);
    
    // Then validate based on type
    const type = data['@type'];
    
    if (type === 'Vehicle' || type === 'Car' || type === 'AutomobileVehicle') {
      validateVehicleJsonLd(data);
    } else if (type === 'Organization' || type === 'LocalBusiness' || type === 'AutoDealer') {
      validateOrganizationJsonLd(data);
    } else if (type === 'FAQPage') {
      validateFaqJsonLd(data);
    } else if (type === 'ContactPage') {
      validateContactJsonLd(data);
    }
    
    // Data passed all validations
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[JSON-LD] Validation error in ${componentName}:`, error.message);
      console.debug('Invalid data:', data);
    } else {
      // In production, log more discreetly
      console.warn(`[JSON-LD] Issue with structured data in ${componentName}`);
    }
    return false;
  }
}

/**
 * Safe JSON-LD generator that validates before returning
 * @param {Function} generator - JSON-LD generator function
 * @param {Object} params - Parameters for the generator
 * @param {string} componentName - Component name for logging
 * @returns {Object|null} - Valid JSON-LD or null if invalid
 */
export function safeJsonLdGenerator(generator, params, componentName) {
  if (!generator || typeof generator !== 'function') {
    console.error('[JSON-LD] Generator is not a function');
    return null;
  }
  
  try {
    const data = generator(params);
    const isValid = validateJsonLdData(data, componentName);
    return isValid ? data : null;
  } catch (error) {
    console.error(`[JSON-LD] Error generating data in ${componentName}:`, error);
    return null;
  }
} 