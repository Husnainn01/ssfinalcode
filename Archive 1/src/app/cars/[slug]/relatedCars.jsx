import React, { useState, useEffect } from 'react';
import { FaCar, FaGasPump, FaTachometerAlt } from 'react-icons/fa';
import { TbSteeringWheel } from 'react-icons/tb';
import { Divider } from "@nextui-org/divider";
import { Skeleton } from "@nextui-org/react";
import Link from 'next/link';
import InquiryPopup from "@/components/block/inquiryPopup";
import { FavoriteButton } from '@/components/ui/FavoriteButton';


function RelatedCars() {
    const [listing, setListing] = useState([]);
    const [loading, setLoading] = useState(true);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await fetch(`${baseUrl}/api/listing`);
                let data = await response.json();
                data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setListing(data);
            } catch (error) {
                console.error("Error fetching listing:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, []);

    const limitedListing = listing.slice(0, 6);

    const renderSkeleton = () => (
        <div className="flex bg-white shadow-md rounded-lg overflow-hidden relative">
            <div className="w-1/3">
                <Skeleton className="h-32 w-full object-cover" />
            </div>
            <div className="w-2/3 p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Divider className="my-2" />
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                    <React.Fragment key={index}>
                        {renderSkeleton()}
                    </React.Fragment>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {limitedListing.map((item) => (
                <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    {/* Main Container */}
                    <div className="flex h-[180px] relative">
                        {/* Sold Badge */}
                        {item.offerType === "Sold" && (
                            <div className="absolute -left-8 top-4 bg-red-500 text-white px-10 py-1 transform -rotate-45 z-10 shadow-md">
                                <span className="text-sm font-semibold">SOLD</span>
                            </div>
                        )}
                        
                        {/* Left Image Section */}
                        <div className="relative w-[180px] p-2">
                            <Link href={`/cars/${item._id}`}>
                                <img
                                    src={item.images?.[0] || item.image}
                                    alt={item.title}
                                    className={`w-full h-full object-cover rounded-lg ${
                                        item.offerType === "Sold" ? "opacity-80" : ""
                                    }`}
                                />
                            </Link>
                            <div className="absolute top-4 right-4 bg-black/50 rounded">
                                <FavoriteButton carId={item._id} />
                            </div>
                            <div className="absolute bottom-4 left-4 text-[10px] bg-gray-900/80 text-white px-2 py-0.5 rounded">
                                Ref No. {item.stockNumber}
                            </div>
                        </div>

                        {/* Right Content Section */}
                        <div className="flex-1 p-3 flex flex-col">
                            {/* Title and Price Row */}
                            <div className="flex justify-between items-start border-b border-gray-100 pb-2">
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

                            {/* Specs Grid */}
                            <div className="grid grid-cols-5 gap-x-3 mt-2">
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
                                        <span className="w-2 h-2 rounded-full bg-red-500" />
                                        {item.location || 'Nagoya'}
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
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

                            {/* Action Buttons */}
                            <div className="flex justify-end items-center gap-2 mt-1">
                                <InquiryPopup 
                                    carDetails={item} 
                                    className="bg-[#EB843F] hover:bg-[#d66201] text-white px-8 h-[30px] rounded text-xs font-medium transition-colors duration-200 min-w-[100px] text-center flex items-center justify-center"
                                >
                                    INQUIRY
                                </InquiryPopup>
                                
                                <Link href={`/cars/${item._id}`}>
                                    <button className="bg-[#EB843F] hover:bg-[#d66201] text-white px-8 h-[30px] rounded text-xs font-medium transition-colors duration-200 min-w-[100px] text-center flex items-center justify-center">
                                        VIEW MORE
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default RelatedCars;
