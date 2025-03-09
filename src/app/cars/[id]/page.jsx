"use client"

import { JsonLd, generateVehicleJsonLd } from '@/components/json-ld'
import { useEffect, useState } from 'react'

export async function generateMetadata({ params }) {
  const vehicle = await fetchVehicleById(params.slug)
  
  return {
    title: `${vehicle.year} ${vehicle.manufacturer} ${vehicle.model} | Global Drive Motors`,
    description: `${vehicle.year} ${vehicle.manufacturer} ${vehicle.model} for sale. ${vehicle.mileage}km, ${vehicle.transmission}, ${vehicle.fuelType}. Ready for export with complete documentation.`,
    openGraph: {
      title: `${vehicle.year} ${vehicle.manufacturer} ${vehicle.model}`,
      description: vehicle.description,
      images: vehicle.images?.map(img => ({
        url: img.url,
        width: 1200,
        height: 630,
        alt: `${vehicle.year} ${vehicle.manufacturer} ${vehicle.model}`,
      })),
    }
  }
}

export default function VehicleDetailPage({ params }) {
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVehicleById(params.slug)
      .then(data => {
        setVehicle(data)
        setLoading(false)
      })
  }, [params.slug])

  if (loading) return <div>Loading...</div>
  if (!vehicle) return <div>Vehicle not found</div>

  const structuredData = generateVehicleJsonLd(vehicle)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <JsonLd data={structuredData} />
      
      <div className="mx-auto max-w-7xl px-4">
        {/* Your existing vehicle detail components */}
      </div>
    </div>
  )
} 