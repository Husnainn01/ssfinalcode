"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, 
  Truck, 
  Car, 
  CreditCard, 
  Globe,
  ChevronDown,
  MessageSquare,
  HelpCircle,
  FileText,
  Package
} from 'lucide-react'
import LeftSidebar from "@/components/template/leftsidebar"
import RightSidebar from "@/components/template/rightsidebar"
import Breadcrumbs from '@/components/ui/breadcrumbs'
import { toast } from 'react-hot-toast'

// Define the order of categories
const categoryOrder = [
  'General Questions',
  'Vehicles & Inventory',
  'Buying & Paying',
  'Booking & Shipping',
  'Documentation',
  'Receiving Your Cargo',
  'Country Regulations',
  'Glossary Of Terms',
  'Other'
];

// Map category names to icons
const categoryIcons = {
  "General Questions": HelpCircle,
  "Vehicles & Inventory": Car,
  "Buying & Paying": CreditCard,
  "Booking & Shipping": Truck,
  "Documentation": FileText,
  "Receiving Your Cargo": Package,
  "Country Regulations": Globe,
  "Glossary Of Terms": MessageSquare,
  "Other": HelpCircle,
  // Keep the existing mappings for backward compatibility
  "Buying Process": ShoppingCart,
  "Shipping & Delivery": Truck,
  "Vehicle Inventory": Car,
  "Payment & Pricing": CreditCard,
  "International Buyers": Globe,
  "Customer Support": MessageSquare,
  "Auction Services": CreditCard,
  "Payment Methods": CreditCard,
  "Vehicle Inspection": Car,
  "General": HelpCircle,
  "Cars": Car,
  "Services": MessageSquare,
}

// Fallback data in case API fails
const fallbackFaqSections = [
  {
    id: 'general-questions',
    title: 'General Questions',
    icon: HelpCircle,
    questions: [
      {
        q: "What services does HSW GLOBAL provide?",
        a: "We provide vehicle sourcing, shipping, and import services for customers worldwide. Our comprehensive services include finding the right vehicle, handling all shipping logistics, and assisting with import documentation."
      }
    ]
  },
  {
    id: 'vehicles-inventory',
    title: 'Vehicles & Inventory',
    icon: Car,
    questions: [
      {
        q: "What types of vehicles do you offer?",
        a: "We offer a wide range of vehicles including passenger cars, SUVs, trucks, and commercial vehicles from various manufacturers and in different conditions."
      }
    ]
  }
]

export default function FAQ() {
  const [faqSections, setFaqSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('')
  const [openQuestions, setOpenQuestions] = useState({})

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch('/api/qna')
        if (!response.ok) throw new Error('Failed to fetch FAQ data')
        
        const data = await response.json()
        
        // Only use active Q&A items
        const activeItems = data.filter(item => item.isActive)
        
        // If no items found, use fallback data
        if (activeItems.length === 0) {
          setFaqSections(fallbackFaqSections)
          setActiveSection(fallbackFaqSections[0]?.id || '')
          setLoading(false)
          return
        }
        
        // Group by category
        const groupedByCategory = activeItems.reduce((acc, item) => {
          // Default to General Questions if category is not set or is 'General'
          const category = (item.category === 'General' || !item.category) 
            ? 'General Questions' 
            : item.category
          
          if (!acc[category]) {
            acc[category] = {
              id: category.toLowerCase().replace(/\s+/g, '-'),
              title: category,
              icon: categoryIcons[category] || HelpCircle,
              questions: [],
              // Store the original category for sorting
              originalCategory: category
            }
          }
          
          acc[category].questions.push({
            q: item.question,
            a: item.answer
          })
          
          return acc
        }, {})
        
        // Convert to array format needed by the component
        let formattedSections = Object.values(groupedByCategory)
        
        // Sort sections according to the defined order
        formattedSections.sort((a, b) => {
          const indexA = categoryOrder.indexOf(a.originalCategory)
          const indexB = categoryOrder.indexOf(b.originalCategory)
          
          // If category is not in the order list, put it at the end
          const posA = indexA === -1 ? 999 : indexA
          const posB = indexB === -1 ? 999 : indexB
          
          return posA - posB
        })
        
        // Remove the temporary sorting property
        formattedSections = formattedSections.map(({ originalCategory, ...rest }) => rest)
        
        setFaqSections(formattedSections)
        setActiveSection(formattedSections[0]?.id || '')
        setLoading(false)
      } catch (err) {
        console.error('Error fetching FAQ data:', err)
        // Use fallback data if API fails
        setFaqSections(fallbackFaqSections)
        setActiveSection(fallbackFaqSections[0]?.id || '')
        setLoading(false)
        toast.error('Failed to load FAQ data. Showing default questions instead.')
      }
    }
    
    fetchFAQs()
  }, [])

  const toggleQuestion = (sectionId, index) => {
    setOpenQuestions(prev => ({
      ...prev,
      [`${sectionId}-${index}`]: !prev[`${sectionId}-${index}`]
    }))
  }

  const breadcrumbItems = [
    { label: 'FAQ', href: '/FAQ' }
  ]

  return (
    <div className="flex flex-col md:flex-row">
      {/* Left Sidebar */}
      <div className="hidden md:block md:w-1/5 lg:w-1/6 bg-white">
        <div className="sticky top-0">
          <LeftSidebar />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full md:w-3/5 lg:w-4/6">
        {/* Header Section */}
        <motion.header 
          className="bg-gradient-to-r from-[#14225D] to-[#1a2d7c] text-white py-12 md:py-20 px-4 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div 
            className="absolute inset-0 bg-grid-white/[0.05] -z-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          />
          <div className="container mx-auto text-center relative z-10">
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Frequently Asked Questions
            </motion.h1>
            <motion.p 
              className="text-base md:text-xl text-gray-200 max-w-2xl mx-auto px-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Find answers to common questions about buying and importing vehicles from HSW GLOBAL
            </motion.p>
          </div>
        </motion.header>

        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-gray-600">Loading FAQ data...</p>
          </div>
        ) : (
          <>
            {/* Navigation */}
            <div className="sticky top-0 backdrop-blur-md z-10 border-b border-gray-200/80">
              <div className="max-w-7xl mx-auto px-4">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex space-x-2 md:space-x-4 py-4 min-w-max md:justify-center px-4">
                    {faqSections.map((section) => (
                      <motion.button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`
                          flex items-center px-3 md:px-6 py-2 md:py-3 rounded-xl text-xs md:text-sm font-medium
                          transition-all duration-300 transform hover:scale-105 whitespace-nowrap
                          ${activeSection === section.id 
                            ? 'bg-gradient-to-r from-[#14225D] to-[#1a2d7c] text-white shadow-lg' 
                            : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'
                          }
                        `}
                        whileHover={{ y: -2 }}
                      >
                        <section.icon className={`w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 ${activeSection === section.id ? 'animate-pulse' : ''}`} />
                        {section.title}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="px-4 md:px-8 py-8 md:py-12">
              {faqSections.map((section) => (
                <AnimatePresence mode="wait" key={section.id}>
                  {activeSection === section.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
                        {section.questions.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                          >
                            <button
                              onClick={() => toggleQuestion(section.id, index)}
                              className="w-full flex justify-between items-center p-4 md:p-6 hover:bg-gray-50 transition-colors duration-200"
                            >
                              <span className="font-medium text-left text-gray-900 text-sm md:text-base pr-4">
                                {item.q}
                              </span>
                              <motion.div
                                animate={{ rotate: openQuestions[`${section.id}-${index}`] ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex-shrink-0"
                              >
                                <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                              </motion.div>
                            </button>
                            <AnimatePresence>
                              {openQuestions[`${section.id}-${index}`] && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 md:px-6 pb-4 md:pb-6">
                                    <div 
                                      className="pl-8 text-gray-600 leading-relaxed text-sm md:text-base"
                                      dangerouslySetInnerHTML={{ __html: item.a }}
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}

              {/* Still Have Questions Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="max-w-3xl mx-auto mt-16 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl text-center border border-gray-200 shadow-lg"
              >
                <HelpCircle className="w-12 h-12 mx-auto mb-4 text-[#14225D]" />
                <h3 className="text-2xl font-bold text-[#14225D] mb-4">
                  Still Have Questions?
                </h3>
                <p className="text-gray-600 mb-8">
                  Can't find the answer you're looking for? Please contact our support team.
                </p>
                <motion.a
                  href="/contact-us"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#14225D] to-[#1a2d7c] text-white rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  whileHover={{ y: -2 }}
                >
                  Contact Support
                </motion.a>
              </motion.div>
            </div>
          </>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="hidden md:block md:w-1/5 lg:w-1/6 bg-white">
        <div className="sticky top-0">
          <RightSidebar />
        </div>
      </div>
    </div>
  )
}