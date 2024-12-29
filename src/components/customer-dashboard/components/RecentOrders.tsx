"use client"

import { useState, useMemo } from "react"
import { Package, ExternalLink, Clock, ArrowUpDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Order {
  id: string
  date: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  items: number
  total: string
}

const recentOrders: Order[] = [
  {
    id: "ORD-001",
    date: "2024-03-15",
    status: "processing",
    items: 3,
    total: "$245.99"
  },
  {
    id: "ORD-002",
    date: "2024-03-14",
    status: "shipped",
    items: 1,
    total: "$89.99"
  },
  {
    id: "ORD-003",
    date: "2024-03-13",
    status: "delivered",
    items: 2,
    total: "$159.99"
  }
]

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800"
}

export function RecentOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...recentOrders]
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })
  }, [statusFilter, sortOrder])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="flex items-center space-x-2"
        >
          <span>Date</span>
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {filteredAndSortedOrders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all hover:shadow-md"
          >
            <div className="flex items-center space-x-4">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="p-2 bg-white rounded-lg"
              >
                <Package className="h-5 w-5 text-gray-600" />
              </motion.div>
              <div>
                <p className="font-medium">{order.id}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={statusColors[order.status]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              <div className="text-right">
                <p className="font-medium">{order.total}</p>
                <p className="text-sm text-gray-500">{order.items} items</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
} 