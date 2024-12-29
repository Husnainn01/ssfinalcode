"use client"

import { useState, useEffect } from 'react'

export function useJapanTime() {
  const [japanTime, setJapanTime] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const getJapanTime = () => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        weekday: 'short',
        month: 'short',
        day: '2-digit',
      }

      const formatter = new Intl.DateTimeFormat('en-US', options)
      return formatter.format(new Date())
    } catch (error) {
      console.error('Error formatting Japan time:', error)
      return 'Time unavailable'
    }
  }

  useEffect(() => {
    setIsLoading(true)
    setJapanTime(getJapanTime())
    setIsLoading(false)

    const interval = setInterval(() => {
      setJapanTime(getJapanTime())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return { japanTime, isLoading }
} 