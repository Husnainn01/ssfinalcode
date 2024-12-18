import React, { useState, useEffect } from 'react';
import { FaCar, FaGasPump, FaTachometerAlt, FaFire, FaClock, FaArrowRight } from 'react-icons/fa';
import { TbSteeringWheel } from 'react-icons/tb';
import { Divider } from "@nextui-org/divider";
import { Skeleton } from "@nextui-org/react"; 
import Link from 'next/link';
import RecentSearches from './RecentSearches';
import { FavoriteButton } from '@/components/ui/FavoriteButton';

function Listing() {
    const [listing, setListing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [recentViews, setRecentViews] = useState([]);
    const [popularCars, setPopularCars] = useState([]);
    const [totalPopularCars, setTotalPopularCars] = useState(0);
    const [loadingPopular, setLoadingPopular] = useState(true);
    const itemsPerPage = 16;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

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
                setPopularCars(japanesePopularCars.slice(0, 10)); // Show first 10 cars
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

                // Log the total number of items to debug
                console.log('Total items:', data.length);
                
                setTotalItems(data.length);
                // Only show first 10 items in the listing
                setListing(data.slice(0, 10));
            } catch (error) {
                console.error("Error fetching listing:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, []);

    // Log when totalItems changes
    useEffect(() => {
        console.log('Updated totalItems:', totalItems);
    }, [totalItems]);

    const renderSkeleton = () => (
        <div className="relative shadow-sm rounded-lg overflow-hidden p-2">
            <Skeleton className="w-full h-28 mb-2 rounded-md" />
            <Skeleton className="h-3 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2 mb-1" />
            <Skeleton className="h-3 w-full mb-1" />
        </div>
    );

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="flex flex-col">
            <RecentSearches 
                recentViews={recentViews}
                onRemoveView={handleRemoveView}
            />
            
            <div className="p-2">
                <div className="flex items-center justify-between mb-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {loading ? (
                        <>
                            {Array(10).fill(null).map((_, index) => (
                                <div key={index}>{renderSkeleton()}</div>
                            ))}
                        </>
                    ) : (
                        listing.slice(0, 10).map((item) => (
                            <div key={item._id} className="relative bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                                <div className="relative z-10 p-2">
                                    <div className="absolute top-3 right-3 z-10">
                                        <FavoriteButton carId={item._id} />
                                    </div>
                                    
                                    <Link 
                                        href={`/cars/${item._id.toString()}`}
                                        onClick={() => handleItemClick(item)}
                                        className="block"
                                    >
                                        <div 
                                            onClick={() => console.log('Div clicked')}
                                            className="overflow-hidden rounded-md mb-1.5 relative"
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-28 object-cover transition-transform duration-300 ease-in-out transform hover:scale-105"
                                            />
                                            {item.itemCondition === "Used" && (
                                                <p className='absolute top-1 left-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-xs font-medium'>
                                                    {item.itemCondition}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <h1 className="text-sm font-medium text-gray-800">
                                                    {item.make} {item.model}
                                                </h1>
                                                <p className='text-sm font-semibold text-blue-950'>${item.price}</p>
                                            </div>
                                            <Divider className='my-1'/>
                                            <div className='grid grid-cols-2 gap-1 text-xs text-gray-600'>
                                                <p className="flex items-center">
                                                    <FaCar className="mr-1 h-3 w-3 text-blue-950" />
                                                    {item.make}
                                                </p>
                                                <p className="flex items-center">
                                                    <FaTachometerAlt className="mr-1 h-3 w-3 text-blue-950" />
                                                    {item.model}
                                                </p>
                                                <p className="flex items-center">
                                                    <FaGasPump className="mr-1 h-3 w-3 text-blue-950" />
                                                    {item.bodyType}
                                                </p>
                                                <p className="flex items-center">
                                                    <TbSteeringWheel className="mr-1 h-3 w-3 text-blue-950" />
                                                    {item.vehicleTransmission}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Mobile View More Button */}
                {totalItems > 10 && (
                    <div className="mt-6 text-center md:hidden">
                        <Link 
                            href="/cars"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900 transition-colors"
                        >
                            View All Cars
                            <FaArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                )}
            </div>

            {/* Popular Cars in Japan Section */}
            <div className="mt-12 p-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FaFire className="text-red-500 h-5 w-5" />
                        <h2 className="text-xl font-semibold text-gray-800">Popular Cars in Japan</h2>
                    </div>
                    {totalPopularCars > 10 && (
                        <Link 
                            href="/popular-japanese-cars" 
                            className="flex items-center gap-2 text-sm text-blue-950 hover:text-blue-800 transition-colors"
                        >
                            View More 
                            <FaArrowRight className="h-3 w-3" />
                        </Link>
                    )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {loadingPopular ? (
                        <>
                            {Array(10).fill(null).map((_, index) => (
                                <div key={index}>{renderSkeleton()}</div>
                            ))}
                        </>
                    ) : (
                        popularCars.map((item) => (
                            <div key={item._id} className="relative bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                                <div className="relative z-10 p-2">
                                    <div className="absolute top-3 right-3 z-10">
                                        <FavoriteButton carId={item._id} />
                                    </div>
                                    
                                    <Link 
                                        href={`/cars/${item._id.toString()}`}
                                        onClick={() => handleItemClick(item)}
                                        className="block"
                                    >
                                        <div 
                                            onClick={() => console.log('Div clicked')}
                                            className="overflow-hidden rounded-md mb-1.5 relative"
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-28 object-cover transition-transform duration-300 ease-in-out transform hover:scale-105"
                                            />
                                            {item.itemCondition === "Used" && (
                                                <p className='absolute top-1 left-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-xs font-medium'>
                                                    {item.itemCondition}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <h1 className="text-sm font-medium text-gray-800">
                                                    {item.make} {item.model}
                                                </h1>
                                                <p className='text-sm font-semibold text-blue-950'>${item.price}</p>
                                            </div>
                                            <Divider className='my-1'/>
                                            <div className='grid grid-cols-2 gap-1 text-xs text-gray-600'>
                                                <p className="flex items-center">
                                                    <FaCar className="mr-1 h-3 w-3 text-blue-950" />
                                                    {item.make}
                                                </p>
                                                <p className="flex items-center">
                                                    <FaTachometerAlt className="mr-1 h-3 w-3 text-blue-950" />
                                                    {item.model}
                                                </p>
                                                <p className="flex items-center">
                                                    <FaGasPump className="mr-1 h-3 w-3 text-blue-950" />
                                                    {item.bodyType}
                                                </p>
                                                <p className="flex items-center">
                                                    <TbSteeringWheel className="mr-1 h-3 w-3 text-blue-950" />
                                                    {item.vehicleTransmission}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Mobile View More Button */}
                {totalPopularCars > 10 && (
                    <div className="mt-6 text-center md:hidden">
                        <Link 
                            href="/popular-japanese-cars"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900 transition-colors"
                        >
                            View All Popular Cars
                            <FaArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                )}
            </div>

            <Link href="/test" className="p-4">
                Test Link
            </Link>
        </div>
    );
}

export default Listing;
