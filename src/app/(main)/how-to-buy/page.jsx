"use client"

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  MessageSquare, 
  FileText, 
  CreditCard, 
  Truck, 
  CheckCircle,
  ArrowRight,
  ChevronRight
} from 'lucide-react'
import LeftSidebar from "@/components/template/leftsidebar"
import RightSidebar from "@/components/template/rightsidebar"
import Breadcrumbs from '@/components/ui/breadcrumbs'
import Link from 'next/link'

export default function HowToBuy() {
  const [activeStep, setActiveStep] = useState(0)
  const stepsRef = useRef([])

  const breadcrumbItems = [
    { label: 'How to Buy', href: '/how-to-buy' }
  ]

  const steps = [
    {
      id: "search",
      title: "Search Our Inventory",
      icon: Search,
      description: "Browse through our extensive collection of high-quality Japanese used cars. Use our advanced filters to find the perfect vehicle that matches your preferences and budget.",
      details: [
        "Access our real-time inventory of Japanese used cars",
        "Filter by make, model, year, price, and more",
        "View detailed vehicle information and high-quality photos",
        "Compare different vehicles side by side",
        "Save your favorite cars for later reference"
      ]
    },
    {
      title: "Contact Our Agents",
      icon: MessageSquare,
      description: "Get in touch with our professional sales team who will guide you through the entire process and answer all your questions.",
      details: [
        "Submit inquiries about your preferred vehicles",
        "Receive detailed information about car condition and pricing",
        "Get expert advice on vehicle selection",
        "Discuss shipping options and costs",
        "Learn about import regulations for your country"
      ]
    },
    {
      title: "Receive Your Invoice",
      icon: FileText,
      description: "Once you've selected your vehicle, we'll provide you with a detailed invoice including all costs and payment instructions.",
      details: [
        "Get a comprehensive breakdown of all costs",
        "Review vehicle price and shipping fees",
        "Understand insurance and documentation charges",
        "Receive clear payment instructions",
        "Access our secure payment options"
      ]
    },
    {
      title: "Make Payment",
      icon: CreditCard,
      description: "Complete your purchase using our secure payment methods. We accept various payment options to ensure a smooth transaction.",
      details: [
        "Choose from multiple secure payment methods",
        "Get confirmation of payment receipt",
        "Receive purchase documentation",
        "Track your payment status",
        "Access our banking information"
      ]
    },
    {
      title: "Shipping Process",
      icon: Truck,
      description: "We'll handle all the shipping arrangements and documentation to ensure your vehicle reaches you safely.",
      details: [
        "Get regular updates on shipping status",
        "Track your vehicle's journey",
        "Receive all necessary shipping documents",
        "Learn about estimated delivery times",
        "Get guidance on import procedures"
      ]
    },
    {
      title: "Receive Your Vehicle",
      icon: CheckCircle,
      description: "Finally, receive your vehicle at your specified location. Our support continues even after delivery.",
      details: [
        "Coordinate with local shipping agents",
        "Complete import formalities",
        "Verify vehicle condition upon arrival",
        "Access post-purchase support",
        "Get assistance with registration if needed"
      ]
    }
  ]

  const scrollToSection = (index) => {
    setActiveStep(index)
    stepsRef.current[index]?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }

  // Sticky navigation bar
  const renderNavigation = () => (
    <motion.div 
      className="sticky top-0 backdrop-blur-md z-10 border-b border-gray-200/80"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="overflow-x-auto py-4">
          <div className="flex justify-center space-x-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => scrollToSection(index)}
                className={`
                  flex items-center px-6 py-3 rounded-xl text-sm font-medium
                  transition-all duration-300 transform hover:scale-105
                  ${activeStep === index 
                    ? 'bg-gradient-to-r from-[#14225D] to-[#1a2d7c] text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'
                  }
                `}
              >
                <step.icon className={`w-4 h-4 mr-2 ${activeStep === index ? 'animate-pulse' : ''}`} />
                <span>Step {index + 1}</span>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 ml-2 text-gray-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="flex flex-col md:flex-row">
      {/* Left Sidebar */}
      <div className="hidden md:block md:w-1/5 lg:w-1/6 bg-white">
        <div className="sticky top-0">
          <LeftSidebar />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full md:w-3/5 lg:w-5/6">
        {/* Professional Hero Section */}
        <motion.header 
          className="relative bg-[#14225D] text-white overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#14225D] via-[#1a2d7c]/90 to-[#14225D]"
              style={{ mixBlendMode: 'overlay' }}
            />
          </div>

          {/* Main Content */}
          <div className="relative z-10 px-6 py-20 lg:py-28">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Column - Text Content */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7 }}
                  className="space-y-6"
                >
                  <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                    Your Guide to <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                      Purchasing Process
                    </span>
                  </h1>
                  <p className="text-lg lg:text-xl text-gray-200 max-w-xl">
                    Follow our comprehensive step-by-step guide to purchase your dream car from SS Holdings with confidence and ease.
                  </p>
                  
                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="px-8 py-3 bg-white text-[#14225D] rounded-lg font-semibold 
                               hover:shadow-lg transition-all duration-300"
                    >
                      View Inventory
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="px-8 py-3 border border-white/30 rounded-lg font-semibold
                               hover:bg-white/10 transition-all duration-300"
                    >
                      Contact Us
                    </motion.button>
                  </div>
                </motion.div>

                {/* Right Column - Stats */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="grid grid-cols-2 gap-6"
                >
                  {[
                    { number: "6", label: "Simple Steps", sublabel: "Easy Process" },
                    { number: "24/7", label: "Support", sublabel: "Always Available" },
                    { number: "100%", label: "Satisfaction", sublabel: "Guaranteed" },
                    { number: "15+", label: "Years", sublabel: "Experience" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/[0.15] 
                               transition-all duration-300 border border-white/[0.05]"
                    >
                      <div className="text-3xl font-bold">{stat.number}</div>
                      <div className="text-sm font-medium text-gray-300">{stat.label}</div>
                      <div className="text-xs text-gray-400">{stat.sublabel}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Add Breadcrumbs here */}
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Navigation Bar */}
        {renderNavigation()}

        {/* Steps Content */}
        <div className="px-4 md:px-8 max-w-5xl mx-auto py-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              ref={el => stepsRef.current[index] = el}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className="mb-20"
              id={step.id}
            >
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14225D] to-[#1a2d7c] flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center mb-4">
                    <span className="text-[#14225D] font-bold mr-2 text-lg">Step {index + 1}</span>
                    <ArrowRight className="w-5 h-5 text-gray-400 mx-2" />
                    <h2 className="text-2xl font-bold text-gray-800">{step.title}</h2>
                  </div>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    {step.description}
                  </p>
                  <div className="bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                    <ul className="space-y-4">
                      {step.details.map((detail, idx) => (
                        <motion.li 
                          key={idx} 
                          className="flex items-center text-gray-700"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                        >
                          <span className="w-2 h-2 bg-gradient-to-r from-[#14225D] to-[#1a2d7c] rounded-full mr-3"></span>
                          <span className="text-base">{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-lg border border-gray-200"
          >
            <h3 className="text-3xl font-bold text-[#14225D] mb-6">
              Ready to Start Your Journey?
            </h3>
            <p className="text-gray-600 mb-10 text-lg max-w-2xl mx-auto">
              Browse our inventory or contact our team to begin your car buying journey today.
            </p>
            <div className="flex justify-center gap-6">
              <Link href="/cars">
                <motion.button
                  className="bg-gradient-to-r from-[#14225D] to-[#1a2d7c] text-white px-10 py-4 rounded-xl hover:shadow-xl transition-all duration-300 text-lg font-medium transform hover:scale-105"
                  whileHover={{ y: -2 }}
                >
                  View Inventory
                </motion.button>
              </Link>
              <Link href="/contact-us">
                <motion.button
                  className="bg-white text-[#14225D] border-2 border-[#14225D] px-10 py-4 rounded-xl hover:shadow-xl transition-all duration-300 text-lg font-medium transform hover:scale-105"
                  whileHover={{ y: -2 }}
                >
                  Contact Us
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
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
