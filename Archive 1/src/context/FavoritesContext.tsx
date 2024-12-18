"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useCustomerAuth } from '@/hooks/useCustomerAuth'
import { useToast } from '@/components/ui/use-toast'

interface FavoriteContextType {
  favorites: any[]
  isLoading: boolean
  error: string | null
  addFavorite: (carId: string) => Promise<void>
  removeFavorite: (carId: string) => Promise<void>
  refreshFavorites: () => Promise<void>
  isFavorite: (carId: string) => boolean
}

const FavoritesContext = createContext<FavoriteContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { isAuthenticated } = useCustomerAuth()

  const isFavorite = (carId: string) => {
    return favorites.some(fav => fav.id === carId || fav.carId === carId)
  }

  const fetchFavorites = async () => {
    try {
      console.log('Starting to fetch favorites...')
      const response = await fetch('/api/favorites', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch favorites')
      }

      setFavorites(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching favorites:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch favorites')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load favorites. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addFavorite = async (carId: string) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ carId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add favorite')
      }

      await fetchFavorites() // Refresh the favorites list
      toast({
        title: "Success",
        description: "Added to favorites",
      })
    } catch (error) {
      console.error('Error adding favorite:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add favorite",
        variant: "destructive"
      })
    }
  }

  const removeFavorite = async (carId: string) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ carId })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove favorite')
      }

      await fetchFavorites() // Refresh the favorites list
      toast({
        title: "Success",
        description: "Removed from favorites",
      })
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove favorite",
        variant: "destructive"
      })
    }
  }

  const refreshFavorites = async () => {
    setIsLoading(true)
    await fetchFavorites()
  }

  useEffect(() => {
    console.log('FavoritesContext auth state:', { isAuthenticated })
    if (isAuthenticated) {
      console.log('User is authenticated, fetching favorites')
      fetchFavorites()
    } else {
      console.log('User is not authenticated, clearing favorites')
      setFavorites([])
      setIsLoading(false)
    }
  }, [isAuthenticated])

  return (
    <FavoritesContext.Provider value={{
      favorites,
      isLoading,
      error,
      addFavorite,
      removeFavorite,
      refreshFavorites,
      isFavorite
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
