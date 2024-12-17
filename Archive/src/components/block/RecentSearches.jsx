'use client'

import React, { useRef, useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const RecentSearches = ({ recentViews = [], onRemoveView }) => {
    const scrollContainerRef = useRef(null);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(false);
    
    useEffect(() => {
        const checkScroll = () => {
            const container = scrollContainerRef.current;
            if (container) {
                setShowLeftButton(container.scrollLeft > 0);
                setShowRightButton(
                    container.scrollLeft < (container.scrollWidth - container.clientWidth)
                );
            }
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            // Initial check
            checkScroll();
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', checkScroll);
            }
        };
    }, [recentViews]);

    const scroll = (direction) => {
        const container = scrollContainerRef.current;
        if (container) {
            const cardWidth = container.offsetWidth / 6; // Width of 6 cards
            const scrollAmount = cardWidth * 3; // Scroll by 3 cards at a time
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Early return after hooks
    if (!recentViews || recentViews.length === 0) return null;

    return (
        <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-800">
                    Recently Checked ({recentViews.length})
                </h2>
                <button 
                    onClick={() => onRemoveView('all')}
                    className="text-sm text-gray-500 hover:text-blue-950 transition-colors"
                >
                    Clear All
                </button>
            </div>
            <div className="relative">
                {/* Left Scroll Button - Only show when there's content to scroll left */}
                {showLeftButton && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-1.5 shadow-md hover:bg-white transition-all"
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-600" />
                    </button>
                )}

                {/* Right Scroll Button - Only show when there's content to scroll right */}
                {showRightButton && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-1.5 shadow-md hover:bg-white transition-all"
                    >
                        <ChevronRight className="h-6 w-6 text-gray-600" />
                    </button>
                )}

                {/* Left Fade Effect - Only show when there's content to scroll left */}
                {showLeftButton && (
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-[1]" />
                )}

                {/* Right Fade Effect - Only show when there's content to scroll right */}
                {showRightButton && (
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-[1]" />
                )}

                {/* Scrollable Container */}
                <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto scrollbar-hide gap-3 relative scroll-smooth pb-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {recentViews.map((item, index) => (
                        <div 
                            key={index}
                            className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex-none"
                            style={{ width: 'calc(16.666% - 10px)' }}
                        >
                            <button
                                onClick={() => onRemoveView(item._id)}
                                className="absolute top-1 right-1 z-10 bg-white/80 rounded-full p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X size={14} />
                            </button>
                            <Link href={`/cars/${item._id}`}>
                                <div className="p-2">
                                    <div className="relative w-full h-24 mb-2">
                                        <img 
                                            src={item.image} 
                                            alt={`${item.make} ${item.model}`} 
                                            className="w-full h-full object-cover rounded-md"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-medium text-gray-800 truncate">
                                            {item.make} {item.model}
                                        </h3>
                                        <p className="text-sm font-semibold text-blue-950">
                                            ${item.price}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecentSearches;

// Add this CSS to your global styles or component
// .scrollbar-hide::-webkit-scrollbar {
//     display: none;
// } 