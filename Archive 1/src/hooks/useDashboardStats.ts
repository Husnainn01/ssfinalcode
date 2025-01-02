"use client"

import { useState, useEffect, useRef } from 'react'

interface DashboardStats {
  users: {
    total: number
    super_admins: number
    admins: number
    editors: number
    managers: number
  }
  cars: {
    total: number
    active: number
  }
  posts: {
    total: number
    published: number
  }
  totalViews: number
}

interface StatsCache {
  data: DashboardStats | null;
  timestamp: number | null;
}

// Initialize the cache with proper types
const statsCache: StatsCache = {
  data: null,
  timestamp: null
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isMountedRef = useRef(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const now = Date.now()
        const isMounted = isMountedRef.current

        // Check cache validity (5 minutes)
        if (statsCache.data && statsCache.timestamp && 
            now - statsCache.timestamp < 5 * 60 * 1000) {
          if (isMounted) {
            setStats(statsCache.data)
            setIsLoading(false)
          }
          return
        }

        const response = await fetch('/api/dashboard/stats')
        const data = await response.json()

        // Update client-side cache
        statsCache.data = data
        statsCache.timestamp = now

        if (isMounted) {
          setStats(data)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        if (isMountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    fetchStats()

    return () => {
      isMountedRef.current = false
    }
  }, [])

  return { stats, isLoading }
} 