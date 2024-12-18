import React from 'react';

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
  const handleCountryClick = (countryName) => {
    console.log(`Selected country: ${countryName}`);
    // Add your country selection logic here
  };

  const handleViewMore = () => {
    console.log('View More clicked');
    // Add your view more logic here
  };

  return (
    <div className="flex justify-center items-center space-x-4">
      {countries.map((country) => (
        <button
          key={country.name}
          onClick={() => handleCountryClick(country.name)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-theme-secondary-hover border-2 border-white shadow-md 
                     transition-transform duration-200 hover:scale-105 hover:opacity-90 hover:shadow-lg"
        >
          <span className="text-xl">{country.flag}</span>
          <span className="font-medium text-gray-700">{country.name}</span>
        </button>
      ))}
      <button
        onClick={handleViewMore}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-theme-secondary-hover border-2 border-white shadow-md 
                   transition-transform duration-200 hover:scale-105 hover:opacity-90 hover:shadow-lg"
      >
        <span className="text-xl">👆</span>
        <span className="font-medium text-gray-700">View More</span>
      </button>
    </div>
  );
}

export default CountryFlags; 