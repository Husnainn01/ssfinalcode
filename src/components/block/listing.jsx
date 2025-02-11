import React, { useState, useEffect } from 'react';
import { FaCar, FaGasPump, FaTachometerAlt, FaFire, FaClock, FaArrowRight, FaIndustry, FaCarSide, FaCalendarAlt, FaRoad } from 'react-icons/fa';
import { TbSteeringWheel } from 'react-icons/tb';
import { Divider } from "@nextui-org/divider";
import { Skeleton } from "@nextui-org/react"; 
import Link from 'next/link';
import RecentSearches from './RecentSearches';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { motion, AnimatePresence } from 'framer-motion';

function Listing() {
    const [listing, setListing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [recentViews, setRecentViews] = useState([]);
    const [popularCars, setPopularCars] = useState([]);
    const [totalPopularCars, setTotalPopularCars] = useState(0);
    const [loadingPopular, setLoadingPopular] = useState(true);
    const [recentPage, setRecentPage] = useState(1);
    const [popularPage, setPopularPage] = useState(1);
    const carsPerPage = 10;
    const carsPerRow = 5;
    const rowsToShow = 2;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const [allListings, setAllListings] = useState([]);
    const [allPopularCars, setAllPopularCars] = useState([]);

    useEffect(() => {
        // Load recent views from localStorage on component mount
        const savedViews = localStorage.getItem('recentViews');
        if (savedViews) {
            setRecentViews(JSON.parse(savedViews));
        }
    }, []);

    useEffect(() => {
        const fetchPopularCars = async () => {
            try {
                const response = await fetch(`${baseUrl}/api/listing`);
                let data = await response.json();
                
                // Filter for Japanese makes
                const japanesePopularCars = data.filter(car => 
                    ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Lexus']
                    .includes(car.make) && car.visibility === "Active"
                );

                setTotalPopularCars(japanesePopularCars.length);
                setAllPopularCars(japanesePopularCars);
                setPopularCars(japanesePopularCars.slice(0, 10));
            } catch (error) {
                console.error("Error fetching popular cars:", error);
            } finally {
                setLoadingPopular(false);
            }
        };

        fetchPopularCars();
    }, []);

    const handleItemClick = (item) => {
        // Add the viewed item to recent views
        const updatedViews = [
            item,
            ...recentViews.filter(view => view._id !== item._id)
        ];
        
        setRecentViews(updatedViews);
        localStorage.setItem('recentViews', JSON.stringify(updatedViews));
    };

    const handleRemoveView = (itemId) => {
        if (itemId === 'all') {
            setRecentViews([]);
            localStorage.removeItem('recentViews');
        } else {
            const updatedViews = recentViews.filter(view => view._id !== itemId);
            setRecentViews(updatedViews);
            localStorage.setItem('recentViews', JSON.stringify(updatedViews));
        }
    };

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await fetch(`${baseUrl}/api/listing`);
                let data = await response.json();

                // Filter active listings and sort by date
                data = data.filter(listing => listing.visibility === "Active")
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
                
                setTotalItems(data.length);
                setAllListings(data);
                // Show first 10 items in the listing
                setListing(data.slice(0, 10));
            } catch (error) {
                console.error("Error fetching listing:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, []);

    // Pagination handlers
    const handleRecentPageChange = (newPage) => {
        setRecentPage(newPage);
        const startIndex = (newPage - 1) * carsPerPage;
        setListing(allListings.slice(startIndex, startIndex + carsPerPage));
    };

    const handlePopularPageChange = (newPage) => {
        setPopularPage(newPage);
        const startIndex = (newPage - 1) * carsPerPage;
        setPopularCars(allPopularCars.slice(startIndex, startIndex + carsPerPage));
    };

    // Pagination component
    const Pagination = ({ currentPage, totalItems, onPageChange }) => {
        const totalPages = Math.ceil(totalItems / carsPerPage);
        
        const handlePrevPage = () => {
            if (currentPage > 1) {
                onPageChange(currentPage - 1);
            }
        };

        const handleNextPage = () => {
            if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
            }
        };

        return (
            <div className="flex justify-center items-center gap-2 mt-8">
                {/* Previous Button */}
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                        ${currentPage === 1 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-blue-950 hover:bg-blue-950 hover:text-white'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <motion.button
                            key={page}
                            onClick={() => onPageChange(page)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                                ${currentPage === page
                                    ? 'bg-blue-950 text-white shadow-md scale-110'
                                    : 'bg-white hover:bg-gray-50 text-gray-700 hover:text-blue-950'}`}
                        >
                            {page}
                        </motion.button>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                        ${currentPage === totalPages 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-blue-950 hover:bg-blue-950 hover:text-white'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        );
    };

    const renderSkeleton = () => (
        <div className="relative shadow-sm rounded-lg overflow-hidden p-2">
            <Skeleton className="w-full h-28 mb-2 rounded-md" />
            <Skeleton className="h-3 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2 mb-1" />
            <Skeleton className="h-3 w-full mb-1" />
        </div>
    );

    return (
        <div className="flex flex-col bg-[#E2F1E7] min-h-screen pb-8">
            <div className="max-w-7xl mx-auto w-full">
                <RecentSearches 
                    recentViews={recentViews}
                    onRemoveView={handleRemoveView}
                />
                
                <div className="p-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <FaClock className="text-blue-950 h-5 w-5" />
                            <h2 className="text-xl font-semibold text-gray-800">Recently Added</h2>
                        </div>
                        {listing.length > 0 && (
                            <Link 
                                href="/cars" 
                                className="flex items-center gap-2 text-sm text-blue-950 hover:text-blue-800 transition-colors"
                            >
                                View More 
                                <FaArrowRight className="h-3 w-3" />
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <>
                                    {Array(10).fill(null).map((_, index) => (
                                        <motion.div 
                                            key={`skeleton-${index}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            {renderSkeleton()}
                                        </motion.div>
                                    ))}
                                </>
                            ) : (
                                listing.map((item, index) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <Link 
                                            href={`/cars/${item._id}`}
                                            className="group"
                                        >
                                            <div className="bg-white rounded-xl overflow-hidden shadow-sm 
                                                hover:shadow-xl transition-all duration-300">
                                                {/* Image Container with Stock Number and Favorite Button */}
                                                <div className="relative">
                                                    <img
                                                        src={item.images?.[0] || item.image || '/placeholder-car.png'}
                                                        alt={`${item.make} ${item.model}`}
                                                        className="w-full h-28 object-cover"
                                                        onError={(e) => {
                                                            console.error('Image load error:', item.image);
                                                            e.target.onerror = null; // Prevent infinite loop
                                                            e.target.src = '/placeholder-car.png';
                                                        }}
                                                    />
                                                    <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 
                                                        rounded text-xs text-white backdrop-blur-sm font-medium">
                                                        Stock: #{item.stockNumber}
                                                    </div>
                                                    {/* Add Favorite Button */}
                                                    <div className="absolute top-2 left-2 bg-black/90 rounded">
                                                        <FavoriteButton carId={item._id} />
                                                    </div>
                                                    {/* Add SOLD badge */}
                                                    {item.offerType === "Sold" && (
                                                        <div className="absolute bottom-2 left-2 bg-red-600/90 text-white px-2 py-0.5 rounded-sm">
                                                            <span className="text-[10px] font-bold tracking-wide">SOLD</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content Section */}
                                                <div className="p-3 space-y-2">
                                                    {/* Title and Price */}
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center">
                                                            <h1 className="text-sm font-medium text-gray-800">
                                                                {item.make} {item.model}
                                                            </h1>
                                                            <p className="text-sm font-bold text-blue-950">
                                                                ${item.price}
                                                            </p>
                                                        </div>
                                                        {item.itemCondition && (
                                                            <p className="text-xs text-gray-500">
                                                                {item.itemCondition}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Car Details Grid */}
                                                    <div className='grid grid-cols-2 gap-1 text-xs text-gray-600'>
                                                        <p className="flex items-center">
                                                            <FaIndustry className="mr-1 h-3 w-3 text-blue-950" />
                                                            {item.make}
                                                        </p>
                                                        <p className="flex items-center">
                                                            <FaCarSide className="mr-1 h-3 w-3 text-blue-950" />
                                                            {item.model}
                                                        </p>
                                                        <p className="flex items-center">
                                                            <FaCalendarAlt className="mr-1 h-3 w-3 text-blue-950" />
                                                            {item.year}
                                                        </p>
                                                        <p className="flex items-center">
                                                            <FaRoad className="mr-1 h-3 w-3 text-blue-950" />
                                                            {item.mileage}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {totalItems > carsPerPage && (
                        <Pagination 
                            currentPage={recentPage}
                            totalItems={totalItems}
                            onPageChange={handleRecentPageChange}
                        />
                    )}
                </div>

                {/* Popular Cars in Japan Section */}
                <div className="mt-12 p-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <FaFire className="text-red-500 h-5 w-5" />
                            <h2 className="text-xl font-semibold text-gray-800">Popular Cars in Japan</h2>
                        </div>
                        {totalPopularCars > carsPerPage && (
                            <Link 
                                href="/popular-japanese-cars" 
                                className="flex items-center gap-2 text-sm text-blue-950 hover:text-blue-800 transition-colors"
                            >
                                View More 
                                <FaArrowRight className="h-3 w-3" />
                            </Link>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <AnimatePresence mode="wait">
                            {loadingPopular ? (
                                <>
                                    {Array(10).fill(null).map((_, index) => (
                                        <motion.div 
                                            key={`skeleton-${index}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            {renderSkeleton()}
                                        </motion.div>
                                    ))}
                                </>
                            ) : (
                                popularCars.map((item, index) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <Link 
                                            href={`/cars/${item._id}`}
                                            className="group"
                                        >
                                            <div className="bg-white rounded-xl overflow-hidden shadow-sm 
                                                hover:shadow-xl transition-all duration-300">
                                                {/* Image Container with Stock Number and Favorite Button */}
                                                <div className="relative">
                                                    <img
                                                        src={item.images?.[0] || item.image || '/placeholder-car.png'}
                                                        alt={`${item.make} ${item.model}`}
                                                        className="w-full h-28 object-cover"
                                                        onError={(e) => {
                                                            console.error('Image load error:', item.image);
                                                            e.target.onerror = null;
                                                            e.target.src = '/placeholder-car.png';
                                                        }}
                                                    />
                                                    <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 
                                                        rounded text-xs text-white backdrop-blur-sm font-medium">
                                                        Stock: #{item.stockNumber}
                                                    </div>
                                                    {/* Add Favorite Button */}
                                                    <div className="absolute top-2 left-2 bg-black/90 rounded">
                                                        <FavoriteButton carId={item._id} />
                                                    </div>
                                                    {/* Add SOLD badge */}
                                                    {item.offerType === "Sold" && (
                                                        <div className="absolute bottom-2 left-2 bg-red-600/90 text-white px-2 py-0.5 rounded-sm">
                                                            <span className="text-[10px] font-bold tracking-wide">SOLD</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content Section - Kept compact size */}
                                                <div className="p-3 space-y-2">
                                                    {/* Title and Price */}
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center">
                                                            <h1 className="text-sm font-medium text-gray-800">
                                                                {item.make} {item.model}
                                                            </h1>
                                                            <p className="text-sm font-bold text-blue-950">
                                                                ${item.price}
                                                            </p>
                                                        </div>
                                                        {item.itemCondition && (
                                                            <p className="text-xs text-gray-500">
                                                                {item.itemCondition}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Car Details Grid */}
                                                    <div className='grid grid-cols-2 gap-1 text-xs text-gray-600'>
                                                        <p className="flex items-center">
                                                            <FaIndustry className="mr-1 h-3 w-3 text-blue-950" />
                                                            {item.make}
                                                        </p>
                                                        <p className="flex items-center">
                                                            <FaCarSide className="mr-1 h-3 w-3 text-blue-950" />
                                                            {item.model}
                                                        </p>
                                                        <p className="flex items-center">
                                                            <FaCalendarAlt className="mr-1 h-3 w-3 text-blue-950" />
                                                            {item.year}
                                                        </p>
                                                        <p className="flex items-center">
                                                            <FaRoad className="mr-1 h-3 w-3 text-blue-950" />
                                                            {item.mileage}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {totalPopularCars > carsPerPage && (
                        <Pagination 
                            currentPage={popularPage}
                            totalItems={totalPopularCars}
                            onPageChange={handlePopularPageChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Listing;
