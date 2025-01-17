"use client";

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Building, 
  Users,
  Car,
  DollarSign,
  Video,
  ClipboardCheck,
  FileText,
  Award,
  GraduationCap
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LeftSidebar from "@/components/template/leftsidebar"
import RightSidebar from "@/components/template/rightsidebar"
import Breadcrumbs from '@/components/ui/breadcrumbs'

const detailedAuctionSchedule = [
  {
    day: "Monday",
    auctions: [
      "AUCNET", "GNN OSAKA", "GAO", "Honda Fukuoka", "Honda Hokkaido",
      "Honda Kansai", "Honda Nagoya", "Honda Sendai", "Honda Tokyo", "JU Tokyo",
    ]
  },
  {
    day: "Tuesday",
    auctions: [
      "ARAI Sendai", "Isuzu Kobe", "CAA Gifu", "CAA Touhoku",
      "GE Tokyo", "JU Mie", "JU Nagano", "JU Saitama",
      "JU Shizuoka", "JU Yamaguchi", "NPS Osaka", "NPS Tokio",
      "ORIX Kobe","ORIX Sendai","SAA Sapporo","TAA Hiroshima","TAA Kinki","TAA Kyushu",
      "TAA kyushu","TAA Minamikyu","TAA Shikoku","USS Yokohama","ZIP Tokyo","USS R NAGOYA",
    ]
  },
  {
    day: "Wednesday",
    auctions: [
      "BAYAUC", "CAA Chubu", "BCN", "FAA Shizuoka",
      "GE Tokyo", "JU Mie", "HERO", "IAA Osaka","Isuzu Makuhari","JAA","JU Ibaraki",
      "JU Ishikawa","KAA","KCAA Ebino","LAA Shikoku","ORIX Atsugi","USS Fujioka",
      "USS Fukuoka","USS Kobe","USS Sapporo","USS Tohoku",
    ]
  },
  {
    day: "Thursday",
    auctions: [
      "ARAI Oyama", "GE Kobe", "GAO! TENDER Gulliver", "HAA Osaka (Hanaten)",
      "GE Tokyo", "JU Aichi", "JU Fukushima", "JU Gunma", "JU Hiroshima",
      "JU Kanagawa", "JU Sapporo", "JU Toyama", "KCAA Fukuoka", "LAA Kansai",
      "NAA Nagoya", "NAA Osaka", "ORIX Fukuoka", "ORIX Nagoya", "SAA Hamamatsu",
      "USS Niigata", "TAA Hokkaido", "TAA Kantou", "USS R Tokyo", "USS Tokyo",
      "ZIP Osaka"
    ]
  },
  {
    day: "Friday",
    auctions: [
      "ARAI Bayside", "JAA Tsukuba", "Isuzu Kobe", "JU Chiba", "GE Tokyo",
      "JU Miyagi", "JU Niigata", "JU Okayama LAA", "JU Okinawa", "JU Tochigi",
      "KCAA Yamaguchi", "KUA Katayamazu", "NAA Tokyo", "USS Hokuriku",
      "USS Nagoya", "USS Osaka", "USS Saitama", "White Wing", "TAA Chubu"
    ]
  },
  {
    day: "Saturday",
    auctions: [
      "ARAI Oyama", "JU Gifu", "HAA Kobe", "JU Nara", "NAA Nagoya Nyu",
      "NA Osaka", "NAA Tokyo Nyuusatsu", "TAA Yokohama", "USS Gunma",
      "USS Kyushu", "USS Okayama", "USS Ryuutsu", "USS Shizuoka"
    ]
  },
  {
    day: "One Price",
    auctions: [
      "AS Members", "Apple Stock", "AS Oneprice", "BAYAUC Oneprice",
      "CAA Chubu Oneprice", "CAA Tohoku Oneprice", "CAA ZIP Tokyo One Price",
      "GAO Stock", "HAA Kobe One Price", "Hero Oneprice", "Ippatsu Stock",
      "JAA Kasai Oneprice", "JAA Tsukuba Oneprice", "Korea Oneprice One",
      "Kyouyuu Stock", "Syoudan Stock", "USS Stock"
    ]
  },
  // {
  //   day: "AUCNET",
  //   auctions: [
  //     "KAA", "KCAA Fukuoka", "NAA Tokyo", "USS Shizuoka", "ORIX Sendai",
  //     "KCAA Ebino", "LAA Kansai", "USS Hokuriku", "SAA Sapporo", "LAA Shikoku",
  //     "NAA Nagoya", "USS Nagoya", "TAA Hiroshima", "ORIX Atsugi", "NAA Osaka",
  //     "USS Osaka", "TAA Kinki", "USS Fujioka", "ORIX Fukuoka", "USS Saitama",
  //     "TAA kyushu", "USS Fukuoka", "ORIX Nagoya", "White Wing", "TAA Minamikyu",
  //     "USS Kobe", "SAA Hamamatsu", "TAA Shikoku", "USS Niigata", "TAA Chubu",
  //     "USS Yokohama", "USS Sapporo", "TAA Hokkaido", "USS Tohoku", "TAA Kantou",
  //     "USS R Tokyo", "USS Tokyo"
  //   ]
  // }
];

// Mobile version of the entire page
function MobileAuctionView({
  activeSection,
  scrollToSection,
  auctionInfo,
  registrationSteps,
  membershipPlans,
  detailedAuctionSchedule
}) {
  return (
    <div className="min-h-screen">
      {/* Mobile Header */}
      <motion.header 
        className="bg-gradient-to-br from-[#14225D] via-[#1a2d7c] to-[#2a3d8c] text-white py-16 px-4 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <motion.div 
          className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Car className="w-16 h-16 mx-auto text-white/80" />
          </motion.div>
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Auction Membership
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-200 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Access exclusive Japanese car auctions with our membership plans
          </motion.p>
        </div>
      </motion.header>

      {/* Mobile Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="px-2 py-2">
          <div className="flex items-center justify-between overflow-x-auto">
            {[
              { id: 'about', label: 'About', icon: Car },
              { id: 'registration', label: 'Register', icon: FileText },
              { id: 'membership', label: 'Plans', icon: Award },
              { id: 'schedule', label: 'Schedule', icon: Calendar }
            ].map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`
                  flex flex-col items-center p-2 min-w-[4.5rem]
                  ${activeSection === item.id 
                    ? 'text-[#14225D]' 
                    : 'text-gray-500'
                  }
                `}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      <main className="px-4 py-8">
        {/* About Section */}
        <motion.section id="about" className="mb-12 scroll-mt-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-[#14225D]">
            About Our Auctions
          </h2>
          <div className="space-y-4">
            {auctionInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="bg-[#14225D]/5 rounded-xl p-2">
                        <info.icon className="w-6 h-6 text-[#14225D]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-[#14225D]">{info.title}</h3>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Registration Process Section */}
        <motion.section id="registration" className="mb-12 scroll-mt-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-[#14225D]">
            Registration Process
          </h2>
          <div className="space-y-4">
            {registrationSteps.map((step, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#14225D]/5 rounded-full p-2 w-8 h-8 flex items-center justify-center">
                      <span className="text-sm font-bold text-[#14225D]">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-[#14225D]">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Membership Plans Section */}
        <motion.section id="membership" className="mb-12 scroll-mt-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-[#14225D]">
            Membership Plans
          </h2>
          <div className="space-y-6">
            {membershipPlans.map((plan, index) => (
              <Card key={plan.name} className={`relative ${
                plan.recommended ? 'border-2 border-[#14225D]' : ''
              }`}>
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#14225D] text-white">Recommended</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <plan.icon className="w-12 h-12 mx-auto text-[#14225D] mb-4" />
                  <CardTitle className="text-2xl font-bold text-[#14225D]">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold mt-4 text-[#14225D]">{plan.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-8 bg-[#14225D] hover:bg-[#1a2d7c] text-white"
                    size="lg"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Auction Schedule Section */}
        <motion.section id="schedule" className="mb-12 scroll-mt-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-[#14225D]">
            Auction Schedule
          </h2>
          <div className="space-y-4">
            {detailedAuctionSchedule.map((schedule, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="bg-[#14225D] text-white p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{schedule.day}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {schedule.auctions.map((auction, idx) => (
                      <Badge 
                        key={idx}
                        variant="outline"
                        className="bg-white border-[#14225D]/20 text-[#14225D]/80"
                      >
                        {auction}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  )
}

// Main AuctionInformation Component
export default function AuctionInformation() {
  const [activeSection, setActiveSection] = useState('about')

  const auctionInfo = [
    {
      title: "Live Bidding Experience",
      description: "Participate in real-time auctions with live video streaming and instant bidding capabilities.",
      icon: Video
    },
    {
      title: "Extensive Vehicle Selection",
      description: "Access to thousands of quality vehicles from Japan's leading auction houses.",
      icon: Car
    },
    {
      title: "Professional Inspection",
      description: "Every vehicle comes with detailed inspection reports from certified professionals.",
      icon: ClipboardCheck
    },
    {
      title: "Transparent Pricing",
      description: "Clear pricing structure with no hidden fees. See all costs upfront.",
      icon: DollarSign
    }
  ]

  const registrationSteps = [
    {
      step: 1,
      title: "Document Submission",
      description: "Prepare and submit required documents including business registration and ID.",
      icon: FileText,
      details: [
        "Valid Government ID",
        "Business Registration",
        "Proof of Address",
        "Bank Reference"
      ]
    },
    {
      step: 2,
      title: "Account Verification",
      description: "Our team verifies your documents and approves your account.",
      icon: Shield,
      details: [
        "Document Review",
        "Background Check",
        "Credit Assessment",
        "Account Approval"
      ]
    },
    {
      step: 3,
      title: "Membership Selection",
      description: "Choose the membership plan that best suits your needs.",
      icon: Award,
      details: [
        "Plan Comparison",
        "Payment Setup",
        "Access Level Selection",
        "Feature Activation"
      ]
    },
    {
      step: 4,
      title: "Auction Training",
      description: "Complete our comprehensive training on auction procedures.",
      icon: GraduationCap,
      details: [
        "Bidding Tutorial",
        "Platform Training",
        "Auction Rules",
        "Best Practices"
      ]
    }
  ]

  const membershipPlans = [
    {
      name: "Basic",
      price: "$99/month",
      features: [
        "Access to weekly auctions",
        "Basic vehicle inspection reports",
        "Email support",
        "5 bids per auction",
        "Basic auction analytics"
      ],
      icon: Car,
      recommended: false
    },
    {
      name: "Premium",
      price: "$199/month",
      features: [
        "Access to all auctions",
        "Detailed inspection reports",
        "Priority support",
        "Unlimited bids",
        "Real-time notifications",
        "Export documentation assistance",
        "Advanced auction analytics"
      ],
      icon: Shield,
      recommended: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "All Premium features",
        "Dedicated account manager",
        "Custom export solutions",
        "Bulk buying options",
        "Special rates",
        "24/7 support",
        "Custom reporting"
      ],
      icon: Building,
      recommended: false
    }
  ]

  const auctionSchedule = [
    {
      location: "Tokyo",
      day: "Monday",
      time: "10:00 AM JST",
      type: "General",
      status: "Open"
    },
    {
      location: "Osaka",
      day: "Tuesday",
      time: "11:00 AM JST",
      type: "Premium",
      status: "Members Only"
    },
    {
      location: "Nagoya",
      day: "Wednesday",
      time: "10:30 AM JST",
      type: "General",
      status: "Open"
    },
    {
      location: "Yokohama",
      day: "Thursday",
      time: "11:30 AM JST",
      type: "Special",
      status: "Premium Members"
    },
    {
      location: "Fukuoka",
      day: "Friday",
      time: "10:00 AM JST",
      type: "General",
      status: "Open"
    }
  ]

  const breadcrumbItems = [
    { label: 'Auction', href: '/auction' }
  ]

  // Add useEffect for scroll observation
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-20% 0px -80% 0px', // Adjusts the detection area
      threshold: 0
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }, options)

    // Observe all sections
    const sections = document.querySelectorAll('section[id]')
    sections.forEach((section) => observer.observe(section))

    return () => {
      sections.forEach((section) => observer.unobserve(section))
    }
  }, [])

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        {/* Your entire existing desktop JSX remains exactly the same */}
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileAuctionView
          activeSection={activeSection}
          scrollToSection={scrollToSection}
          auctionInfo={auctionInfo}
          registrationSteps={registrationSteps}
          membershipPlans={membershipPlans}
          detailedAuctionSchedule={detailedAuctionSchedule}
        />
      </div>
    </>
  )
}
