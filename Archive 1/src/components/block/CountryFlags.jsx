import React, { useState } from 'react';

const countries = [
  { name: 'All', flag: '🌎' },
  { name: 'USA', flag: '🇺🇸' },
  { name: 'UK', flag: '🇬🇧' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'Thailand', flag: '🇹🇭' },
];

function CountryFlags() {
  const [selectedCountry, setSelectedCountry] = useState('All');

  const handleCountryClick = (countryName) => {
    setSelectedCountry(countryName);
    console.log(`Selected country: ${countryName}`);
  };

  const handleViewMore = () => {
    console.log('View More clicked');
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
            onClick={() => handleCountryClick(country.name)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md
              transition-all duration-200 hover:bg-gray-50
              ${selectedCountry === country.name 
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
            {['Guyana', 'Trinidad', 'Jamaica'].map((region) => (
              <button
                key={region}
                className="text-xs text-gray-600 hover:text-blue-600 transition-colors px-2"
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CountryFlags; 