"use client"

import { useState, useEffect } from 'react'

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

// Client-side cache
const statsCache = {
  data: null,
  timestamp: null,
  ttl: 30 * 1000 // 30 seconds cache TTL
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchStats = async () => {
      try {
        // Check client-side cache first
        const now = Date.now()
        if (statsCache.data && statsCache.timestamp && (now - statsCache.timestamp < statsCache.ttl)) {
          setStats(statsCache.data)
          setLoading(false)
          return
        }

        const response = await fetch('/api/dashboard/stats', {
          signal: controller.signal
        })

        if (!response.ok) throw new Error('Failed to fetch stats')

        const data = await response.json()

        // Update client-side cache
        statsCache.data = data
        statsCache.timestamp = now

        if (isMounted) {
          setStats(data)
          setLoading(false)
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Error fetching stats:', err)
        if (isMounted) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    fetchStats()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, []) // Empty dependency array means this only runs once on mount

  return { stats, loading, error }
} 