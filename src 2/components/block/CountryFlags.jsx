import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const countries = [
  { name: 'All', flag: '🌎', slug: 'all' },
  { name: 'USA', flag: '🇺🇸', slug: 'usa' },
  { name: 'UK', flag: '🇬🇧', slug: 'uk' },
  { name: 'Canada', flag: '🇨🇦', slug: 'canada' },
  { name: 'Japan', flag: '🇯🇵', slug: 'japan' },
  { name: 'Singapore', flag: '🇸🇬', slug: 'singapore' },
  { name: 'Thailand', flag: '🇹🇭', slug: 'thailand' },
];

const popularCountries = [
  { name: 'Guyana', slug: 'guyana' },
  { name: 'Trinidad', slug: 'trinidad' },
  { name: 'Jamaica', slug: 'jamaica' },
];

function CountryFlags() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCountry = searchParams.get('country') || 'all';

  const handleCountryClick = (countrySlug) => {
    if (countrySlug === 'all') {
      // If "All" is selected, remove the country filter
      router.push('/cars');
    } else {
      // Apply the country filter
      router.push(`/cars?country=${countrySlug}`);
    }
  };

  const handleViewMore = () => {
    // You can implement the view more functionality here
    // For example, scroll to the countries section in the sidebar
    const sidebar = document.querySelector('#countries-section');
    if (sidebar) {
      sidebar.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
        Select Region
      </h3>
      
      <div className="flex flex-wrap justify-center gap-2 items-center">
        {countries.map((country) => (
          <button
            key={country.name}
            onClick={() => handleCountryClick(country.slug)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md
              transition-all duration-200 hover:bg-gray-50
              ${currentCountry === country.slug 
                ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                : 'border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
          >
            <span className="text-lg">{country.flag}</span>
            <span className="text-xs font-medium">{country.name}</span>
          </button>
        ))}
        
        <button
          onClick={handleViewMore}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md
            border border-gray-200 text-gray-600
            transition-all duration-200 hover:bg-gray-50 hover:border-gray-300"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
          <span className="text-xs font-medium">More Regions</span>
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 w-full flex justify-center">
        <div className="flex items-center gap-2 justify-center">
          <span className="text-xs text-gray-500">Popular:</span>
          <div className="flex gap-1">
            {popularCountries.map((region) => (
              <button
                key={region.name}
                onClick={() => handleCountryClick(region.slug)}
                className={`text-xs transition-colors px-2
                  ${currentCountry === region.slug
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-blue-600'
                  }`}
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CountryFlags; 