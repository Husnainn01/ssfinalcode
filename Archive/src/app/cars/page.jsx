"use client"
import React, { useState, useEffect } from 'react';
import { FaCar, FaGasPump } from 'react-icons/fa';
import { TbSteeringWheel } from 'react-icons/tb';
import { Image, Skeleton } from "@nextui-org/react";
import Link from 'next/link';
import SidebarComponent from "@/components/template/leftsidebar";
import PaginationComponent from "@/components/block/pagination";
import FilterCars from "@/components/block/filterCars";
import InquiryPopup from "@/components/block/inquiryPopup";
import CountryFlags from "@/components/block/CountryFlags";
import { useRouter, useSearchParams } from 'next/navigation';
import PriceCalculator from "@/components/block/PriceCalculator";
import CurrentSearch from "@/components/block/CurrentSearch";

function Listing() {
    const [listing, setListing] = useState([]);
    const [loading, setLoading] = useState(true);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        fetchListings();
    }, [searchParams]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const queryString = searchParams.toString();
            const response = await fetch(`${baseUrl}/api/listing${queryString ? `?${queryString}` : ''}`);
            let data = await response.json();
            data = data.filter(listing => listing.visibility === "Active");
            data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setListing(data);
        } catch (error) {
            console.error("Error fetching listings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filters) => {
        // Convert filters to query parameters
        const queryParams = new URLSearchParams();
        
        if (filters.make) queryParams.set('make', filters.make);
        if (filters.model) queryParams.set('model', filters.model);
        if (filters.price) queryParams.set('price', filters.price);
        if (filters.bodyType) queryParams.set('type', filters.bodyType);
        if (filters.steering) queryParams.set('steering', filters.steering);
        if (filters.yearFrom) queryParams.set('yearFrom', filters.yearFrom);
        if (filters.yearTo) queryParams.set('yearTo', filters.yearTo);
        
        // Update the URL with new filters
        router.push(`/cars?${queryParams.toString()}`);
    };

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = listing.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(listing.length / itemsPerPage);

    const renderSkeleton = () => (
        <div className="listingCard p-4 mb-4 rounded-lg flex flex-col gap-1 listing-card shadow-md bg-white ">
            <Skeleton className="h-[180px] w-[100%] rounded-xl mb-2" />
            <Skeleton className="h-5 w-[100%] mb-1" />
            <Skeleton className="h-5 w-[60%] mb-1" />
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row bg-[#E2F1E7] min-h-screen pt-0">
            {/* Left Sidebar */}
            <div className="hidden md:block md:w-1/5 lg:w-1/6 bg-white">
                <div className="sticky top-0">
                    <SidebarComponent />
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full md:w-3/5 lg:w-4/6">
                <FilterCars 
                    onFilterChange={handleFilterChange} 
                    useUrlNavigation={true}
                />

                {/* Add PriceCalculator and CurrentSearch side by side */}
                <div className="flex gap-4 flex-wrap justify-center">
                    <PriceCalculator />
                    <CurrentSearch />
                </div>

                {/* CountryFlags */}
                <div className="bg-secondary-hover mb-6 p-4">
                    <CountryFlags />
                </div>
                
                {/* Car Listings Grid */}
                <div className="space-y-3 px-4">
                    {currentItems.map(item => (
                        <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex h-[160px]">
                                {/* Image Section */}
                                <div className="relative w-[240px]">
                                    <Link href={`/cars/${item._id}`}>
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </Link>
                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                        {item.stockNumber && (
                                            <span className="bg-gray-800 text-white px-2 py-0.5 text-[10px] rounded">
                                                Stock #{item.stockNumber}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Link href={`/cars/${item._id}`}>
                                                <h2 className="text-base font-semibold text-gray-800 hover:text-theme-secondary">
                                                    {item.make} {item.model}
                                                </h2>
                                            </Link>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-orange-600">
                                                ${item.price?.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {item.priceType || 'FOB'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Car Details Grid */}
                                    <div className="grid grid-cols-3 gap-x-4 gap-y-2 mt-4">
                                        <div className="flex items-center text-xs text-gray-600">
                                            <span className="font-semibold mr-2">Make:</span>
                                            {item.make}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-600">
                                            <span className="font-semibold mr-2">Model:</span>
                                            {item.model}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-600">
                                            <span className="font-semibold mr-2">Year:</span>
                                            {item.year}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-600">
                                            <FaCar className="mr-2 h-3 w-3" />
                                            {item.bodyType}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-600">
                                            <TbSteeringWheel className="mr-2 h-3 w-3" />
                                            {item.vehicleTransmission}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-600">
                                            <FaGasPump className="mr-2 h-3 w-3" />
                                            {item.fuelType}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-2 mt-4">
                                        <InquiryPopup 
                                            carDetails={item} 
                                            className="bg-[#14225D] hover:bg-[#0F1A4A] text-white text-xs rounded-md 
                                                flex items-center gap-2 px-4 py-1.5 transition-all duration-200 
                                                shadow-sm hover:shadow-md active:shadow-inner
                                                border border-[#14225D]/10"
                                        >
                                            <div className="flex items-center gap-2">
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    className="h-3.5 w-3.5" 
                                                    viewBox="0 0 24 24" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    strokeWidth="2" 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M21 5h-18v14h18v-14z" />
                                                    <path d="M3 5l9 7 9-7" />
                                                </svg>
                                                <span className="font-medium tracking-wide">Send Inquiry</span>
                                            </div>
                                        </InquiryPopup>
                                        <Link href={`/cars/${item._id}`}>
                                            <button className="bg-theme-secondary hover:bg-theme-secondary-hover text-white px-4 py-1.5 rounded text-xs transition-colors duration-200">
                                                View Details
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!loading && listing.length > 0 && (
                    <PaginationComponent 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* Right space for symmetry */}
            <div className="hidden md:block md:w-1/5 lg:w-1/6">
            </div>
        </div>
    );
}
export default Listing;

