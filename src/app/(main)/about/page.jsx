"use client";

import LeftSidebar from "@/components/template/leftsidebar"
import Breadcrumbs from '@/components/ui/breadcrumbs'
import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronDown, Award, Users, Calendar, MapPin, Shield, Globe, Target, Trophy, Leaf, BarChart, Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import Link from 'next/link'

export default function InteractiveAboutUs() {
  const [activeSection, setActiveSection] = useState('history')

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const milestones = [
    { year: 1995, event: 'Founded as a small family-owned dealership in Tokyo', icon: Calendar },
    { year: 2000, event: 'Expanded operations to international markets', icon: Globe },
    { year: 2005, event: 'Launched our certified pre-owned program', icon: Shield },
    { year: 2015, event: 'Introduced electric and hybrid vehicle department', icon: Leaf },
    { year: 2023, event: 'Celebrating decades of excellence in automotive retail', icon: Trophy }
  ]

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

  const breadcrumbItems = [
    { label: 'About', href: '/about' }
  ]

  return (
    <div className="flex flex-col md:flex-row">
      <div className="hidden md:block md:w-1/5 lg:w-1/6 bg-[#243642]">
        <div className="sticky top-0">
          <LeftSidebar />
        </div>
      </div>
      
      <div className="min-h-screen bg-gradient-to-br from-[#E2F1E7] to-white w-full">
        <header className="relative h-[50vh] md:h-[80vh] overflow-hidden">
          <Image
            src="/about-hero.jpg"
            alt="HSW Global Headquarters"
            layout="fill"
            objectFit="cover"
            priority
            className="filter brightness-75 scale-105 transform hover:scale-100 transition-transform duration-[2s]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
          </div>
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="mb-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Trophy className="w-16 h-16 text-white/90" />
            </motion.div>
            <motion.h1 
              className="text-4xl sm:text-6xl md:text-8xl font-bold text-white mb-4 md:mb-6 tracking-tight px-4 text-center"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Our Legacy
            </motion.h1>
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed px-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Building Trust Through Excellence Since 1995
            </motion.p>
          </motion.div>
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <ChevronDown className="w-12 h-12 text-white animate-bounce" />
          </motion.div>
        </header>

        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <nav className="bg-[#243642]/95 backdrop-blur-sm text-white sticky top-0 z-50 shadow-lg overflow-x-auto">
          <div className="max-w-7xl mx-auto">
            <ul className="flex justify-start md:justify-center space-x-4 md:space-x-8 p-4 min-w-max">
              {['History', 'Mission', 'Achievements'].map((item) => (
                <motion.li 
                  key={item}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={activeSection === item.toLowerCase() ? 'secondary' : 'ghost'}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className={`
                      ${activeSection === item.toLowerCase()
                        ? 'bg-[#629584] hover:bg-[#629584]/90 shadow-lg'
                        : 'text-white hover:bg-[#629584]/20'
                      } transition-all duration-300 text-sm md:text-base font-medium px-4 md:px-8 py-4 md:py-6 rounded-xl whitespace-nowrap
                    `}
                  >
                    {item}
                  </Button>
                </motion.li>
              ))}
            </ul>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-12 md:py-24 space-y-16 md:space-y-32">
          <motion.section
            id="history"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            variants={fadeIn}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-16 text-center text-[#243642] tracking-tight">
              Our Journey
            </h2>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#629584] to-[#243642]"></div>
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  className="relative mb-8 md:mb-12"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="w-full md:w-1/2 px-4 md:px-6">
                      <div className={`bg-white p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                        index % 2 === 0 ? 'md:text-right' : ''
                      }`}>
                        <milestone.icon className={`w-6 h-6 md:w-8 md:h-8 ${
                          index % 2 === 0 ? 'md:ml-auto' : ''
                        } text-[#629584] mb-3 md:mb-4`} />
                        <h3 className="text-xl md:text-2xl font-bold text-[#243642] mb-2">{milestone.year}</h3>
                        <p className="text-gray-600">{milestone.event}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            id="mission"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            variants={fadeIn}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-center text-[#243642]">
              Our Mission
            </h2>
            <Card className="bg-[#243642] text-white mb-8 md:mb-16 transform hover:scale-[1.02] transition-transform duration-300">
              <CardContent className="p-6 md:p-12">
                <p className="text-xl md:text-3xl text-center italic leading-relaxed">
                  "To provide exceptional automotive experiences by offering quality vehicles,
                  superior customer service, and innovative solutions that exceed our customers' expectations."
                </p>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                { icon: Shield, title: 'Quality Assurance', description: 'Every vehicle undergoes rigorous inspection and certification processes.' },
                { icon: Globe, title: 'Global Reach', description: 'Serving customers worldwide with reliable shipping and support.' },
                { icon: Target, title: 'Customer Focus', description: 'Dedicated to exceeding expectations at every interaction.' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card className="h-full transform hover:scale-[1.03] transition-all duration-300">
                    <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                      <div>
                        <div className="bg-[#E2F1E7] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                          <item.icon className="w-8 h-8 text-[#629584]" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4 text-[#243642]">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            id="achievements"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            variants={fadeIn}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-center text-[#243642]">
              Our Achievements
            </h2>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              {[
                {
                  year: 2022,
                  title: 'Global Excellence Award',
                  description: 'Recognized for outstanding international service and customer satisfaction across all markets.',
                  icon: Trophy,
                  stats: '95% Customer Satisfaction Rate'
                },
                {
                  year: 2020,
                  title: 'Sustainability Leadership',
                  description: 'Awarded for pioneering eco-friendly practices and promoting sustainable automotive solutions.',
                  icon: Leaf,
                  stats: '30% Carbon Footprint Reduction'
                },
                {
                  year: 2018,
                  title: 'Customer Trust Award',
                  description: 'Acknowledged for maintaining the highest standards of transparency and customer service.',
                  icon: Shield,
                  stats: '50,000+ Happy Customers'
                },
                {
                  year: 2015,
                  title: 'Innovation Excellence',
                  description: 'Honored for implementing cutting-edge technology in vehicle inspection and customer experience.',
                  icon: Lightbulb,
                  stats: '100+ Technology Innovations'
                },
              ].map((achievement, index) => (
                <motion.div
                  key={achievement.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <AccordionItem 
                    value={`item-${index}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center w-full">
                        <Badge 
                          variant="outline" 
                          className="mr-4 bg-[#629584] text-white border-none px-3 py-1"
                        >
                          {achievement.year}
                        </Badge>
                        <span className="text-lg font-medium text-[#243642] flex-grow text-left">
                          {achievement.title}
                        </span>
                        <achievement.icon className="w-5 h-5 text-[#629584] mr-2 hidden md:block" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <motion.div 
                        className="px-6 pb-4"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-[#E2F1E7]/30 rounded-lg p-4 mb-3">
                          <p className="text-gray-600 leading-relaxed">{achievement.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4 text-sm text-[#629584] font-medium">
                          <span className="flex items-center">
                            <BarChart className="w-4 h-4 mr-2" />
                            {achievement.stats}
                          </span>
                          <Button 
                            variant="ghost" 
                            className="text-[#629584] hover:text-[#629584]/80 hover:bg-[#E2F1E7]/50"
                          >
                            Learn More →
                          </Button>
                        </div>
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>

            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8 md:mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {[
                { label: 'Years of Excellence', value: '28+' },
                { label: 'HSW Global', value: '50+' },
                { label: 'Vehicles Delivered', value: '100K+' },
                { label: 'Customer Satisfaction', value: '95%' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow duration-300"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <p className="text-2xl md:text-3xl font-bold text-[#629584]">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        </main>

        <footer className="bg-gradient-to-br from-[#243642] to-[#1a2832] text-white py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Experience Excellence with HSW Global
            </motion.h2>
            <motion.p 
              className="text-lg md:text-xl text-gray-300 mb-8 md:mb-12 max-w-2xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Join thousands of satisfied customers who trust us for quality Japanese vehicles
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/contact-us">
                <Button
                  className="bg-[#629584] hover:bg-[#629584]/90 text-white px-12 py-6 text-lg rounded-xl"
                >
                  Contact Us Today
                </Button>
              </Link>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  )
}
