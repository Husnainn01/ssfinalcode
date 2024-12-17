'use client'

import { useState } from 'react'
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

const faqs = [
  {
    category: "Ordering & Payment",
    icon: CreditCard,
    items: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept various payment methods including credit/debit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All transactions are securely processed through our encrypted payment system."
      },
      {
        question: "Can I change or cancel my order?",
        answer: "Yes, you can change or cancel your order within 24 hours of placing it. After this time, your order may have already been processed. Please contact our customer service team immediately for any modifications."
      }
    ]
  },
  {
    category: "Shipping & Delivery",
    icon: Ship,
    items: [
      {
        question: "How long does shipping take?",
        answer: "Shipping times vary by destination. Typically, domestic orders are delivered within 3-5 business days, while international orders may take 7-14 business days. You'll receive detailed tracking information once your order ships."
      },
      {
        question: "Do you offer international shipping?",
        answer: "Yes, we offer international shipping to most countries. Shipping costs and delivery times vary by destination. Please check our shipping calculator for specific rates to your location."
      }
    ]
  },
  {
    category: "Vehicle Inspection",
    icon: Search,
    items: [
      {
        question: "What is included in the vehicle inspection?",
        answer: "Our comprehensive inspection covers mechanical condition, exterior/interior condition, undercarriage inspection, and road test results. Each vehicle comes with a detailed inspection report and high-quality photos."
      },
      {
        question: "Can I request additional inspections?",
        answer: "Yes, you can request additional third-party inspections for complete peace of mind. We can arrange this service for an additional fee."
      }
    ]
  },
  {
    category: "Warranty & Returns",
    icon: Shield,
    items: [
      {
        question: "What is your warranty policy?",
        answer: "Our standard warranty covers major mechanical components for 1 year or 12,000 miles, whichever comes first. Extended warranty options are available for additional coverage and longer terms."
      },
      {
        question: "What is the return policy?",
        answer: "We offer a 30-day return policy for vehicles that don't meet the described condition. Terms and conditions apply. Please review our return policy document for full details."
      }
    ]
  }
]

export default function FAQ() {
  const [openCategory, setOpenCategory] = useState(null)
  const [openQuestion, setOpenQuestion] = useState(null)

  const handleCategoryClick = (categoryIndex) => {
    if (openCategory === categoryIndex) {
      setOpenCategory(null)
      setOpenQuestion(null)
    } else {
      setOpenCategory(categoryIndex)
      setOpenQuestion(null)
    }
  }

  const handleQuestionClick = (questionIndex) => {
    setOpenQuestion(openQuestion === questionIndex ? null : questionIndex)
  }

  return (
    <div className="bg-gray-50 border-y border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our services, shipping, and vehicle purchasing process
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((category, categoryIndex) => (
            <div 
              key={categoryIndex}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <button
                onClick={() => handleCategoryClick(categoryIndex)}
                className="w-full px-6 py-4 flex items-center justify-between text-left bg-white rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <category.icon 
                    className="w-6 h-6 text-orange-500" 
                  />
                  <span className="font-semibold text-gray-900">{category.category}</span>
                </div>
                {openCategory === categoryIndex ? (
                  <Minus className="w-5 h-5 text-orange-500" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {openCategory === categoryIndex && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-4">
                      {category.items.map((item, questionIndex) => (
                        <div key={questionIndex} className="border-b border-black/10 last:border-0">
                          <button
                            onClick={() => handleQuestionClick(questionIndex)}
                            className="w-full py-4 flex items-center justify-between text-left"
                          >
                            <div className="flex items-center gap-3">
                              <HelpCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                              <span className="text-gray-700">{item.question}</span>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                openQuestion === questionIndex ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {openQuestion === questionIndex && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="pl-11 pr-4 pb-4"
                              >
                                <p className="text-gray-600">{item.answer}</p>
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

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors duration-200"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}