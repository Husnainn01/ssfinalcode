"use client";
import {
  FaCheckCircle,
  FaCar,
  FaCalendarAlt,
  FaTachometerAlt,
  FaTag,
  FaClock,
  FaBarcode,
  FaCarAlt,
  FaPalette,
  FaDoorClosed,
  FaGasPump,
  FaCarSide,
  FaUsers,
  FaExchangeAlt,
  FaCogs,
  FaMapMarkerAlt,
} from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";
import RelatedCars from "./relatedCars";
import { FaGears } from "react-icons/fa6";
import CarInquiryForm from "@/components/block/carInquiryForm";
import ImageSlider from "@/components/block/imageSlider";

export default function ListingPage({ car, slug, favoriteButton }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const slider1 = useRef(null);
  const slider2 = useRef(null);

  useEffect(() => {
    setNav1(slider1.current);
    setNav2(slider2.current);
  }, []);

  useEffect(() => {
    if (slider1.current && slider2.current) {
      slider1.current.slickGoTo(0);
      slider2.current.slickGoTo(0);
    }
  }, [car.images]);

  const getCarImages = () => {
    if (!car) return [];
    
    let allImages = [];
    
    // Add the main image if it exists
    if (car.image) {
      allImages.push(car.image);
    }
    
    // Add additional images if they exist
    if (Array.isArray(car.images) && car.images.length > 0) {
      allImages = [...allImages, ...car.images.filter(img => img && img.trim() !== '')];
    }
    
    // Remove duplicates and empty values
    allImages = [...new Set(allImages)].filter(img => img && img.trim() !== '');
    
    return allImages;
  };

  const renderImageSlider = () => {
    try {
      const images = getCarImages();
      console.log('Available images:', images); // Debug log
      
      if (images.length === 0) {
        return (
          <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center">
            <p>No images available</p>
          </div>
        );
      }

      return (
        <ImageSlider 
          images={images} 
          carId={car._id}
          key={images.join(',')}
        />
      );
    } catch (error) {
      console.error('Error rendering image slider:', error);
      return (
        <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center">
          <p>Failed to load images</p>
        </div>
      );
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!car) {
    return <div>Car not found</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-20 mt-3 md:mt-10">
      <div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-3/5">
            <div className="relative w-full">
              {car.offerType === "Sold" && (
                <div className="absolute top-0 left-0 z-50">
                  <div className="bg-red-600/90 text-white px-8 py-3 shadow-lg backdrop-blur-sm">
                    <span className="text-2xl font-bold tracking-wider">SOLD</span>
                  </div>
                  <div className="absolute -bottom-2 left-0 w-0 h-0 
                    border-t-[8px] border-t-red-800
                    border-r-[8px] border-r-transparent">
                  </div>
                </div>
              )}
              {renderImageSlider()}
            </div>
            <div>
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mt-4 px-4 rounded-md">
                <h1 className="font-semibold my-2 text-2xl lg:text-3xl">{car.title}</h1>
              </div>

              <h2 className="text-xl font-semibold mt-4 pl-4">Car Overview</h2>
              <div className="p-4 rounded-md grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  {icon: FaCar, label: "Stock Number", value: car.stockNumber},
                  { icon: FaCar, label: "Make", value: car.make },
                  { icon: FaCarAlt, label: "Model", value: car.model },
                  { icon: FaCalendarAlt, label: "Year", value: car.year },
                  { icon: FaTachometerAlt, label: "Mileage", value: `${car.mileage} ${car.mileageUnit}` },
                  { icon: FaTag, label: "Condition", value: car.itemCondition },
                  { icon: FaClock, label: "Availability", value: car.availability },
                  { icon: FaBarcode, label: "VIN", value: car.vin },
                  { icon: FaCarAlt, label: "Body Type", value: car.bodyType },
                  { icon: FaPalette, label: "Color", value: car.color },
                  { icon: FaGears, label: "Drive Wheel", value: car.driveWheelConfiguration },
                  { icon: FaDoorClosed, label: "Doors", value: car.numberOfDoors },
                  { icon: FaGasPump, label: "Fuel Type", value: car.fuelType },
                  { icon: FaCarSide, label: "Engine", value: car.vehicleEngine },
                  { icon: FaUsers, label: "Seating", value: car.vehicleSeatingCapacity },
                  { icon: FaExchangeAlt, label: "Transmission", value: car.vehicleTransmission },
                  { icon: FaCogs, label: "Cylinders", value: car.cylinders },
                  { icon: FaMapMarkerAlt, label: "Country", value: car.country },
                  { icon: FaMapMarkerAlt, label: "Category", value: car.category },
                ].map(({ icon: Icon, label, value }, index) => (
                  <p key={index} className="flex items-center gap-2 p-2 rounded-md shadow-sm bg-white">
                    <Icon className="text-gray-700" />
                    <span className="font-medium">{label}:</span>
                    <span className="text-gray-600">{value}</span>
                  </p>
                ))}
              </div>

              {/* Car Features Section */}
              <div className="bg-gray-100 p-4 rounded-md mt-2">
                <h3 className="font-semibold mb-2">Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {car.carFeature.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Car Safety Features Section */}
              <div className="bg-gray-100 p-4 rounded-md mt-2">
                <h3 className="font-semibold mb-2">Safety Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {car.carSafetyFeature.map((safety, index) => (
                    <div key={index} className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      <span>{safety}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/5 sticky top-4 self-start lg:sticky lg:top-4">
            <CarInquiryForm carDetails={car} />
            <div className="mt-6">
              <h4 className="mb-3 font-semibold">Related Cars</h4>
              <RelatedCars />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
