"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Heart, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck,
  Plus
} from "lucide-react"
import { DashboardCard } from "@/components/customer-dashboard/DashboardCard"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { RecentOrders } from "@/components/customer-dashboard/components/RecentOrders"
import { ShipmentTracking } from "@/components/customer-dashboard/components/ShipmentTracking"
import { useCustomerAuth } from '@/hooks/useCustomerAuth'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
}

const headingVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 200
    }
  }
}

const buttonVariants = {
  hover: { 
    scale: 1.05,
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)"
  },
  tap: { 
    scale: 0.95,
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)"
  }
}

export default function CustomerDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useCustomerAuth()
  const [mounted, setMounted] = useState(false)
  const [favoritesCount, setFavoritesCount] = useState(0)

  useEffect(() => {
    setMounted(true)
    
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorites/count', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setFavoritesCount(data.count)
        }
      } catch (error) {
        console.error("Error fetching favorites:", error)
      }
    }

    fetchFavorites()
  }, [])

  const stats = [
    {
      title: "Favorite Items",
      value: favoritesCount.toString(),
      icon: <Heart className="h-4 w-4 text-pink-500" />,
      trend: { value: 2, label: "from last month" },
      href: '/customer-dashboard/favorites'
    },
    {
      title: "Active Shipments",
      value: "5",
      icon: <Truck className="h-4 w-4 text-blue-500" />,
      trend: { value: 12, label: "from last month" },
      href: '/customer-dashboard/track-shipment'
    },
    {
      title: "Pending Orders",
      value: "3",
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      trend: { value: -2, label: "from last month" },
      href: '/customer-dashboard/orders'
    },
    {
      title: "Total Orders",
      value: "28",
      icon: <Package className="h-4 w-4 text-green-500" />,
      trend: { value: 8, label: "from last month" },
      href: '/customer-dashboard/orders'
    }
  ]

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <motion.h2 
          className="text-3xl font-bold tracking-tight"
          variants={headingVariants}
          whileHover={{ 
            scale: 1.02,
            transition: { type: "spring", stiffness: 300 }
          }}
        >
          Dashboard
        </motion.h2>
        <motion.div
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button 
            onClick={() => router.push('/customer-dashboard/create-order')}
            className="bg-blue-600 hover:bg-blue-700 group"
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Plus className="mr-2 h-4 w-4" />
            </motion.div>
            <span className="group-hover:tracking-wider transition-all">
              Create New Order
            </span>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        whileHover={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {stats.map((card, index) => (
          <motion.div
            key={card.title}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03,
              transition: { type: "spring", stiffness: 300 }
            }}
            whileTap={{ scale: 0.98 }}
            custom={index}
          >
            <DashboardCard
              {...card}
              onClick={() => {
                router.push(card.href)
                toast({
                  title: `Navigating to ${card.title}`,
                  description: "Loading your content...",
                  duration: 2000
                })
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="grid gap-6 md:grid-cols-2"
      >
        <motion.div
          variants={itemVariants}
          whileHover={{ 
            y: -5,
            transition: {
              type: "spring",
              stiffness: 300
            }
          }}
          whileTap={{ scale: 0.99 }}
          className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md"
        >
          <motion.h3 
            className="text-lg font-semibold mb-4"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Recent Orders
          </motion.h3>
          <RecentOrders />
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          whileHover={{ 
            y: -5,
            transition: {
              type: "spring",
              stiffness: 300
            }
          }}
          whileTap={{ scale: 0.99 }}
          className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md"
        >
          <motion.h3 
            className="text-lg font-semibold mb-4"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Track Shipments
          </motion.h3>
          <ShipmentTracking />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
