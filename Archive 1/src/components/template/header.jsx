'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Search, ChevronDown, Heart, User, LogOut, Clock } from 'lucide-react'
import Link from 'next/link'
import { useCustomerAuth } from '@/hooks/useCustomerAuth'
import { useRouter } from 'next/navigation'
import { useJapanTime } from '@/hooks/useJapanTime'
import { useCarStats } from '@/hooks/useCarStats'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MainNav } from '@/components/block/main-nav'
import { toast } from "@/components/ui/use-toast"

export default function NavigationHeader() {
  const { user, isAuthenticated, isLoading } = useCustomerAuth()
  const router = useRouter()
  const { japanTime, isLoading: timeLoading } = useJapanTime()
  const { totalCars, carsAddedToday, isLoading: carsLoading } = useCarStats()
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [searchType, setSearchType] = useState('keyword')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const fetchFavoritesCount = async () => {
      try {
        const response = await fetch('/api/favorites/count', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setFavoritesCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching favorites count:', error);
        setFavoritesCount(0);
      }
    };

    if (isAuthenticated) {
      fetchFavoritesCount();
    } else {
      setFavoritesCount(0);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/user/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'customer_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Logout failed:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Logout failed. Please try again.",
      });
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
        if (searchType === 'stockNumber') {
            // Stock number search
            const response = await fetch(`/api/cars/stock/${encodeURIComponent(searchQuery.trim())}`)
            const data = await response.json()

            if (response.ok && data.car) {
                router.push(`/cars/${data.car._id}`)
                return
            }
        } else {
            // Keyword search
            const response = await fetch(`/api/cars/search?q=${encodeURIComponent(searchQuery)}&type=keyword`)
            const data = await response.json()

            console.log('Search response:', data)

            if (response.ok) {
                if (data.cars && data.cars.length > 0) {
                    // Store search results in localStorage for the cars page
                    localStorage.setItem('searchResults', JSON.stringify(data.cars))
                    // Redirect to cars page with search query
                    router.push(`/cars?search=${encodeURIComponent(searchQuery)}`)
                    return
                } else {
                    // No results found
                    toast({
                        title: "No matches found",
                        description: `No cars found matching "${searchQuery}"`,
                        variant: "destructive",
                    })
                }
            }
        }

    } catch (error) {
        console.error('Search error:', error)
        toast({
            variant: "destructive",
            title: "Search failed",
            description: "Please try again later.",
        })
    } finally {
        setIsSearching(false)
    }
  }

  return (
    <header className="bg-theme-primary text-theme-background relative z-50">
      {/* Top Bar */}
      <div className="border-b border-theme-primary-hover px-4 py-1 text-sm relative z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold">SS Holdings Trusted - Used Car Dealer</span>
            <span className="flex items-center gap-1">
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                <>
                  <span>Total Cars: {totalCars.toLocaleString()}</span>
                  <span className="mx-4">|</span>
                  <span>
                    Cars Added Today: 
                    <span className="ml-1 text-theme-secondary font-medium">
                      {carsAddedToday.toLocaleString()}
                    </span>
                  </span>
                </>
              )}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-theme-secondary" />
              {timeLoading ? (
                <span className="animate-pulse">Loading time...</span>
              ) : (
                <span>Japan Time: {japanTime}</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1 relative z-50">
        {/* Logo and Search */}
        <div className="flex items-center gap-8">
          <div className="flex-shrink-0 -my-60">
            <img
              src="/sss-logo.png"
              alt="SS Holdings"
              className="h-[40px] w-auto"
            />
          </div>
          
          <form onSubmit={handleSearch} className="flex">
            <Select 
              value={searchType}
              onValueChange={setSearchType}
            >
              <SelectTrigger className="w-[160px] rounded-l bg-white text-black">
                <SelectValue>
                  {searchType === 'keyword' ? 'By Keyword' : 'By Stock No.'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keyword">By Keyword</SelectItem>
                <SelectItem value="stockNumber">By Stock No.</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex flex-1">
              <Input 
                type="text"
                placeholder={searchType === 'keyword' ? "Search for cars, makes, or models" : "Enter stock number"}
                className="w-[600px] rounded-l-none border-l-0 text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit"
                size="icon" 
                className="absolute right-0 rounded-l-none bg-theme-secondary hover:bg-theme-secondary-hover"
                disabled={isSearching}
              >
                <Search className="h-4 w-4 text-theme-primary" />
              </Button>
            </div>
          </form>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4 relative z-50">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-theme-background hover:text-theme-secondary">
                <Heart className="mr-2 h-5 w-5" />
                <span>Favorites</span>
                <span className="ml-2 rounded-full bg-theme-secondary px-2 py-0.5 text-xs">
                  {favoritesCount || 0}
                </span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-theme-background hover:text-theme-secondary">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-theme-secondary flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium">
                          {user?.name || 'Customer'}
                        </span>
                        <span className="text-xs text-gray-400">Customer Account</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 z-[60]"
                  sideOffset={5}
                >
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name || 'Customer'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => router.push('/customer-dashboard')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex items-center gap-2 px-4 py-2 bg-theme-secondary text-theme-primary hover:bg-theme-secondary-hover cursor-pointer rounded-md">
                  <User className="h-5 w-5" />
                  <span>Login</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-72 z-[60]"
                sideOffset={5}
              >
                <div className="p-4">
                  <div className="text-center mb-4">
                    <h3 className="font-medium text-lg">Welcome Back!</h3>
                    <p className="text-sm text-gray-500">Please login to continue</p>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => router.push('/auth/login')}
                      className="w-full bg-theme-secondary hover:bg-theme-secondary-hover text-theme-primary py-2 px-4 rounded-md transition-colors"
                    >
                      Login to Your Account
                    </button>
                    
                    <div className="text-center text-sm text-gray-500">
                      Don't have an account?{' '}
                      <Link 
                        href="/auth/register"
                        className="text-theme-secondary hover:underline"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="relative z-50">
        <MainNav />
      </nav>
    </header>
  )
}