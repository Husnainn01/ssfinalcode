"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import NextImage from "next/image";
import { useToast } from "@/components/ui/use-toast";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

export default function ImageSlider({ images, carId }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(true);
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

  const getCarImages = () => {
    if (!car) return [];
    
    let allImages = [];
    
    // Only add images from the images array, ignore the blob URL
    if (Array.isArray(car.images) && car.images.length > 0) {
      allImages = car.images.filter(img => 
        img && 
        img.trim() !== '' && 
        !img.startsWith('blob:')
      );
    }
    
    // Remove duplicates
    allImages = [...new Set(allImages)];
    
    console.log('Processed images:', allImages); // Debug log
    
    return allImages;
  };

  return (
    <div className="relative">
      {/* Main Slider */}
      <div className="relative h-[500px] md:h-[600px]">
        <div className="relative h-full w-full">
          <NextImage
            src={images[currentImageIndex]}
            alt={`Car Image ${currentImageIndex + 1}`}
            fill
            className="object-contain"
            priority
          />

          {/* Favorite Button */}
          <div className="absolute top-4 right-4 z-20 bg-black/50 rounded-full">
            {carId && <FavoriteButton carId={carId} />}
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
      </div>

      {/* Controls and thumbnails */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="flat"
              onClick={() => setShowThumbnails(!showThumbnails)}
              className="text-xs"
            >
              {showThumbnails ? 'Hide thumbnails' : 'Show thumbnails'}
            </Button>
            <Button
              size="sm"
              variant="flat"
              onClick={downloadImages}
              startContent={<Download className="h-4 w-4" />}
              className="text-xs"
            >
              Download All
            </Button>
          </div>
        </div>

        {showThumbnails && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-2">
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