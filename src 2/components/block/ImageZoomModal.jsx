"use client";
import React, { useState, useRef, useEffect } from "react";
import NextImage from "next/image";

const ImageZoomModal = ({ isOpen, onClose, image, alt }) => {
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef(null);
  const ZOOM_LEVEL = 2.5;

  if (!isOpen) return null;

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Get relative position
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({
      x: Math.min(Math.max(x, 0), 100),
      y: Math.min(Math.max(y, 0), 100)
    });
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
  };

  const handleMouseEnter = () => {
    setShowZoom(true);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg p-4 relative flex gap-4">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-50 bg-black text-white rounded-full p-2 hover:bg-black/70"
        >
          ✕
        </button>

        {/* Original Image */}
        <div
          ref={containerRef}
          className="relative w-[500px] h-[500px] cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <NextImage
            src={image}
            alt={alt}
            fill
            className="object-contain"
            priority
          />
          {showZoom && (
            <div
              className="absolute border-2 border-blue-500 pointer-events-none bg-white/10"
              style={{
                width: '100px',
                height: '100px',
                left: `${zoomPosition.x - 5}%`,
                top: `${zoomPosition.y - 5}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}
        </div>

        {/* Zoomed View */}
        <div className="relative w-[500px] h-[500px] border border-gray-200 overflow-hidden">
          {showZoom && (
            <div
              className="absolute w-[300%] h-[300%]"
              style={{
                transform: `translate(-${zoomPosition.x}%, -${zoomPosition.y}%)`
              }}
            >
              <NextImage
                src={image}
                alt={`Zoomed ${alt}`}
                fill
                className="object-contain"
                quality={100}
                priority
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageZoomModal; 