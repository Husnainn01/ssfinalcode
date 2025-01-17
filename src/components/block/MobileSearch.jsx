'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePathname } from 'next/navigation'

export function MobileSearch({ onSearch, isSearching }) {
  const pathname = usePathname()
  
  if (pathname.startsWith('/cars/')) {
    return null
  }

  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('keyword')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    onSearch({ query, searchType })
    setIsOpen(false)
  }

  return (
    <>
      {/* Search Trigger Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden text-white"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-6 w-6" />
      </Button>

      {/* Search Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false)
            }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#387478] shadow-lg w-full max-w-[350px] mx-auto"
            >
              <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Search Type Select */}
                  <Select
                    value={searchType}
                    onValueChange={setSearchType}
                  >
                    <SelectTrigger className="w-full bg-white text-gray-900">
                      <SelectValue>
                        {searchType === 'keyword' ? 'Search by Keyword' : 'Search by Stock Number'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      <SelectItem value="keyword" className="hover:bg-gray-100">
                        Search by Keyword
                      </SelectItem>
                      <SelectItem value="stockNumber" className="hover:bg-gray-100">
                        Search by Stock Number
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Search Input */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input 
                        type="text"
                        placeholder={searchType === 'keyword' ? "Search cars..." : "Enter stock number"}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pr-10 bg-white text-gray-900"
                        autoFocus
                      />
                      {query && (
                        <button
                          type="button"
                          onClick={() => setQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isSearching}
                      className="bg-[#172656] hover:bg-[#172656]/90 text-white"
                    >
                      {isSearching ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Search className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="bg-white hover:bg-gray-100 text-gray-900"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Search Type Description */}
                  <p className="text-sm text-white/80">
                    {searchType === 'keyword' 
                      ? "Search by make, model, or any keyword"
                      : "Enter the exact stock number"
                    }
                  </p>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 