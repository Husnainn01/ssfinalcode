'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, 
  Ship, 
  Search, 
  Shield,
  ChevronDown, 
  Plus, 
  Minus, 
  HelpCircle 
} from "lucide-react"
import Link from 'next/link'

// Map category names to icons
const categoryIcons = {
  "Auction Services": CreditCard,
  "Payment Methods": Ship,
  "Shipping & Delivery": Search,
  "Vehicle Inspection": Shield,
  "General": HelpCircle,
  "Cars": CreditCard,
  "Services": Shield,
}

export default function FAQ() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openCategory, setOpenCategory] = useState(null)
  const [openQuestions, setOpenQuestions] = useState({})

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch('/api/qna')
        if (!response.ok) throw new Error('Failed to fetch FAQ data')
        
        const data = await response.json()
        
        // Only use active Q&A items
        const activeItems = data.filter(item => item.isActive)
        
        // Group by category
        const groupedByCategory = activeItems.reduce((acc, item) => {
          const category = item.category || 'General'
          
          if (!acc[category]) {
            acc[category] = []
          }
          
          acc[category].push({
            question: item.question,
            answer: item.answer
          })
          
          return acc
        }, {})
        
        // Convert to array format needed by the component
        const formattedCategories = Object.keys(groupedByCategory).map(category => ({
          category,
          icon: categoryIcons[category] || HelpCircle,
          items: groupedByCategory[category]
        }))
        
        setCategories(formattedCategories)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching FAQ data:', err)
        setError('Failed to load FAQ data. Please try again later.')
        setLoading(false)
      }
    }
    
    fetchFAQs()
  }, [])

  const handleCategoryClick = (categoryIndex) => {
    setOpenCategory(openCategory === categoryIndex ? null : categoryIndex)
  }

  const handleQuestionClick = (categoryIndex, questionIndex) => {
    setOpenQuestions(prev => ({
      ...prev,
      [categoryIndex]: prev[categoryIndex] === questionIndex ? null : questionIndex
    }))
  }

  if (loading) {
    return (
      <div className="relative py-16">
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading FAQ data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative py-16">
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative py-16">
      <div className="relative max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-950 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Find answers to common questions about our services, shipping, and vehicle purchasing process
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No FAQ items available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {categories.map((category, categoryIndex) => (
              <div 
                key={categoryIndex}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => handleCategoryClick(categoryIndex)}
                  className={`w-full px-6 py-5 flex items-center justify-between text-left
                    bg-gradient-to-r from-blue-950 to-blue-900 text-white
                    transition-all duration-300 ${openCategory === categoryIndex ? 'shadow-lg' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <category.icon 
                      className="w-6 h-6 text-orange-400" 
                    />
                    <span className="font-semibold text-lg">{category.category}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: openCategory === categoryIndex ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-orange-400" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {openCategory === categoryIndex && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="divide-y divide-gray-100">
                        {category.items.map((item, questionIndex) => (
                          <div key={questionIndex} className="bg-white">
                            <button
                              onClick={() => handleQuestionClick(categoryIndex, questionIndex)}
                              className="w-full px-6 py-4 flex items-center justify-between text-left
                                hover:bg-gray-50 transition-colors duration-200"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <HelpCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                <span className="text-gray-700 font-medium">{item.question}</span>
                              </div>
                              <motion.div
                                animate={{ 
                                  rotate: openQuestions[categoryIndex] === questionIndex ? 180 : 0 
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              </motion.div>
                            </button>

                            <AnimatePresence initial={false}>
                              {openQuestions[categoryIndex] === questionIndex && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ 
                                    height: 'auto', 
                                    opacity: 1,
                                    transition: {
                                      height: { duration: 0.3 },
                                      opacity: { duration: 0.3, delay: 0.1 }
                                    }
                                  }}
                                  exit={{ 
                                    height: 0, 
                                    opacity: 0,
                                    transition: {
                                      height: { duration: 0.3 },
                                      opacity: { duration: 0.2 }
                                    }
                                  }}
                                >
                                  <div className="px-6 pb-4 pt-2">
                                    <div className="pl-8 text-gray-600 leading-relaxed">
                                      {item.answer}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4 text-lg">Still have questions?</p>
          <Link
            href="/contact-us"
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-950 text-white 
              font-medium rounded-xl hover:bg-blue-900 transition-all duration-300 
              shadow-lg hover:shadow-xl"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}