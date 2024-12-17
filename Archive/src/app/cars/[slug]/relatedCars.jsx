import React, { useState, useEffect } from 'react';
import { FaCar, FaGasPump, FaTachometerAlt } from 'react-icons/fa';
import { TbSteeringWheel } from 'react-icons/tb';
import { Divider } from "@nextui-org/divider";
import { Skeleton } from "@nextui-org/react";
import Link from 'next/link';

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
                <Link 
                    href={`/cars/${item._id}`} 
                    key={item.id}
                    className="group block"
                >
                    <div className="flex bg-white shadow-md rounded-lg overflow-hidden relative 
                        transform transition-all duration-300 ease-in-out
                        hover:shadow-xl hover:scale-[1.02] hover:bg-secondary-hover
                        cursor-pointer">
                        <div className="w-1/3 overflow-hidden">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transform transition-transform duration-300 
                                group-hover:scale-110"
                            />
                        </div>
                        <div className="w-2/3 p-4 flex flex-col justify-between relative">
                            {/* Subtle highlight effect on hover */}
                            <div className="absolute inset-0 bg-secondary-hover opacity-0 group-hover:opacity-10 
                                transition-opacity duration-300"></div>
                            
                            <div className="relative z-10"> {/* Ensure content stays above highlight */}
                                <h1 className="text-blue-950 text-lg font-semibold truncate 
                                    group-hover:text-secondary-hover transition-colors duration-300">
                                    {item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title}
                                </h1>
                                <p className="text-xl font-semibold text-blue-950 
                                    group-hover:text-secondary-hover transition-colors duration-300">
                                    ${item.price}
                                </p>
                                <Divider className='my-2' />
                                <div className="flex justify-between text-sm">
                                    <p className="flex items-center">
                                        <FaGasPump className="mr-1 text-blue-950 group-hover:text-secondary-hover 
                                            transition-colors duration-300" />
                                        {item.fuelType}
                                    </p>
                                    <p className="flex items-center">
                                        <FaCar className="mr-1 text-blue-950 group-hover:text-secondary-hover 
                                            transition-colors duration-300" />
                                        {item.bodyType}
                                    </p>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <p className="flex items-center">
                                        <FaTachometerAlt className="mr-1 text-blue-950 group-hover:text-secondary-hover 
                                            transition-colors duration-300" />
                                        {item.mileage} {item.mileageUnit}
                                    </p>
                                    <p className="flex items-center">
                                        <TbSteeringWheel className="mr-1 text-blue-950 group-hover:text-secondary-hover 
                                            transition-colors duration-300" />
                                        {item.vehicleTransmission}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default RelatedCars;
