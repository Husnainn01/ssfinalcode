"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import {
  FaCar,
  FaTag,
  FaCrown,
  FaChartLine,
  FaCarSide,
  FaShield,
  FaGauge,
  FaMedal,
  FaChevronRight,
} from "react-icons/fa6"
import Link from "next/link"

export default function SingleBox() {
  const [vehicleData, setVehicleData] = useState({
    bestSellers: [],
    bestValue: [],
    premium: [],
    performance: [],
    loading: true,
    error: null
  })

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/featured-vehicles')
        const data = await response.json()
        
        setVehicleData({
          bestSellers: data.bestSellers || [],
          bestValue: data.bestValue || [],
          premium: data.premium || [],
          performance: data.performance || [],
          loading: false,
          error: null
        })
      } catch (error) {
        setVehicleData(prev => ({
          ...prev,
          loading: false,
          error: "Failed to load vehicles"
        }))
      }
    }

    fetchVehicles()
  }, [])

  const vehicleTypes = [
    {
      type: "Best Sellers",
      icon: FaCrown,
      description: "Most Popular Models",
      models: vehicleData.bestSellers,
      gradientFrom: "from-amber-50",
      iconColor: "text-amber-600",
      trendColor: "text-amber-600",
    },
    {
      type: "Best Value",
      icon: FaTag,
      description: "Most Economical Choices",
      models: vehicleData.bestValue,
      gradientFrom: "from-emerald-50",
      iconColor: "text-emerald-600",
      trendColor: "text-emerald-600",
    },
    {
      type: "Premium Selection",
      icon: FaMedal,
      description: "Luxury Vehicles",
      models: vehicleData.premium,
      gradientFrom: "from-blue-50",
      iconColor: "text-blue-600",
      trendColor: "text-blue-600",
    },
    {
      type: "High Performance",
      icon: FaGauge,
      description: "Sports & Performance",
      models: vehicleData.performance,
      gradientFrom: "from-red-50",
      iconColor: "text-red-600",
      trendColor: "text-red-600",
    },
  ]

  if (vehicleData.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="relative py-16 bg-gradient-to-b from-white/50 to-transparent rounded-3xl">
      <section className="container mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-blue-950/5 rounded-full text-blue-950 
            font-semibold text-sm mb-4">FEATURED VEHICLES</span>
          <h2 className="text-4xl font-bold text-blue-950 mb-6">
            Featured Collections
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Explore our handpicked selection of vehicles across various categories
          </p>
        </div>

        <div className="px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {vehicleTypes.map((category) => (
              <Card 
                key={category.type}
                className="group bg-white/80 backdrop-blur-sm rounded-[2rem] overflow-hidden 
                  hover:shadow-[0_15px_30px_-5px_rgba(8,_112,_184,_0.1)] 
                  transition-all duration-500 border border-gray-100/50
                  shadow-[0_10px_20px_-5px_rgba(8,_112,_184,_0.05)]"
              >
                <CardHeader 
                  className={`relative bg-gradient-to-r ${category.gradientFrom} to-white p-6 
                    overflow-hidden`}
                >
                  <div className="relative z-10">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold mb-3">
                      <category.icon 
                        className={`h-7 w-7 ${category.iconColor} transform transition-transform 
                          duration-300 group-hover:scale-110`} 
                      />
                      <span className="truncate">{category.type}</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full 
                    bg-gradient-to-br ${category.gradientFrom} to-white/0 opacity-50 
                    transition-transform duration-500 group-hover:scale-150`} />
                </CardHeader>

                <CardContent className="p-6">
                  {category.models.length > 0 ? (
                    <ol className="space-y-4">
                      {category.models.map((model, index) => (
                        <li 
                          key={model.name}
                          className="flex items-center gap-4 text-sm group/item 
                            hover:bg-gray-50/80 p-3 rounded-2xl transition-all duration-200"
                        >
                          <span className={`flex items-center justify-center w-6 h-6 rounded-full 
                            ${category.iconColor} bg-gray-100/80 text-xs font-semibold`}>
                            {index + 1}
                          </span>
                          <span className="flex-1 font-medium">
                            <Link 
                              href={`/cars/${model.slug}`} 
                              className="text-gray-700 hover:text-blue-950 transition-colors duration-200"
                            >
                              {model.name}
                            </Link>
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 font-medium">
                              {model.count}
                            </span>
                            <span className={`text-xs font-semibold ${category.trendColor} 
                              bg-gray-100/80 px-2 py-1 rounded-full`}>
                              {model.trend}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-gray-500 text-sm">No vehicles found</p>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link
                      href="/cars"
                      className={`flex items-center justify-center gap-2 text-sm font-semibold 
                        ${category.iconColor} hover:opacity-80 transition-opacity duration-200`}
                    >
                      View Collection
                      <FaChevronRight className="h-3.5 w-3.5 transition-transform duration-200 
                        group-hover:translate-x-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}