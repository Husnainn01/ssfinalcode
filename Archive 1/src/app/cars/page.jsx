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
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { MdModeEdit, MdOutlineDelete } from 'react-icons/md';
import { 
    AU, US, NZ, IE, KE, UG, ZM, MW, GN, PG, CD, 
    PK, ZA, TH, GE, GB, RW, FJ, LK, RU, MN, PH, JP 
} from 'country-flag-icons/react/3x2'

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
        const countryFilter = searchParams.get('country');
        const makeFilter = searchParams.get('make');
        const typeFilter = searchParams.get('type');
        const otherCategoryFilter = searchParams.get('othercategory');

        if (searchQuery) {
            fetchSearchResults(searchQuery);
        } else {
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

    const fetchCountryResults = async (country) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/listing?country=${encodeURIComponent(country)}`);
            const data = await response.json();
            
            if (Array.isArray(data)) {
                // Filter active listings and sort by date
                const filteredData = data.filter(car => car.visibility === "Active");
                filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setListing(filteredData);
            } else {
                setListing([]);
            }
            
            console.log(`Found ${data.length} cars for country: ${country}`);
        } catch (error) {
            console.error("Error fetching country results:", error);
            setListing([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMakeResults = async (make) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/cars/make/${make}`);
            const data = await response.json();
            
            if (Array.isArray(data)) {
                const filteredData = data.filter(car => car.visibility === "Active");
                filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
                setListing(filteredData);
            } else {
                setListing([]);
            }
        } catch (error) {
            console.error("Error fetching make results:", error);
            setListing([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTypeResults = async (type) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/cars/type/${type}`);
            const data = await response.json();
            
            if (Array.isArray(data)) {
                const filteredData = data.filter(car => car.visibility === "Active");
                filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
                setListing(filteredData);
            } else {
                setListing([]);
            }
        } catch (error) {
            console.error("Error fetching type results:", error);
            setListing([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchOtherCategoryResults = async (category) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/cars/othercategories/${category}`);
            const data = await response.json();
            
            if (Array.isArray(data)) {
                const filteredData = data.filter(car => car.visibility === "Active");
                filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
                setListing(filteredData);
            } else {
                setListing([]);
            }
        } catch (error) {
            console.error("Error fetching other category results:", error);
            setListing([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filters) => {
        // Convert filters to query parameters
        const queryParams = new URLSearchParams(searchParams.toString()); // Keep existing params
        
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

    const CountryFlag = ({ country }) => {
        switch(country?.toLowerCase()) {
            case 'australia':
                return <AU className="w-4 h-4 rounded-sm" />;
            case 'usa':
                return <US className="w-4 h-4 rounded-sm" />;
            case 'new zealand':
                return <NZ className="w-4 h-4 rounded-sm" />;
            case 'ireland':
                return <IE className="w-4 h-4 rounded-sm" />;
            case 'kenya':
                return <KE className="w-4 h-4 rounded-sm" />;
            case 'uganda':
                return <UG className="w-4 h-4 rounded-sm" />;
            case 'zambia':
                return <ZM className="w-4 h-4 rounded-sm" />;
            case 'malawi':
                return <MW className="w-4 h-4 rounded-sm" />;
            case 'guinea':
                return <GN className="w-4 h-4 rounded-sm" />;
            case 'papua new guinea':
                return <PG className="w-4 h-4 rounded-sm" />;
            case 'dr congo':
                return <CD className="w-4 h-4 rounded-sm" />;
            case 'pakistan':
                return <PK className="w-4 h-4 rounded-sm" />;
            case 'south africa':
                return <ZA className="w-4 h-4 rounded-sm" />;
            case 'thailand':
                return <TH className="w-4 h-4 rounded-sm" />;
            case 'georgia':
                return <GE className="w-4 h-4 rounded-sm" />;
            case 'uk':
                return <GB className="w-4 h-4 rounded-sm" />;
            case 'rwanda':
                return <RW className="w-4 h-4 rounded-sm" />;
            case 'fiji':
                return <FJ className="w-4 h-4 rounded-sm" />;
            case 'sri lanka':
                return <LK className="w-4 h-4 rounded-sm" />;
            case 'russia':
                return <RU className="w-4 h-4 rounded-sm" />;
            case 'mongolia':
                return <MN className="w-4 h-4 rounded-sm" />;
            case 'philippines':
                return <PH className="w-4 h-4 rounded-sm" />;
            case 'japan':
                return <JP className="w-4 h-4 rounded-sm" />;
            default:
                return <span className="w-3 h-3 rounded-full bg-red-500" />;
        }
    };

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
                {/* Add filter indicators */}
                {(searchParams.get('country') || searchParams.get('make') || 
                  searchParams.get('type') || searchParams.get('othercategory')) && (
                    <div className="px-4 py-2 mb-4 bg-white rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">
                            {searchParams.get('country') && `Showing cars from ${searchParams.get('country')}`}
                            {searchParams.get('make') && `Showing ${searchParams.get('make')} cars`}
                            {searchParams.get('type') && `Showing ${searchParams.get('type')} vehicles`}
                            {searchParams.get('othercategory') && `Showing ${searchParams.get('othercategory')} vehicles`}
                        </p>
                    </div>
                )}

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
                            {/* Main Container */}
                            <div className="flex h-[230px] relative">
                                {/* Sold Badge */}
                                {item.offerType === "Sold" && (
                                    <div className="absolute -left-8 top-4 bg-red-500 text-white px-10 py-1 transform -rotate-45 z-10 shadow-md">
                                        <span className="text-sm font-semibold">SOLD</span>
                                    </div>
                                )}
                                
                                {/* Left Image Section */}
                                <div className="relative w-[220px] p-2">
                                    <Link href={`/cars/${item._id}`}>
                                        <img
                                            src={item.images?.[0] || item.image}
                                            alt={item.title}
                                            className={`w-full h-full object-cover rounded-lg ${item.offerType === "Sold" ? "opacity-80" : ""}`}
                                        />
                                    </Link>
                                    <div className="absolute top-4 right-4 bg-black/50 rounded">
                                        <FavoriteButton carId={item._id} />
                                    </div>
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
                                                    {item.make} {item.model} {item.year}
                                                </Link>
                                            </h2>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-red-600">
                                                    ${item.price?.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    Total Price: ${(item.price)?.toLocaleString()}
                                                </div>
                                                <div className="text-[10px] text-gray-500">
                                                    C&F TO PORT (ASK)
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
                                                <div className="text-xs font-medium">{item.vehicleEngine || '650cc'}</div>
                                            </div>
                                            <div className="space-y-1 border-r border-gray-100">
                                                <div className="text-[10px] text-gray-500">Trans.</div>
                                                <div className="text-xs font-medium">{item.vehicleTransmission}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-gray-500">Location</div>
                                                <div className="text-xs font-medium flex items-center gap-2">
                                                    <CountryFlag country={item.country} />
                                                    <span className="capitalize">{item.country || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details Grid - Using actual database field names */}
                                        <div className="grid grid-cols-4 gap-x-3 gap-y-0.5 text-xs mt-1.5">
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">VIN</span>
                                                <span>{item.vin || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Drive</span>
                                                <span>{item.driveWheelConfiguration || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Fuel</span>
                                                <span>{item.fuelType || 'N/A'}</span>
                                            </div>
                                            {/* <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Seats</span>
                                                <span>{item.vehicleSeatingCapacity || 'N/A'}</span>
                                            </div> */}
                                            {/* <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Engine</span>
                                                <span>{item.vehicleEngine || 'N/A'}</span>
                                            </div> */}
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Color</span>
                                                <span>{item.color || 'N/A'}</span>
                                            </div>
                                            {/* <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Transmission</span>
                                                <span>{item.vehicleTransmission || 'N/A'}</span>
                                            </div> */}
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Doors</span>
                                                <span>{item.numberOfDoors || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Body Type</span>
                                                <span>{item.bodyType || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Cylinders</span>
                                                <span>{item.cylinders || 'N/A'}</span>
                                            </div>
                                            {/* <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Mileage</span>
                                                <span>{item.mileage ? `${item.mileage} ${item.mileageUnit}` : 'N/A'}</span>
                                            </div> */}
                                            <div className="flex justify-between border-b border-gray-100 pb-0.5">
                                                <span className="text-gray-500">Condition</span>
                                                <span>{item.itemCondition || 'N/A'}</span>
                                            </div>
                                        </div>

                                        {/* Features - Using carFeature from database */}
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {item.carFeature && item.carFeature.length > 0 ? (
                                                <>
                                                    {/* Display first 9 features */}
                                                    {item.carFeature.slice(0, 9).map((feature, index) => (
                                                        <span 
                                                            key={index} 
                                                            className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                                                        >
                                                            {feature.trim()}
                                                        </span>
                                                    ))}
                                                    
                                                    {/* Show "Show More" button if there are more than 9 features */}
                                                    {item.carFeature.length > 9 && (
                                                        <Link 
                                                            href={`/cars/${item.slug}`}
                                                            className="text-[10px] bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded hover:bg-primary-200 transition-colors cursor-pointer flex items-center gap-0.5"
                                                        >
                                                            +{item.carFeature.length - 9} more
                                                            <svg 
                                                                xmlns="http://www.w3.org/2000/svg" 
                                                                viewBox="0 0 20 20" 
                                                                fill="currentColor" 
                                                                className="w-3 h-3"
                                                            >
                                                                <path 
                                                                    fillRule="evenodd" 
                                                                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" 
                                                                    clipRule="evenodd" 
                                                                />
                                                            </svg>
                                                        </Link>
                                                    )}
                                                </>
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

                            {/* In your car listing card */}
                            <div className="flex gap-2 absolute bottom-4 right-2 z-50">
                                <Link
                                    href={`/admin/cars/edit/${item._id}`}  // Updated path
                                    className="w-min h-min p-2 rounded-lg bg-primary-50 cursor-pointer text-lg text-black shadow-inner"
                                >
                                    <MdModeEdit />
                                </Link>
                                <i
                                    onClick={() => handleDeleteClick(item._id)}
                                    className="w-min h-min p-2 rounded-lg bg-red-50 cursor-pointer text-lg text-black shadow-inner"
                                >
                                    <MdOutlineDelete />
                                </i>
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

