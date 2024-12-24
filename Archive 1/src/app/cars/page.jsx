"use client"
import React, { useState, useEffect } from 'react';
import { FaCar, FaGasPump } from 'react-icons/fa';
import { TbSteeringWheel } from 'react-icons/tb';
import { Image, Skeleton, Button } from "@nextui-org/react";
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
        const searchQuery = searchParams.get('search');
        if (searchQuery) {
            // If there's a search query, fetch search results
            fetchSearchResults(searchQuery);
        } else {
            // If no search query, fetch all listings
            fetchListings();
        }
    }, [searchParams]);

    const fetchSearchResults = async (query) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/cars/search?q=${encodeURIComponent(query)}&type=keyword`);
            const data = await response.json();
            
            if (data.cars && Array.isArray(data.cars)) {
                // Filter active listings and sort by date
                const filteredData = data.cars.filter(car => car.visibility === "Active");
                filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
                setListing(filteredData);
            } else {
                setListing([]);
            }
        } catch (error) {
            console.error("Error fetching search results:", error);
            setListing([]);
        } finally {
            setLoading(false);
        }
    };

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
                
                {/* Show search results count if searching */}
                {searchParams.get('search') && (
                    <div className="px-4 py-2 mb-4 bg-white rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">
                            Found {listing.length} results for "{searchParams.get('search')}"
                        </p>
                    </div>
                )}

                {/* Car Listings Grid */}
                <div className="space-y-3 px-4">
                    {currentItems.map(item => (
                        <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            {/* Main Container - Increased height */}
                            <div className="flex h-[230px]">
                                {/* Left Image Section */}
                                <div className="relative w-[220px] p-2">
                                    <Link href={`/cars/${item._id}`}>
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </Link>
                                    <button className="absolute top-4 left-4 bg-white/90 p-1.5 rounded-full hover:bg-white">
                                        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                    <div className="absolute bottom-4 left-4 text-[10px] bg-gray-900/80 text-white px-2 py-0.5 rounded">
                                        Stock No. {item.stockNumber}
                                    </div>
                                </div>

                                {/* Right Content Section */}
                                <div className="flex-1 p-3 flex flex-col">
                                    {/* Upper Content Section - Reduced spacing */}
                                    <div className="space-y-1.5">
                                        {/* Title and Price Row */}
                                        <div className="flex justify-between items-start border-b border-gray-100 pb-1.5">
                                            <h2 className="text-blue-600 text-base font-bold hover:text-blue-700">
                                                <Link href={`/cars/${item._id}`}>
                                                    {item.year} {item.make} {item.model}
                                                </Link>
                                            </h2>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-red-600">
                                                    ${item.price?.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    Total Price: ${(item.price * 1.15)?.toLocaleString()}
                                                </div>
                                                <div className="text-[10px] text-gray-500">
                                                    CIF to Belize (Container)
                                                </div>
                                            </div>
                                        </div>

                                        {/* Specs Grid - Reduced margin */}
                                        <div className="grid grid-cols-5 gap-x-3 mt-1.5">
                                            {/* First Row */}
                                            <div className="space-y-1 border-r border-gray-100">
                                                <div className="text-[10px] text-gray-500">Mileage</div>
                                                <div className="text-xs font-medium">{item.mileage?.toLocaleString()} km</div>
                                            </div>
                                            <div className="space-y-1 border-r border-gray-100">
                                                <div className="text-[10px] text-gray-500">Year</div>
                                                <div className="text-xs font-medium">{item.year}</div>
                                            </div>
                                            <div className="space-y-1 border-r border-gray-100">
                                                <div className="text-[10px] text-gray-500">Engine</div>
                                                <div className="text-xs font-medium">{item.engineSize || '650cc'}</div>
                                            </div>
                                            <div className="space-y-1 border-r border-gray-100">
                                                <div className="text-[10px] text-gray-500">Trans.</div>
                                                <div className="text-xs font-medium">{item.vehicleTransmission}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-gray-500">Location</div>
                                                <div className="text-xs font-medium flex items-center gap-1">
                                                    <span className="w-3 h-3 rounded-full bg-red-500" />
                                                    {item.location || 'Nagoya'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details Grid - Reduced gaps */}
                                        <div className="grid grid-cols-4 gap-x-3 gap-y-0.5 text-xs mt-1.5">
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Model code</span>
                                                <span>{item.modelCode || '-'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Steering</span>
                                                <span>{item.steering || 'Right'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Fuel</span>
                                                <span>{item.fuelType || 'Petrol'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Seats</span>
                                                <span>{item.seats || '4'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Engine code</span>
                                                <span>{item.engineCode || '-'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Color</span>
                                                <span>{item.color || 'Black'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Drive</span>
                                                <span>{item.driveType || '2WD'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Doors</span>
                                                <span>{item.doors || '5'}</span>
                                            </div>
                                        </div>

                                        {/* Features - Using carFeature from database */}
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {item.carFeature && item.carFeature.length > 0 ? (
                                                item.carFeature.map((feature, index) => (
                                                    <span 
                                                        key={index} 
                                                        className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                                                    >
                                                        {feature.trim()}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-gray-400">
                                                    No features available
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons - Matched sizes including height */}
                                    <div className="flex justify-end items-center gap-2 mt-1">
                                        <InquiryPopup 
                                            carDetails={item} 
                                            className="bg-[#EB843F] hover:bg-[#d66201] text-white px-8 h-[30px] rounded text-xs font-medium transition-colors duration-200 min-w-[100px] text-center flex items-center justify-center"
                                        >
                                            INQUIRY
                                        </InquiryPopup>
                                        
                                        <Link href={`/cars/${item._id}`}>
                                            <button className="bg-[#EB843F] hover:bg-[#0F1A4A] text-white px-8 h-[30px] rounded text-xs font-medium transition-colors duration-200 min-w-[100px] text-center flex items-center justify-center">
                                                VIEW MORE
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

