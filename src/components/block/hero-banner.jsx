'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [sliders, setSliders] = useState([])
  const [loading, setLoading] = useState(true)
  const [direction, setDirection] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    fetchSliders()
  }, [])

  useEffect(() => {
    if (sliders.length > 1) {
      startTimer()
    }
    return () => clearInterval(timerRef.current)
  }, [sliders.length])

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDirection(1)
      setCurrentSlide(prev => (prev + 1) % sliders.length)
    }, 5000)
  }

  const fetchSliders = async () => {
    try {
      const response = await fetch('/api/slider')
      const data = await response.json()
      const activeSliders = data
        .filter(slider => slider.isActive)
        .sort((a, b) => a.order - b.order)
      setSliders(activeSliders)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching sliders:', error)
      setLoading(false)
    }
  }

  const nextSlide = () => {
    clearInterval(timerRef.current)
    setDirection(1)
    setCurrentSlide(prev => (prev + 1) % sliders.length)
    startTimer()
  }

  const prevSlide = () => {
    clearInterval(timerRef.current)
    setDirection(-1)
    setCurrentSlide(prev => (prev - 1 + sliders.length) % sliders.length)
    startTimer()
  }

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  if (loading) {
    return <div className="h-[500px] bg-gray-200 animate-pulse" />
  }

  if (sliders.length === 0) {
    return <div className="h-[500px] bg-gray-100" />
  }

  const currentSlider = sliders[currentSlide]

  return (
    <div className="relative overflow-hidden group">
      <div className="h-[400px] relative">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute w-full h-full"
          >
            <Image
              src={currentSlider.imageUrl}
              alt={currentSlider.title}
              fill
              priority
              className="object-cover"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute inset-0 flex items-center"
            >
              <div className="container mx-auto px-4">
                <div className="max-w-[550px] text-white space-y-4 [text-shadow:_0_1px_2px_rgba(0,0,0,0.6)]">
                  {currentSlider.highlight && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="bg-blue-600/90 text-sm font-medium px-3 py-1 rounded-full">
                        {currentSlider.highlight}
                      </span>
                    </motion.div>
                  )}
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl font-bold [text-shadow:_0_2px_4px_rgba(0,0,0,0.8)]"
                  >
                    {currentSlider.title}
                  </motion.h1>
                  
                  {currentSlider.description && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-base text-white [text-shadow:_0_1px_2px_rgba(0,0,0,0.6)]"
                    >
                      {currentSlider.description}
                    </motion.p>
                  )}
                  
                  {currentSlider.link && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Link
                        href={currentSlider.link}
                        className="group inline-flex items-center gap-2 bg-blue-600 text-white 
                          px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
                      >
                        Learn More
                        <FaArrowRight className="transition-transform duration-300 
                          group-hover:translate-x-1" />
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {sliders.length > 1 && (
          <>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between 
              items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSlide}
                className="w-10 h-10 flex items-center justify-center rounded-full 
                  bg-black/30 text-white hover:bg-black/50 transition-all duration-300"
                aria-label="Previous slide"
              >
                <FaChevronLeft className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                className="w-10 h-10 flex items-center justify-center rounded-full 
                  bg-black/30 text-white hover:bg-black/50 transition-all duration-300"
                aria-label="Next slide"
              >
                <FaChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Progress Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {sliders.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => {
                    clearInterval(timerRef.current)
                    setDirection(index > currentSlide ? 1 : -1)
                    setCurrentSlide(index)
                    startTimer()
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 
                    ${index === currentSlide 
                      ? 'w-8 bg-white' 
                      : 'w-1.5 bg-white/50 hover:bg-white/75'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}