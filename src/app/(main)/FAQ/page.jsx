"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, 
  Truck, 
  Car, 
  CreditCard, 
  Globe,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle
} from 'lucide-react'
import LeftSidebar from "@/components/template/leftsidebar"
import RightSidebar from "@/components/template/rightsidebar"
import Breadcrumbs from '@/components/ui/breadcrumbs'

export default function FAQ() {
  const [activeSection, setActiveSection] = useState('buying')
  const [openQuestions, setOpenQuestions] = useState({})

  const faqSections = [
    {
      id: 'buying',
      title: 'Buying Process',
      icon: ShoppingCart,
      questions: [
        {
          q: "How do I start the buying process?",
          a: "Begin by browsing our inventory, select a vehicle you're interested in, and submit an inquiry. Our sales team will contact you with detailed information and guide you through the process."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept bank transfers, letters of credit, and other secure payment methods. Our team will provide detailed payment instructions once you've selected a vehicle."
        },
        {
          q: "Can I negotiate the price?",
          a: "Yes, we're open to reasonable negotiations. Contact our sales team to discuss pricing and available options."
        },
        {
          q: "Do you offer financing options?",
          a: "We work with several financing partners. Contact us for more information about financing options available in your region."
        }
      ]
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      icon: Truck,
      questions: [
        {
          q: "How long does shipping take?",
          a: "Shipping times vary by destination. Typically, it takes 4-6 weeks for sea freight. We'll provide you with a more accurate timeline based on your location."
        },
        {
          q: "Do you handle customs clearance?",
          a: "We provide all necessary documentation for customs clearance. However, local customs clearance is typically handled by the buyer or their agent."
        },
        {
          q: "What shipping methods are available?",
          a: "We primarily use RoRo (Roll-on Roll-off) and container shipping. The best method will depend on your location and preferences."
        }
      ]
    },
    {
      id: 'inventory',
      title: 'Vehicle Inventory',
      icon: Car,
      questions: [
        {
          q: "How often is your inventory updated?",
          a: "Our inventory is updated daily with new vehicles. Check back regularly or contact us to be notified when specific models become available."
        },
        {
          q: "Can I request a specific vehicle?",
          a: "Yes! If you don't see what you're looking for, we can help source specific vehicles through our extensive network."
        },
        {
          q: "Are the vehicles inspected?",
          a: "Yes, all our vehicles undergo thorough inspection. We provide detailed condition reports and photos."
        }
      ]
    },
    {
      id: 'payment',
      title: 'Payment & Pricing',
      icon: CreditCard,
      questions: [
        {
          q: "What's included in the price?",
          a: "Prices typically include the vehicle cost and our service fee. Shipping, insurance, and import duties are usually quoted separately for transparency."
        },
        {
          q: "When do I need to pay?",
          a: "A deposit is required to secure your vehicle, with full payment due before shipping. We'll provide a clear payment schedule."
        }
      ]
    },
    {
      id: 'international',
      title: 'International Buyers',
      icon: Globe,
      questions: [
        {
          q: "Do you ship worldwide?",
          a: "Yes, we ship to most countries worldwide. Contact us to confirm shipping availability to your location."
        },
        {
          q: "What documents do I need?",
          a: "Required documents vary by country. Typically, you'll need import permits and identification. We'll guide you through the requirements."
        }
      ]
    },
    {
      id: 'support',
      title: 'Customer Support',
      icon: MessageSquare,
      questions: [
        {
          q: "How can I contact support?",
          a: "You can reach our support team via email, phone, or through our website's contact form. We typically respond within 24 hours."
        },
        {
          q: "Do you offer after-sales support?",
          a: "Yes, we provide ongoing support even after delivery, including assistance with documentation and technical queries."
        }
      ]
    }
  ]

  const toggleQuestion = (sectionId, index) => {
    setOpenQuestions(prev => ({
      ...prev,
      [`${sectionId}-${index}`]: !prev[`${sectionId}-${index}`]
    }))
  }

  const breadcrumbItems = [
    { label: 'FAQ', href: '/faq' }
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
              Find answers to common questions about buying and importing vehicles from SS Holdings
            </motion.p>
          </div>
        </motion.header>

        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

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
                                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                  {item.a}
                                </p>
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
