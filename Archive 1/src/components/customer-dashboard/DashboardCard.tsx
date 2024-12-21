import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Construction } from "lucide-react"

interface DashboardCardProps {
  title: string
  value: string
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
  }
  onClick?: () => void
  comingSoon?: boolean
}

export function DashboardCard({ 
  title, 
  value, 
  icon, 
  trend, 
  onClick,
  comingSoon 
}: DashboardCardProps) {
  return (
    <motion.div 
      className={cn(
        "bg-white rounded-xl shadow-sm p-6 transition-all duration-200 relative",
        onClick && !comingSoon && "cursor-pointer"
      )}
      onClick={onClick}
      whileHover={{ y: comingSoon ? 0 : -5 }}
      layout
    >
      {comingSoon && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Construction className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-xs text-gray-500">Coming Soon</p>
          </motion.div>
        </div>
      )}
      <motion.div 
        className="flex items-center justify-between mb-4"
        layout
      >
        <motion.div
          whileHover={{ scale: comingSoon ? 1 : 1.1, rotate: comingSoon ? 0 : 5 }}
          className="p-3 bg-gray-50 rounded-lg"
        >
          {icon}
        </motion.div>
        {trend && !comingSoon && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "text-sm font-medium",
              trend.value >= 0 ? "text-green-600" : "text-red-600"
            )}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </motion.span>
            <motion.span 
              className="text-gray-500 ml-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {trend.label}
            </motion.span>
          </motion.div>
        )}
      </motion.div>
      <motion.h3 
        className="text-sm font-medium text-gray-600"
        layout
      >
        {title}
      </motion.h3>
      <motion.p 
        className={cn(
          "text-2xl font-semibold mt-2",
          comingSoon && "text-gray-400"
        )}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        {value}
      </motion.p>
    </motion.div>
  )
}
