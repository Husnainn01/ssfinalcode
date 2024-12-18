"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from "framer-motion"
import { 
  Heart, 
  Trash2, 
  Car, 
  Calendar, 
  DollarSign, 
  MapPin,
  Share2,
  SlidersHorizontal,
  ArrowUpDown,
  CheckSquare,
  ExternalLink,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Send,
  Link2,
  Mail,
  Settings,
  Droplet,
  Activity,
  Zap,
  X
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useFavorites } from '@/context/FavoritesContext'
import { useAuth } from '@/hooks/useAuth'

interface FavoriteVehicle {
  id: string
  name: string
  image: string
  type: string
  price: number
  year: number
  addedDate: string
  specifications: {
    transmission: string
    fuelType: string
    mileage: string
    engine: string
  }
}

type SortOption = "price-asc" | "price-desc" | "date-asc" | "date-desc"
type FilterOption = "all" | "sedan" | "suv" | "sports" | "electric"

interface ShareOption {
  name: string
  icon: React.ElementType
  action: (urls: string[]) => void
  color: string
}

export default function Favorites() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteVehicle[]>([])
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("date-desc")
  const [filterBy, setFilterBy] = useState<FilterOption>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCars, setSelectedCars] = useState<string[]>([])
  const { toast } = useToast()
  const [showCompareModal, setShowCompareModal] = useState(false)

  const fetchFavorites = async () => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }
    
    try {
      console.log('Fetching favorites...')
      const favResponse = await fetch('/api/favorites', {
        credentials: 'include'
      })
      
      if (!favResponse.ok) {
        throw new Error('Failed to fetch favorites')
      }

      const favData = await favResponse.json()
      
      if (!Array.isArray(favData)) {
        throw new Error('Invalid favorites data format')
      }

      // Fetch car details for each favorite
      const carPromises = favData.map(async (fav) => {
        try {
          const carResponse = await fetch(`/api/cars/${fav.carId}`, {
            credentials: 'include'
          })

          if (!carResponse.ok) {
            console.error(`Failed to fetch car ${fav.carId}:`, await carResponse.text())
            return null
          }

          const carData = await carResponse.json()
          return {
            ...carData,
            addedDate: new Date(fav.createdAt).toLocaleDateString()
          }
        } catch (error) {
          console.error(`Error fetching car ${fav.carId}:`, error)
          return null
        }
      })

      // Wait for all car fetches to complete
      const cars = await Promise.all(carPromises)
      
      // Filter out any null results from failed fetches
      const validCars = cars.filter((car): car is FavoriteVehicle => car !== null)

      if (validCars.length === 0) {
        setError('No valid cars found in favorites')
        console.log('Favorites Debug', {
          favoritesCount: favData.length,
          favorites: favData.map(f => f.carId)
        })
      } else {
        setFavorites(validCars)
        setError(null)
      }
    } catch (error) {
      console.error('Error in fetchFavorites:', error)
      setError(error instanceof Error ? error.message : 'Failed to load favorites')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchFavorites()
    }
  }, [isAuthenticated, authLoading])

  const removeFavorite = async (id: string) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ carId: id })
      })

      if (response.ok) {
        setFavorites(prev => prev.filter(car => car.id !== id))
        setSelectedCars(prev => prev.filter(carId => carId !== id))
        toast({
          title: "Success",
          description: "Removed from favorites",
        })
      } else {
        throw new Error('Failed to remove favorite')
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive"
      })
    }
  }

  const viewDetails = (id: string) => {
    router.push(`/cars/${id}`)
  }

  const toggleCarSelection = (id: string) => {
    setSelectedCars(prev =>
      prev.includes(id)
        ? prev.filter(carId => carId !== id)
        : [...prev, id]
    )
  }

  const compareBookmarks = () => {
    if (selectedCars.length < 2) {
      toast({
        title: "Cannot compare",
        description: "Please select at least 2 cars to compare",
        variant: "destructive"
      })
      return
    }
    setShowCompareModal(true)
  }

  const generateShareableLinks = (selectedIds: string[]) => {
    const baseUrl = window.location.origin
    return selectedIds.map(id => {
      const favorite = favorites.find(f => f.id === id)
      return `${baseUrl}/cars/${favorite?.id}-${encodeURIComponent(favorite?.name || '')}`
    })
  }

  const trackSharing = (platform: string, urls: string[]) => {
    console.log(`Shared ${urls.length} cars on ${platform}`)
  }

  const generateShareMessage = (platform: string, urls: string[]) => {
    const carNames = urls.map(url => {
      const id = url.split('/').pop()?.split('-')[0]
      return favorites.find(f => f.id === id)?.name
    }).filter(Boolean)

    switch (platform) {
      case 'whatsapp':
        return `🚗 Check out these amazing cars I found!\n\n${carNames.join('\n')}\n\n${urls.join('\n')}`
      case 'facebook':
        return `I found some incredible vehicles that might interest you! ${urls[0]}`
      case 'twitter':
        return ` Discovered these awesome cars!\n${carNames.join(', ')}\n\n${urls.join('\n')}`
      default:
        return `Check out these cars:\n${urls.join('\n')}`
    }
  }

  const shareOptions: ShareOption[] = [
    {
      name: "Copy Link",
      icon: Copy,
      color: "text-gray-600",
      action: async (urls) => {
        try {
          await navigator.clipboard.writeText(urls.join('\n'))
          toast({
            title: "Success",
            description: (
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4 text-green-500" />
                <span>Links copied to clipboard</span>
              </div>
            ),
            variant: "default",
            open: true,
          })
        } catch (err) {
          toast({
            title: "Error",
            description: (
              <div className="flex items-center space-x-2">
                <X className="h-4 w-4 text-red-500" />
                <span>Failed to copy links</span>
              </div>
            ),
            variant: "destructive",
            open: true,
          })
        }
      }
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "text-green-500",
      action: (urls) => {
        const message = generateShareMessage('whatsapp', urls)
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
      }
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "text-blue-600",
      action: (urls) => {
        const url = encodeURIComponent(urls[0])
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
      }
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "text-sky-500",
      action: (urls) => {
        const text = encodeURIComponent(generateShareMessage('twitter', urls))
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
      }
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "text-blue-700",
      action: (urls) => {
        const url = encodeURIComponent(urls[0])
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
      }
    },
    {
      name: "Telegram",
      icon: Send,
      color: "text-blue-500",
      action: (urls) => {
        const text = encodeURIComponent(generateShareMessage('telegram', urls))
        window.open(`https://t.me/share/url?url=${text}`, '_blank')
      }
    },
    {
      name: "Email",
      icon: Mail,
      color: "text-yellow-600",
      action: (urls) => {
        const subject = encodeURIComponent("Check out these amazing cars")
        const body = encodeURIComponent(generateShareMessage('email', urls))
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
      }
    }
  ]

  const ShareButton = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="transition-all hover:bg-gray-100">
          <Share2 className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
          Share ({selectedCars.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 p-2"
        sideOffset={5}
        alignOffset={5}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {shareOptions.map((option, index) => {
            const Icon = option.icon
            return (
              <motion.div
                key={option.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { delay: index * 0.05 } 
                }}
              >
                <DropdownMenuItem
                  onClick={() => option.action(generateShareableLinks(selectedCars))}
                  className="flex items-center cursor-pointer p-3 m-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <div className={`p-2 rounded-full ${option.color.replace('text-', 'bg-')}/10 mr-3`}>
                    <Icon className={`h-5 w-5 ${option.color} transition-transform hover:scale-110`} strokeWidth={2} />
                  </div>
                  <span className="font-medium">{option.name}</span>
                </DropdownMenuItem>
              </motion.div>
            )
          })}
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Favorite Cars</h1>
            <p className="text-gray-500">
              {favorites.length} {favorites.length === 1 ? 'car' : 'cars'} bookmarked
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {selectedCars.length > 0 && (
              <>
                <ShareButton />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={compareBookmarks}
                  disabled={selectedCars.length < 2}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Compare
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search cars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sedan">Sedan</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="date-asc">Date: Oldest First</SelectItem>
              <SelectItem value="date-desc">Date: Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 font-medium mb-2">Error loading favorites</p>
          <p className="text-gray-600">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setError(null)
              setIsLoading(true)
              fetchFavorites()
            }}
          >
            Try Again
          </Button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No favorites yet.</p>
          <Button 
            variant="outline"
            onClick={() => router.push('/cars')}
          >
            Browse Cars
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {favorites.filter(favorite => {
              if (filterBy === "all") return true
              return favorite.type === filterBy
            })
            .filter(favorite =>
              favorite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              favorite.specifications.transmission.toLowerCase().includes(searchTerm.toLowerCase()) ||
              favorite.specifications.fuelType.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
              switch (sortBy) {
                case "price-asc":
                  return a.price - b.price
                case "price-desc":
                  return b.price - a.price 
                case "date-asc":
                  return new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime()
                case "date-desc":
                  return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
                default:
                  return 0
              }
            })
            .map((favorite) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative"
              >
                <Card className="h-full relative">
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedCars.includes(favorite.id)}
                      onCheckedChange={() => toggleCarSelection(favorite.id)}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{favorite.name}</CardTitle>
                    <CardDescription>{favorite.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full h-40">
                      <Image
                        src={favorite.image}
                        alt={favorite.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        Added on {favorite.addedDate}
                      </p>
                      <p className="text-sm text-gray-500">
                        Price: ${favorite.price}
                      </p>
                      <p className="text-sm text-gray-500">
                        Year: {favorite.year}
                      </p>
                      <p className="text-sm text-gray-500">
                        Transmission: {favorite.specifications.transmission}
                      </p>
                      <p className="text-sm text-gray-500">
                        Fuel Type: {favorite.specifications.fuelType}
                      </p>
                      <p className="text-sm text-gray-500">
                        Mileage: {favorite.specifications.mileage}
                      </p>
                      <p className="text-sm text-gray-500">
                        Engine: {favorite.specifications.engine}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFavorite(favorite.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => viewDetails(favorite.id)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Compare Vehicles</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-8 mt-4">
            {selectedCars.map(id => {
              const car = favorites.find(f => f.id === id)
              if (!car) return null
              
              return (
                <div key={id} className="space-y-4">
                  <div className="relative h-48 w-full">
                    <Image
                      src={car.image}
                      alt={car.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">{car.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ComparisonItem
                      label="Price"
                      value={`$${car.price.toLocaleString()}`}
                      icon={DollarSign}
                    />
                    <ComparisonItem
                      label="Year"
                      value={car.year.toString()}
                      icon={Calendar}
                    />
                    <ComparisonItem
                      label="Type"
                      value={car.type}
                      icon={Car}
                    />
                    <ComparisonItem
                      label="Transmission"
                      value={car.specifications.transmission}
                      icon={Settings}
                    />
                    <ComparisonItem
                      label="Fuel Type"
                      value={car.specifications.fuelType}
                      icon={Droplet}
                    />
                    <ComparisonItem
                      label="Mileage"
                      value={car.specifications.mileage}
                      icon={Activity}
                    />
                    <ComparisonItem
                      label="Engine"
                      value={car.specifications.engine}
                      icon={Zap}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const ComparisonItem = ({ 
  label, 
  value, 
  icon: Icon 
}: { 
  label: string
  value: string
  icon: LucideIcon 
}) => (
  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
    <Icon className="h-4 w-4 text-gray-500" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
) 