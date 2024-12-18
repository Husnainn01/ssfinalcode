"use client"

import { useState, useEffect } from 'react'

const Banner = ({ bannerData }) => {
  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between">
        <div className="relative h-[30px] md:h-[50px] w-full flex items-center justify-center">
          <img 
            src="/ban2.jpg" 
            alt="Banner" 
            className="h-[30px] md:h-[50px] object-cover"
          />
        </div>
      </div>
    </div>
  )
}

export default Banner