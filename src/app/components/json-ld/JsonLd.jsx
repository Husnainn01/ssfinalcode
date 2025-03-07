export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function generateVehicleJsonLd(vehicle) {
  const isKeiTruck = vehicle.category?.toLowerCase().includes('kei') || 
                     vehicle.type?.toLowerCase().includes('kei') ||
                     vehicle.manufacturer?.toLowerCase().includes('daihatsu') ||
                     vehicle.manufacturer?.toLowerCase().includes('suzuki carry') ||
                     vehicle.manufacturer?.toLowerCase().includes('honda acty') ||
                     vehicle.manufacturer?.toLowerCase().includes('subaru sambar')

  const baseStructure = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "name": vehicle.name,
    "description": vehicle.description,
    "model": vehicle.model,
    "manufacturer": vehicle.manufacturer,
    "vehicleConfiguration": isKeiTruck ? "Mini Truck" : vehicle.configuration,
    "category": isKeiTruck ? "Kei Truck" : vehicle.category,
    "vehicleEngine": {
      "@type": "EngineSpecification",
      "engineType": vehicle.engineType,
      "engineDisplacement": vehicle.engineDisplacement,
      "fuelType": vehicle.fuelType
    },
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": vehicle.mileage,
      "unitCode": "KMT"
    },
    "modelDate": vehicle.modelYear,
    "vehicleTransmission": vehicle.transmission,
    "color": vehicle.color,
    "numberOfDoors": vehicle.doors,
    "driveWheelConfiguration": vehicle.driveType,
    "offers": {
      "@type": "Offer",
      "price": vehicle.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "areaServed": {
        "@type": "Country",
        "name": "United States"
      }
    },
    "image": vehicle.images?.map(img => ({
      "@type": "ImageObject",
      "url": img.url,
      "caption": img.caption
    }))
  }

  // Add Kei truck specific properties if it's a Kei truck
  if (isKeiTruck) {
    return {
      ...baseStructure,
      "cargoVolume": vehicle.cargoVolume ? {
        "@type": "QuantitativeValue",
        "value": vehicle.cargoVolume,
        "unitCode": "MTQ"
      } : undefined,
      "payload": vehicle.payload ? {
        "@type": "QuantitativeValue",
        "value": vehicle.payload,
        "unitCode": "KGM"
      } : undefined,
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Vehicle Type",
          "value": "Kei Truck"
        },
        {
          "@type": "PropertyValue",
          "name": "Import Status",
          "value": "Available for USA Import"
        }
      ]
    }
  }

  return baseStructure
}

// Generate structured data for a list of vehicles
export function generateVehicleListingJsonLd(vehicles, totalCount) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": totalCount,
    "itemListElement": vehicles.map((vehicle, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": generateVehicleJsonLd(vehicle)
    }))
  }
} 