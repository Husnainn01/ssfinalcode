"use client"

import { useState, useEffect } from 'react'

interface CarStats {
  totalCars: number
  carsAddedToday: number
  isLoading: boolean
  error: string | null
}

export function useCarStats() {
  const [stats, setStats] = useState<CarStats>({
    totalCars: 0,
    carsAddedToday: 0,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const fetchCarStats = async () => {
      try {
        const response = await fetch('/api/cars/stats')
        if (!response.ok) throw new Error('Failed to fetch car stats')
        
        const data = await response.json()
        setStats({
          totalCars: data.totalCars,
          carsAddedToday: data.carsAddedToday,
          isLoading: false,
          error: null
        })
      } catch (error) {
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load car statistics'
        }))
      }
    }

    fetchCarStats()
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchCarStats, 300000)

    return () => clearInterval(interval)
  }, [])

  return stats
} 