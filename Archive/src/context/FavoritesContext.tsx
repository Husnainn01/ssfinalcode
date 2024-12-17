"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface FavoritesContextType {
  favorites: string[]
  addFavorite: (carId: string) => Promise<void>
  removeFavorite: (carId: string) => Promise<void>
  isFavorite: (carId: string) => boolean
  isLoading: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/favorites', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setFavorites(data.map((fav: any) => fav.carId))
        }
      } catch (error) {
        console.error('Error fetching favorites:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      fetchFavorites()
    }
  }, [isAuthenticated, user, authLoading])

  const isFavorite = (carId: string): boolean => {
    return favorites.includes(carId)
  }

  const addFavorite = async (carId: string) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add favorites')
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ carId })
      })

      if (!response.ok) {
        throw new Error('Failed to add favorite')
      }

      setFavorites(prev => [...prev, carId])
    } catch (error) {
      console.error('Error adding favorite:', error)
      throw error
    }
  }

  const removeFavorite = async (carId: string) => {
    if (!isAuthenticated) {
      throw new Error('Please login to remove favorites')
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ carId })
      })

      if (!response.ok) {
        throw new Error('Failed to remove favorite')
      }

      setFavorites(prev => prev.filter(id => id !== carId))
    } catch (error) {
      console.error('Error removing favorite:', error)
      throw error
    }
  }

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      addFavorite, 
      removeFavorite, 
      isFavorite,
      isLoading 
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}