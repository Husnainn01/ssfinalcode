// Simple test file for JSON-LD validation
const validators = require('../validateJsonLd.cjs');

test('Basic JSON-LD validation', () => {
  const validData = {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    'name': 'Test Object'
  };
  
  expect(() => validators.validateBasicJsonLd(validData)).not.toThrow();
  
  expect(() => validators.validateBasicJsonLd(null)).toThrow('JSON-LD data is required');
  
  expect(() => validators.validateBasicJsonLd({
    '@context': 'wrong-context',
    '@type': 'Thing'
  })).toThrow('Invalid or missing @context');
});

test('Vehicle JSON-LD validation', () => {
  const validVehicle = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    'name': 'Test Vehicle',
    'description': 'Test Description',
    'model': 'Test Model',
    'manufacturer': 'Test Manufacturer'
  };
  
  expect(() => validators.validateVehicleJsonLd(validVehicle)).not.toThrow();
  
  // Test with invalid vehicle type
  expect(() => validators.validateVehicleJsonLd({
    '@context': 'https://schema.org',
    '@type': 'NotAVehicle',
    'name': 'Test Vehicle',
    'description': 'Test Description',
    'model': 'Test Model',
    'manufacturer': 'Test Manufacturer'
  })).toThrow('Invalid vehicle type');
  
  // Test Kei truck specific structure from your JsonLd.jsx generator
  const keiTruck = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    'name': 'Suzuki Carry',
    'description': 'Mini truck for sale',
    'model': 'Carry',
    'manufacturer': 'Suzuki',
    'vehicleConfiguration': 'Mini Truck',
    'category': 'Kei Truck',
    'vehicleEngine': {
      '@type': 'EngineSpecification',
      'engineType': 'Gasoline',
      'engineDisplacement': '660cc',
      'fuelType': 'Gasoline'
    },
    'additionalProperty': [
      {
        '@type': 'PropertyValue',
        'name': 'Vehicle Type',
        'value': 'Kei Truck'
      }
    ]
  };
  
  expect(() => validators.validateVehicleJsonLd(keiTruck)).not.toThrow();
});

test('Organization JSON-LD validation', () => {
  const validOrg = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    'name': 'Global Drive Motors',
    'url': 'https://globaldrivemotors.com'
  };
  
  expect(() => validators.validateOrganizationJsonLd(validOrg)).not.toThrow();
  
  // Test invalid URL
  expect(() => validators.validateOrganizationJsonLd({
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    'name': 'Global Drive Motors',
    'url': 'invalid-url'
  })).toThrow('Invalid URL');
  
  // Test missing name
  expect(() => validators.validateOrganizationJsonLd({
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    'url': 'https://globaldrivemotors.com'
  })).toThrow('Missing required fields');
});

test('FAQ JSON-LD validation', () => {
  const validFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How to import a Kei truck?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Contact our import specialists'
        }
      }
    ]
  };
  
  expect(() => validators.validateFaqJsonLd(validFaq)).not.toThrow();
  
  // Test invalid FAQ with missing question
  expect(() => validators.validateFaqJsonLd({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Contact our import specialists'
        }
      }
    ]
  })).toThrow('Missing question text');
});

test('Contact JSON-LD validation', () => {
  const validContact = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'mainEntity': {
      '@type': 'Organization',
      'name': 'Global Drive Motors',
      'contactPoint': [
        {
          '@type': 'ContactPoint',
          'telephone': '+81-90-8846-3843',
          'contactType': 'sales'
        }
      ]
    }
  };
  
  expect(() => validators.validateContactJsonLd(validContact)).not.toThrow();
  
  // Test missing telephone in contactPoint
  expect(() => validators.validateContactJsonLd({
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'mainEntity': {
      '@type': 'Organization',
      'name': 'Global Drive Motors',
      'contactPoint': [
        {
          '@type': 'ContactPoint',
          'contactType': 'sales'
        }
      ]
    }
  })).toThrow('Missing required fields in ContactPoint');
}); 