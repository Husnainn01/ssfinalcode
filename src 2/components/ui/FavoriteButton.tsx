"use client"

import { useState, useEffect } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { Button } from './button'
import { useFavorites } from '@/context/FavoritesContext'
import { useCustomerAuth } from '@/hooks/useCustomerAuth'
import { useToast } from './use-toast'
import { useRouter } from 'next/navigation'

interface FavoriteButtonProps {
  carId: string | number | undefined
}

export function FavoriteButton({ carId }: FavoriteButtonProps) {
  if (!carId) {
    return null;
  }

  const normalizedCarId = carId.toString()
  const { user, isAuthenticated, isLoading: authLoading } = useCustomerAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const isFavorited = isFavorite(normalizedCarId)

  useEffect(() => {
    console.log('FavoriteButton Auth State:', { 
      isAuthenticated, 
      user, 
      carId: normalizedCarId, 
      isFav: isFavorited,
      authLoading
    })
  }, [isAuthenticated, user, normalizedCarId, isFavorited, authLoading])

  const handleClick = async () => {
    if (authLoading) return

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to add favorites",
        variant: "destructive"
      })
      router.push('/auth/login')
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

  if (authLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    )
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