"use client"
import React, { useState, useEffect } from 'react';
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import SingleBox from "@/components/block/singleBox";
import BlogPost from "@/components/block/blogPost";
import FilterCars from "./components/block/filterCars";
import Listing from "@/components/block/listing";
import LeftSidebar from "@/components/template/leftsidebar";
import RightSidebar from "@/components/template/rightsidebar";
import PurchaseFlow from "@/components/block/purchaseflow";
import FAQ from '@/components/block/faq'
import HeroBanner from "@/components/block/hero-banner";

export default function App() {
  const [allListings, setAllListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/listing`);
      const data = await response.json();
      const activeListings = data.filter(item => item.visibility === "Active");
      setAllListings(activeListings);
      setFilteredListings(activeListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    if (!allListings.length) return;

    const filtered = allListings.filter(car => {
      let matches = true;

      // Basic filters
      if (filters.make) matches = matches && car.make?.toLowerCase() === filters.make.toLowerCase();
      if (filters.model) matches = matches && car.model?.toLowerCase() === filters.model.toLowerCase();
      if (filters.price) matches = matches && Number(car.price) <= filters.price;
      
      // Additional filters
      if (filters.bodyType) matches = matches && car.bodyType?.toLowerCase() === filters.bodyType.toLowerCase();
      if (filters.transmission) matches = matches && car.transmission?.toLowerCase() === filters.transmission.toLowerCase();
      if (filters.steering) matches = matches && car.steering?.toLowerCase() === filters.steering.toLowerCase();
      if (filters.color) matches = matches && car.color?.toLowerCase() === filters.color.toLowerCase();
      
      // Range filters
      if (filters.year?.min) matches = matches && Number(car.year) >= Number(filters.year.min);
      if (filters.year?.max) matches = matches && Number(car.year) <= Number(filters.year.max);
      if (filters.mileage?.min) matches = matches && Number(car.mileage) >= Number(filters.mileage.min);
      if (filters.mileage?.max) matches = matches && Number(car.mileage) <= Number(filters.mileage.max);
      if (filters.engine?.min) matches = matches && Number(car.engineSize) >= Number(filters.engine.min);
      if (filters.engine?.max) matches = matches && Number(car.engineSize) <= Number(filters.engine.max);
      
      return matches;
    });

    setFilteredListings(filtered);
  };

  return (
    <div>
      <HeroBanner />
      <div className="flex flex-col md:flex-row">
        <div className="hidden md:block md:w-1/5 lg:w-1/6 bg-white">
          <div className="sticky top-0">
            <LeftSidebar />
          </div>
        </div>

        <div className="w-full md:w-3/5 lg:w-4/6">
          <div id='search-fliter' className="lisitng-box mt-4 px-3 md:px-8">
            <FilterCars onFilterChange={handleFilterChange} />
          </div>

          <div className='mt-3 md:mt-12 px-3 md:px-8 mb-4'>
            <Listing listings={filteredListings} loading={loading} itemsPerPage={16} />
          </div>
        </div>

        <div className="hidden md:block md:w-1/5 lg:w-1/6 bg-white">
          <div className="sticky top-0">
            <RightSidebar />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mt-10 px-5 md:px-20 bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white py-10 gap-8 md:gap-0">
        <a href="/customers" className="group cursor-pointer">
          <div className="flex justify-center items-center gap-5">
            <img 
              src="/customer.png" 
              alt="Happy Customers" 
              className="w-24 h-24 md:w-32 md:h-32 transition-transform duration-300 group-hover:scale-110" 
            />
            <div className="transition-colors duration-300 group-hover:text-blue-400">
              <h1 className="text-3xl md:text-4xl font-bold">200k+</h1>
              <h2 className="text-base md:text-lg">Happy Customers</h2>
            </div>
          </div>
        </a>

        <a href="/experience" className="group cursor-pointer">
          <div className="flex justify-center items-center gap-5">
            <img 
              src="/mechanic.png" 
              alt="Years of Experience" 
              className="w-24 h-24 md:w-32 md:h-32 transition-transform duration-300 group-hover:scale-110" 
            />
            <div className="transition-colors duration-300 group-hover:text-blue-400">
              <h1 className="text-3xl md:text-4xl font-bold">10+</h1>
              <h2 className="text-base md:text-lg">Years of Experience</h2>
            </div>
          </div>
        </a>

        <a href="/support" className="group cursor-pointer">
          <div className="flex justify-center items-center gap-5">
            <img 
              src="/support.png" 
              alt="Customer Support" 
              className="w-24 h-24 md:w-32 md:h-32 transition-transform duration-300 group-hover:scale-110" 
            />
            <div className="transition-colors duration-300 group-hover:text-blue-400">
              <h1 className="text-3xl md:text-4xl font-bold">24/7</h1>
              <h2 className="text-base md:text-lg">Customer Support</h2>
            </div>
          </div>
        </a>
      </div>
      <div className='mt-3 md:mt-12 px-3 md:px-20 mb-4'>
        <SingleBox />
      </div>

      <div className='mt-3 md:mt-12 px-3 md:px-20 mb-4'>
        <PurchaseFlow />
      </div>

      <div className='mt-3 md:mt-12 px-3 md:px-20 mb-4'>
        <FAQ />
      </div>
      
      <div className='mt-3 md:mt-12 px-3 md:px-20 mb-4'>
        <BlogPost />
      </div>
    </div>
  );
}
