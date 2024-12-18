'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion'

const banners = [
  { id: 1, imageUrl: '/hero1.jpg' },
  { id: 2, imageUrl: '/hero2.jpg' },
  { id: 3, imageUrl: '/hero3.jpg' },
  { id: 3, imageUrl: '/hero4.jpg' },
]

export default function Component() {
  const [currentBanner, setCurrentBanner] = useState(0)
  const constraintsRef = useRef(null)
  const x = useMotionValue(0)
  const background = useTransform(
    x,
    [-300, 0, 300],
    [
      "linear-gradient(135deg, rgb(0, 210, 238), rgb(0, 83, 238))",
      "linear-gradient(135deg, rgb(255, 173, 96), rgb(255, 140, 40))",
      "linear-gradient(135deg, rgb(238, 178, 0), rgb(238, 0, 0))"
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
    const interval = setInterval(nextBanner, 5000)
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
    <motion.div 
      className="relative w-full h-[40vh] overflow-hidden cursor-grab active:cursor-grabbing"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentBanner ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={banner.imageUrl}
              alt={`Banner ${banner.id}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-30" />
          </motion.div>
        ))}
      </motion.div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              index === currentBanner ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => setCurrentBanner(index)}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
      
      <div className="absolute bottom-8 right-8 text-white text-xl font-bold">
        Swipe or Drag
      </div>
    </motion.div>
  )
}