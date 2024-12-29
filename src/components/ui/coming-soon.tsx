"use client"

import { Construction, Timer, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface ComingSoonProps {
  title?: string
  message?: string
  eta?: string
  notifyButton?: boolean
}

export function ComingSoon({ 
  title = "Coming Soon", 
  message = "This feature is under construction and will be available soon.",
  eta,
  notifyButton = true
}: ComingSoonProps) {
  const handleNotifyMe = () => {
    // TODO: Implement notification subscription
    console.log("Notification requested")
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center"
    >
      <div className="relative mb-8">
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            y: [0, -5, 5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10"
        >
          <Construction className="w-24 h-24 text-primary" />
        </motion.div>
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl transform -translate-y-4" />
      </div>

      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4"
      >
        {title}
      </motion.h2>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 dark:text-gray-300 max-w-md mb-6 leading-relaxed"
      >
        {message}
      </motion.p>

      {eta && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6"
        >
          <Timer className="w-4 h-4" />
          <span>Expected completion: {eta}</span>
        </motion.div>
      )}

      {notifyButton && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleNotifyMe}
            className="bg-primary hover:bg-primary/90 text-white"
            size="lg"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notify Me When Available
          </Button>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full"
      >
        {[
          {
            title: "Under Development",
            description: "Our team is actively working on this feature"
          },
          {
            title: "Testing Phase",
            description: "Ensuring everything works perfectly"
          },
          {
            title: "Coming Soon",
            description: "Almost ready for release"
          }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
          >
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {item.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
} 