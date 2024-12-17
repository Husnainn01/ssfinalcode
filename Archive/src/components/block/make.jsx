import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function MakeSelection() {
  const [makes, setMakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchMakes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/listing/make', {
        next: { revalidate: 0 },
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch makes');
      
      const data = await response.json();
      // Only show active makes and sort them
      const activeMakes = data
        .filter(make => make.active)
        .sort((a, b) => a.make.localeCompare(b.make));
      
      setMakes(activeMakes);
      setError(null);
    } catch (error) {
      console.error('Error fetching makes:', error);
      setError('Failed to load makes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMakes();
    // Refresh every 3 seconds
    const interval = setInterval(fetchMakes, 3000);
    return () => clearInterval(interval);
  }, []);

  // Add event listener for storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'makesUpdated') {
        fetchMakes();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) return <div>Loading makes...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {makes.map((make) => (
        <Link 
          key={make._id} 
          href={`/cars?make=${encodeURIComponent(make.make)}`}
          className="flex flex-col items-center p-4 hover:shadow-lg transition-shadow"
        >
          <Image
            src={make.image}
            alt={make.make}
            width={80}
            height={80}
            className="object-contain"
          />
          <span className="mt-2 text-center">{make.make}</span>
        </Link>
      ))}
    </div>
  );
}
