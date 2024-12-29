"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Truck, Package, CheckCircle, Clock, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Shipment {
  id: string
  trackingNumber: string
  status: 'in-transit' | 'delivered' | 'pending'
  estimatedDelivery: string
  lastUpdate: string
}

const activeShipments: Shipment[] = [
  {
    id: "SHP-001",
    trackingNumber: "1Z999AA1234567890",
    status: "in-transit",
    estimatedDelivery: "2024-03-18",
    lastUpdate: "Package in transit to destination"
  },
  {
    id: "SHP-002",
    trackingNumber: "1Z999AA1234567891",
    status: "pending",
    estimatedDelivery: "2024-03-20",
    lastUpdate: "Label created"
  }
]

const statusIcons = {
  'in-transit': Truck,
  'delivered': CheckCircle,
  'pending': Clock
}

const statusColors = {
  'in-transit': "bg-blue-100 text-blue-800",
  'delivered': "bg-green-100 text-green-800",
  'pending': "bg-yellow-100 text-yellow-800"
}

export function ShipmentTracking() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredShipments = useMemo(() => {
    return activeShipments.filter(shipment => 
      shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Search by tracking number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
      </div>

      <AnimatePresence mode="popLayout">
        {filteredShipments.map((shipment) => {
          const StatusIcon = statusIcons[shipment.status]
          return (
            <motion.div
              key={shipment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="p-2 bg-white rounded-lg"
                  >
                    <StatusIcon className="h-5 w-5 text-gray-600" />
                  </motion.div>
                  <div>
                    <p className="font-medium text-sm">Tracking #{shipment.trackingNumber}</p>
                    <p className="text-xs text-gray-500">
                      Est. Delivery: {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge className={statusColors[shipment.status]}>
                  {shipment.status.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">{shipment.lastUpdate}</p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" size="sm">
                    Track Package
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
} 