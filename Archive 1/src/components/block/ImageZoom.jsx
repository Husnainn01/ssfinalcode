"use client";
import React, { useState, useRef } from "react";
import NextImage from "next/image";
import { Button } from "@nextui-org/react";
import { ZoomIn, ZoomOut } from "lucide-react";

export default function ImageZoom({ image, alt, className, onZoomChange }) {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleZoom = (zoomIn) => {
    setScale(prev => {
      const newScale = zoomIn ? prev + 0.5 : prev - 0.5;
      const finalScale = Math.min(Math.max(newScale, 1), 3);
      if (onZoomChange) {
        onZoomChange(finalScale > 1);
      }
      return finalScale;
    });
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      const bounds = containerRef.current?.getBoundingClientRect();
      if (bounds) {
        const maxX = (bounds.width * (scale - 1)) / 2;
        const maxY = (bounds.height * (scale - 1)) / 2;
        
        setPosition({
          x: Math.min(Math.max(newX, -maxX), maxX),
          y: Math.min(Math.max(newY, -maxY), maxY)
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-full w-full bg-gray-100 rounded-lg overflow-hidden"
    >
      <div
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ 
          cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default',
          overflow: 'hidden'
        }}
      >
        <NextImage
          src={image}
          alt={alt}
          fill
          className={`object-contain transition-transform duration-200 ${className || ''}`}
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          }}
        />
      </div>
    </div>
  );
}
