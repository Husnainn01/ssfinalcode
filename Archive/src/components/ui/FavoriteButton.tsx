"use client"

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from './button'
import { useFavorites } from '@/context/FavoritesContext'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from './use-toast'

interface FavoriteButtonProps {
  carId: string | number
}

export function FavoriteButton({ carId }: FavoriteButtonProps) {
  const normalizedCarId = carId.toString()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { addFavorite, removeFavorite, isFavorite, favorites } = useFavorites()
  const isFavorited = isFavorite(normalizedCarId)

  useEffect(() => {
    console.log('FavoriteButton state:', { 
      carId: normalizedCarId, 
      isFavorited, 
      favorites 
    })
  }, [normalizedCarId, isFavorited, favorites])

  const handleClick = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to add favorites",
        variant: "destructive"
      })
      return
    }

    if (isLoading) return

    setIsLoading(true)
    try {
      if (isFavorited) {
        await removeFavorite(normalizedCarId)
        toast({
          title: "Success",
          description: "Removed from favorites"
        })
      } else {
        await addFavorite(normalizedCarId)
        toast({
          title: "Success",
          description: "Added to favorites"
        })
      }
    } catch (error) {
      console.error('Favorite action failed:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update favorites",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isLoading}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-500'
        }`}
      />
    </Button>
  )
} 