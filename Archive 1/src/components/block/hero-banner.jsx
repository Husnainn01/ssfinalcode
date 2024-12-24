'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion'

const banners = [
  { 
    id: 1, 
    imageUrl: '/hero1.jpg',
    title: "Discover Your Perfect Ride",
    subtitle: "Elevating Your Driving Experience",
    highlight: "2024 Collection",
    position: "bottom-4"
  },
  { 
    id: 2, 
    imageUrl: '/hero2.jpg',
    title: "Luxury Meets Performance",
    subtitle: "Where Excellence Drives Innovation",
    highlight: "Premium Selection",
    position: "bottom-4"
  },
  { 
    id: 3, 
    imageUrl: '/hero3.jpg',
    title: "Drive Your Dreams",
    subtitle: "Crafting Memories on Every Road",
    highlight: "Exclusive Models",
    position: "bottom-4"
  },
  { 
    id: 4, 
    imageUrl: '/hero4.jpg',
    title: "Premium Selection",
    subtitle: "Redefining Automotive Luxury",
    highlight: "Limited Edition",
    position: "bottom-4"
  },
]

export default function Component() {
  const [currentBanner, setCurrentBanner] = useState(0)
  const constraintsRef = useRef(null)
  const x = useMotionValue(0)
  const background = useTransform(
    x,
    [-300, 0, 300],
    [
      "linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3))",
      "linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.2))",
      "linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3))"
    ]
  )

  const controls = useAnimation()

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length)
  }

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)
  }

  useEffect(() => {
    const interval = setInterval(nextBanner, 6000)
    return () => clearInterval(interval)
  }, [])

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      prevBanner()
    } else if (info.offset.x < -100) {
      nextBanner()
    }
    controls.start({ x: 0 })
  }

  return (
    <div className="relative w-full h-[40vh] overflow-hidden z-0">
      <button 
        onClick={prevBanner}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 
          bg-black/30 hover:bg-black/50 text-white p-2 rounded-full
          backdrop-blur-sm transition-all duration-200 group"
        aria-label="Previous banner"
      >
        <svg 
          className="w-6 h-6 transform group-hover:-translate-x-0.5 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        onClick={nextBanner}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 
          bg-black/30 hover:bg-black/50 text-white p-2 rounded-full
          backdrop-blur-sm transition-all duration-200 group"
        aria-label="Next banner"
      >
        <svg 
          className="w-6 h-6 transform group-hover:translate-x-0.5 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <motion.div 
        className="relative w-full h-full cursor-grab active:cursor-grabbing"
        style={{ background }}
        ref={constraintsRef}
      >
        <motion.div
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ x }}
          className="w-full h-full"
        >
          {banners.map((banner, index) => (
            <motion.div
              key={banner.id}
              className="absolute top-0 left-0 w-full h-full"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ 
                opacity: index === currentBanner ? 1 : 0,
                scale: index === currentBanner ? 1 : 1.1
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <img
                src={banner.imageUrl}
                alt={`Banner ${banner.id}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              <motion.div 
                className={`absolute ${banner.position} left-8 right-8 text-white z-[5]`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: index === currentBanner ? 1 : 0,
                  y: index === currentBanner ? 0 : 20
                }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <motion.span 
                  className="inline-block text-sm font-medium tracking-wider mb-2 
                    bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: index === currentBanner ? 1 : 0,
                    x: index === currentBanner ? 0 : -20
                  }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                >
                  {banner.highlight}
                </motion.span>

                <h2 className="font-['GoldenWings'] text-5xl mb-3 
                  tracking-wide leading-tight gradient-text"
                  style={{
                    letterSpacing: '0.05em',
                  }}
                >
                  {banner.title}
                </h2>

                <p className="text-lg text-white/90 font-light tracking-wide
                  max-w-xl leading-relaxed"
                  style={{
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                  }}
                >
                  {banner.subtitle}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-[5]">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`h-1 transition-all duration-500 rounded-full ${
              index === currentBanner 
                ? 'w-8 bg-white' 
                : 'w-4 bg-white/40 hover:bg-white/60'
            }`}
            onClick={() => setCurrentBanner(index)}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}