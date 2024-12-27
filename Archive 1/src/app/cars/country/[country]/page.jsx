"use client";
import { useState, useEffect } from "react";
import CarCard from "@/components/block/carCard";
import { Spinner } from "@nextui-org/react";

export default function CountrySpecificCars({ params }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cars/country/${params.country}`);
        if (!response.ok) {
          throw new Error('Failed to fetch cars');
        }
        const data = await response.json();
        setCars(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching cars:", error);
        setError(error.message);
        setCars([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [params.country]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 capitalize">
        Cars from {params.country}
      </h1>
      {!cars || cars.length === 0 ? (
        <p className="text-center text-gray-500">No cars found from {params.country}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cars.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
} 