"use client";
import React, { useState } from "react";
import { Button } from "@nextui-org/react";
import { ChevronLeft, ChevronRight, Download, Heart, ZoomIn, ZoomOut } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ImageZoom from "./ImageZoom";
import NextImage from "next/image";
import { useToast } from "@/components/ui/use-toast";

export default function ImageSlider({ images, carId }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const toggleFavorite = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carId }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      const data = await response.json();
      setIsFavorite(data.isFavorited);
      
      toast({
        title: data.isFavorited ? "Added to favorites" : "Removed from favorites",
        description: data.isFavorited 
          ? "This car has been added to your favorites list" 
          : "This car has been removed from your favorites list",
        duration: 3000,
      });

    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Please login to add favorites",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImages = async () => {
    const zip = new JSZip();
    const promises = images.map(async (url, index) => {
      const response = await fetch(url);
      const blob = await response.blob();
      zip.file(`car-image-${index + 1}.jpg`, blob);
    });

    await Promise.all(promises);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "car-images.zip");
  };

  return (
    <div className="relative">
      <div className="relative h-[500px]">
        <ImageZoom 
          image={images[currentImageIndex]} 
          alt={`Car image ${currentImageIndex + 1}`}
          className="object-cover w-full h-full rounded-lg"
          onZoomChange={(zoomed) => setIsZoomed(zoomed)}
        />

        {/* Zoom Controls - Left side */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200"
          >
            {isZoomed ? (
              <ZoomOut className="h-6 w-6" />
            ) : (
              <ZoomIn className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Favorite Button - Right side */}
        <button
          onClick={toggleFavorite}
          disabled={isLoading}
          className={`absolute top-4 right-4 p-2 rounded-full z-20 transition-all duration-200 ${
            isFavorite 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-black/50 text-white hover:bg-black/70'
          }`}
        >
          <Heart 
            className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} 
          />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-20">
          {currentImageIndex + 1}/{images.length}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 z-20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 z-20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Thumbnails Section */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="flat"
              onClick={() => setShowThumbnails(!showThumbnails)}
            >
              {showThumbnails ? 'Hide thumbnails' : 'Show thumbnails'}
            </Button>
            <Button
              size="sm"
              variant="flat"
              onClick={downloadImages}
              startContent={<Download className="h-4 w-4" />}
            >
              Download All
            </Button>
          </div>
        </div>

        {showThumbnails && (
          <div className="grid grid-cols-6 gap-2 mt-2">
            {images.map((image, index) => (
              <div
                key={index}
                onClick={() => handleImageChange(index)}
                className={`cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
                  currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <NextImage
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  width={80}
                  height={60}
                  className="w-full h-16 object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
