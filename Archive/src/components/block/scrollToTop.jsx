'use client'

import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
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
        <button
          onClick={scrollToTop}
          className={`
            fixed 
            bottom-4 
            right-4 
            z-50 
            p-2 
            rounded-full 
            bg-blue-950 
            text-white 
            shadow-lg 
            transition-all 
            duration-300 
            ease-in-out 
            hover:bg-blue-800 
            hover:shadow-xl 
            hover:-translate-y-1
            focus:outline-none
            group
          `}
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
        </button>
      )}
    </>
  )
}