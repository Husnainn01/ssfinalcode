'use client'

import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Calculate scroll progress and visibility with smoother updates
  const toggleVisibility = () => {
    const winScroll = window.scrollY
    const height = document.documentElement.scrollHeight - window.innerHeight
    const scrolled = Math.min(Math.max((winScroll / height) * 100, 0), 100)

    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      setScrollProgress(scrolled)
      setIsVisible(winScroll > 300)
    })
  }

  // Set the scroll event listener with throttling
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          toggleVisibility()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-0 right-0 z-50 p-4 md:p-6">
          <button
            onClick={scrollToTop}
            className={`
              flex
              items-center
              justify-center
              h-12
              w-12
              rounded-full 
              bg-gradient-to-r
              from-[#14225D]
              to-[#1a2d7c]
              text-white 
              shadow-lg 
              transition-all 
              duration-300 
              ease-in-out 
              hover:scale-110
              hover:shadow-[0_0_15px_rgba(20,34,93,0.5)]
              focus:outline-none
              focus:ring-2
              focus:ring-[#14225D]/50
              focus:ring-offset-2
              group
              backdrop-blur-sm
              bg-opacity-90
              relative
            `}
            aria-label="Scroll to top"
          >
            {/* Circular Progress Bar */}
            <svg
              className="absolute w-full h-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                className="text-[#14225D]/10"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="44"
                cx="50"
                cy="50"
              />
              <circle
                className="text-white transition-all duration-500 ease-out"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="44"
                cx="50"
                cy="50"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - scrollProgress / 100)}`}
                style={{
                  transition: 'stroke-dashoffset 0.5s ease-out'
                }}
              />
            </svg>
            
            {/* Icon */}
            <ChevronUp 
              className="h-6 w-6 transition-transform duration-300 
                         group-hover:animate-bounce relative z-10" 
            />
            <span className="sr-only">Scroll to top</span>
          </button>
        </div>
      )}
    </>
  )
}