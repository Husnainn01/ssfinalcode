"use client"

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/context/FavoritesContext'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from "@/components/ui/use-toast"

interface FavoriteButtonProps {
  carId: string
  className?: string
}

export function FavoriteButton({ carId, className = '' }: FavoriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const isFav = isFavorite(carId)

  console.log('FavoriteButton Auth State:', { isAuthenticated, user, carId, isFav })

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
      if (isFav) {
        await removeFavorite(carId)
        toast({
          title: "Success",
          description: "Removed from favorites"
        })
      } else {
        await addFavorite(carId)
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
      className={`relative ${className}`}
      onClick={handleClick}
      disabled={isLoading}
    >
      <Heart 
        className={`h-5 w-5 transition-colors ${
          isFav ? 'fill-red-500 text-red-500' : 'text-gray-500'
        }`} 
      />
    </Button>
  )
}