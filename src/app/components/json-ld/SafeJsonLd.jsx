import { useState, useEffect } from 'react';
import { validateJsonLdData } from './utils/validateAndLog.js';

/**
 * A safer version of JsonLd component that validates data before rendering
 */
export default function SafeJsonLd({ data, componentName = 'SafeJsonLd' }) {
  const [validatedData, setValidatedData] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Reset state when data changes
    setIsValidating(true);
    setIsValid(false);
    setValidatedData(null);
    
    try {
      // Validate the data
      const valid = validateJsonLdData(data, componentName);
      
      if (valid) {
        setValidatedData(data);
        setIsValid(true);
      }
    } catch (error) {
      console.error(`[JSON-LD] Error in ${componentName}:`, error);
    } finally {
      setIsValidating(false);
    }
  }, [data, componentName]);

  // Don't render anything during validation or if data is invalid
  if (isValidating || !isValid || !validatedData) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(validatedData) }}
    />
  );
}

/**
 * Create a SafeJsonLd for a vehicle
 */
export function VehicleSafeJsonLd({ vehicle, componentName = 'VehicleSafeJsonLd' }) {
  if (!vehicle) return null;
  
  // Generate vehicle JSON-LD data
  const vehicleData = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "name": vehicle.name,
    "description": vehicle.description || `${vehicle.year} ${vehicle.manufacturer} ${vehicle.model}`,
    "model": vehicle.model,
    "manufacturer": vehicle.manufacturer,
    "vehicleConfiguration": vehicle.configuration,
    "category": vehicle.category,
    "vehicleEngine": vehicle.engine ? {
      "@type": "EngineSpecification",
      "engineType": vehicle.engine.type,
      "engineDisplacement": vehicle.engine.displacement,
      "fuelType": vehicle.engine.fuel
    } : undefined,
    "mileageFromOdometer": vehicle.mileage ? {
      "@type": "QuantitativeValue",
      "value": vehicle.mileage,
      "unitCode": "KMT"
    } : undefined,
    "modelDate": vehicle.year || vehicle.modelYear,
    "vehicleTransmission": vehicle.transmission,
    "color": vehicle.color,
    "offers": vehicle.price ? {
      "@type": "Offer",
      "price": vehicle.price,
      "priceCurrency": "USD",
      "availability": vehicle.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    } : undefined
  };
  
  return <SafeJsonLd data={vehicleData} componentName={componentName} />;
}

/**
 * Create a SafeJsonLd for an organization
 */
export function OrganizationSafeJsonLd({ organization, componentName = 'OrganizationSafeJsonLd' }) {
  if (!organization) return null;
  
  const orgData = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "name": organization.name,
    "description": organization.description,
    "url": organization.url,
    "logo": organization.logo,
    "address": organization.address ? {
      "@type": "PostalAddress",
      "addressCountry": organization.address.country,
      "addressLocality": organization.address.city,
      "addressRegion": organization.address.region,
      "postalCode": organization.address.postalCode,
      "streetAddress": organization.address.street
    } : undefined,
    "telephone": organization.phone,
    "email": organization.email
  };
  
  return <SafeJsonLd data={orgData} componentName={componentName} />;
} 