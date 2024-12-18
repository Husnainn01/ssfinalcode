"use client"

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

const vehicleTypes = [
  {
    type: "Best Sellers",
    icon: FaCrown,
    description: "Most Popular Models",
    models: [
      { name: "Toyota Harrier", count: "1,728", trend: "+12%" },
      { name: "Toyota Land Cruiser", count: "1,924", trend: "+8%" },
      { name: "Nissan X-Trail", count: "2,244", trend: "+15%" },
    ],
    gradientFrom: "from-amber-50",
    iconColor: "text-amber-600",
    trendColor: "text-amber-600",
  },
  {
    type: "Best Value",
    icon: FaTag,
    description: "Most Economical Choices",
    models: [
      { name: "Toyota Hiace Van", count: "3,384", trend: "-5%" },
      { name: "Nissan Caravan Van", count: "918", trend: "-8%" },
      { name: "Nissan Ad Van", count: "269", trend: "-3%" },
    ],
    gradientFrom: "from-emerald-50",
    iconColor: "text-emerald-600",
    trendColor: "text-emerald-600",
  },
  {
    type: "Premium Selection",
    icon: FaMedal,
    description: "Luxury Vehicles",
    models: [
      { name: "Mercedes-Benz C-Class", count: "2,807", trend: "+20%" },
      { name: "BMW 3 Series", count: "2,972", trend: "+18%" },
      { name: "Audi A4", count: "1,246", trend: "+10%" },
    ],
    gradientFrom: "from-blue-50",
    iconColor: "text-blue-600",
    trendColor: "text-blue-600",
  },
  {
    type: "High Performance",
    icon: FaGauge,
    description: "Sports & Performance",
    models: [
      { name: "Nissan GT-R", count: "739", trend: "+25%" },
      { name: "Toyota Supra", count: "531", trend: "+30%" },
      { name: "Subaru WRX STI", count: "865", trend: "+22%" },
    ],
    gradientFrom: "from-red-50",
    iconColor: "text-red-600",
    trendColor: "text-red-600",
  },
]

export default function SingleBox() {
  return (
    <div className="space-y-8 p-4">
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Collections</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our handpicked selection of vehicles across various categories
          </p>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {vehicleTypes.map((category) => (
              <Card 
                key={category.type}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 group border border-gray-100"
              >
                <CardHeader className={`bg-gradient-to-r ${category.gradientFrom} to-white p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                      <category.icon 
                        className={`h-6 w-6 ${category.iconColor} transform transition-transform duration-300 group-hover:scale-110`} 
                      />
                      <span className="truncate">{category.type}</span>
                    </CardTitle>
                  </div>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </CardHeader>
                <CardContent className="p-4">
                  <ol className="space-y-3">
                    {category.models.map((model, index) => (
                      <li 
                        key={model.name}
                        className="flex items-center gap-3 text-sm group/item hover:bg-gray-50 p-2 rounded-md transition-colors duration-200"
                      >
                        <span className="font-medium text-gray-500 text-xs min-w-[20px]">
                          #{index + 1}
                        </span>
                        <span className="flex-1 truncate font-medium">
                          <a href="#" className={`${category.iconColor} hover:underline`}>
                            {model.name}
                          </a>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {model.count}
                          </span>
                          <span className={`text-xs font-medium ${category.trendColor}`}>
                            {model.trend}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <a
                      href="#"
                      className={`flex items-center justify-center gap-2 text-sm font-medium ${category.iconColor} hover:underline`}
                    >
                      View All
                      <FaChevronRight className="h-4 w-4" />
                    </a>
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