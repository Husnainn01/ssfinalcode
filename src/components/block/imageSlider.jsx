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
  const [watermarkedImages, setWatermarkedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Apply watermarks when component mounts or images change
  useEffect(() => {
    if (images && images.length > 0) {
      setIsLoading(true);
      applyWatermarksToImages();
    }
  }, [images]);

  const applyWatermarksToImages = async () => {
    try {
      const processed = await Promise.all(
        images.map(url => addWatermark(url))
      );
      setWatermarkedImages(processed);
    } catch (error) {
      console.error("Error applying watermarks:", error);
      toast({
        title: "Warning",
        description: "Could not apply watermarks to some images",
        variant: "destructive",
      });
      // Fallback to original images
      setWatermarkedImages(images);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? watermarkedImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === watermarkedImages.length - 1 ? 0 : prev + 1));
  };

  const downloadImages = async () => {
    const zip = new JSZip();
    
    // Use watermarked images for download
    const imagesToDownload = watermarkedImages.length > 0 ? watermarkedImages : images;
    
    const promises = imagesToDownload.map(async (url, index) => {
      // For data URLs, convert directly to blob
      if (url.startsWith('data:')) {
        const response = await fetch(url);
        const blob = await response.blob();
        zip.file(`car-image-${index + 1}.jpg`, blob);
      } else {
        // For regular URLs, fetch first
        const response = await fetch(url);
        const blob = await response.blob();
        zip.file(`car-image-${index + 1}.jpg`, blob);
      }
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

  const addWatermark = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Set canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image on the canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Add watermark text
        const text = "Global Drive Motor";
        
        // Calculate font size based on image dimensions (more visible)
        const fontSize = Math.max(canvas.width * 0.04, 24);
        ctx.font = `bold ${fontSize}px Arial`;
        
        // More visible watermark with shadow
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = fontSize * 0.05;
        
        // Center watermark diagonally
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 6); // Rotate by -30 degrees
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Add shadow for better visibility
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw text with stroke for better visibility on any background
        ctx.strokeText(text, 0, 0);
        ctx.fillText(text, 0, 0);
        
        // Add a second watermark in the bottom right (smaller)
        ctx.restore();
        
        // Bottom right watermark
        const smallerFontSize = Math.max(canvas.width * 0.025, 16);
        ctx.font = `bold ${smallerFontSize}px Arial`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = smallerFontSize * 0.05;
        
        // Position in bottom right with padding
        const padding = smallerFontSize;
        const textWidth = ctx.measureText(text).width;
        
        // Add shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        // Draw bottom right watermark
        ctx.strokeText(
          text, 
          canvas.width - textWidth - padding, 
          canvas.height - padding
        );
        ctx.fillText(
          text, 
          canvas.width - textWidth - padding, 
          canvas.height - padding
        );
        
        // Convert canvas to data URL with high quality
        const watermarkedUrl = canvas.toDataURL("image/jpeg", 0.95);
        resolve(watermarkedUrl);
      };
      
      img.onerror = () => {
        console.error("Error loading image:", imageUrl);
        reject(new Error("Failed to load image"));
      };
      
      img.src = imageUrl;
    });
  };

  // Show loading state while watermarks are being applied
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Use watermarked images if available, otherwise use original images
  const displayImages = watermarkedImages.length > 0 ? watermarkedImages : images;

  return (
    <div className="relative">
      {/* Main Slider */}
      <div className="relative h-[500px] md:h-[600px]">
        <div className="relative h-full w-full">
          <NextImage
            src={displayImages[currentImageIndex]}
            alt={`Car Image ${currentImageIndex + 1}`}
            fill
            className="object-contain"
            priority
            unoptimized={true} // Important to prevent Next.js from optimizing and removing the watermark
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
            {displayImages.map((image, index) => (
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
                  unoptimized={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}