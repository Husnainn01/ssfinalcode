"use client"
import { useFavorites } from '@/context/FavoritesContext'

export function FavoritesDebug() {
  const { favorites } = useFavorites()
  
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs" style={{ zIndex: 100000 }}>
      <h3 className="font-bold mb-2">Favorites Debug</h3>
      <pre>
        {JSON.stringify(
          {
            favoritesCount: favorites.length,
            favorites
          },
          null,
          2
        )}
      </pre>
    </div>
  )
} 