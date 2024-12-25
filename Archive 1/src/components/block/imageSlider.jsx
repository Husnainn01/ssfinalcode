"use client";
import React, { useState, useRef } from "react";
import { Button } from "@nextui-org/react";
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ImageZoom from "./ImageZoom";
import NextImage from "next/image";
import { useToast } from "@/components/ui/use-toast";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

export default function ImageSlider({ images, carId }) {
  console.log('ImageSlider carId:', carId);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const { toast } = useToast();
  const zoomRef = useRef(null);

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

  const handleZoomToggle = () => {
    if (isZoomed) {
      zoomRef.current?.resetZoom();
    } else {
      zoomRef.current?.zoomIn();
    }
  };

  return (
    <div className="relative">
      <div className="relative h-[500px]">
        <ImageZoom 
          ref={zoomRef}
          image={images[currentImageIndex]} 
          alt={`Car image ${currentImageIndex + 1}`}
          className="object-cover w-full h-full rounded-lg"
          onZoomChange={(zoomed) => setIsZoomed(zoomed)}
        />

        {/* Zoom Controls - Left side */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          <button
            onClick={handleZoomToggle}
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
        <div className="absolute top-4 right-4 z-20 bg-black/50 rounded-full">
          {carId && <FavoriteButton carId={carId} />}
        </div>

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
