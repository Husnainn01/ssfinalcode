import { notFound } from 'next/navigation';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { BlogPostJsonLd } from '@/app/components/json-ld';

// Import components from local folder
import ListingPage from "./carPost";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

async function fetchCar(id) {
  try {
    console.log('Fetching car with id:', id);
    
    const timestamp = Date.now();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cars/${id}?t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (!res.ok) {
      console.error('Failed to fetch car:', res.status);
      throw new Error('Failed to fetch car');
    }
    
    const data = await res.json();
    console.log('Fetched car data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching car:', error);
    throw error;
  }
}

export async function generateMetadata({ params }) {
  try {
    const vehicle = await fetchCar(params.id);
    
    return {
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model} | Global Drive Motors`,
      description: `${vehicle.year} ${vehicle.make} ${vehicle.model} for sale. ${vehicle.mileage}${vehicle.mileageUnit}, ${vehicle.vehicleTransmission}, ${vehicle.fuelType}. Ready for export with complete documentation.`,
      openGraph: {
        title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        description: vehicle.description || `${vehicle.year} ${vehicle.make} ${vehicle.model} for sale`,
        images: vehicle.images?.map(img => ({
          url: img,
          width: 1200,
          height: 630,
          alt: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        })) || [],
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Car Details | Global Drive Motors',
      description: 'View car details and specifications'
    };
  }
}

export default async function CarDetailsPage({ params }) {
  console.log('CarDetailsPage params:', params); // Debug log
  
  try {
    const car = await fetchCar(params.id);
    
    if (!car) {
      console.log('Car not found'); // Debug log
      notFound();
    }

    // Generate structured data for SEO
    const vehicleJsonLd = {
      "@context": "https://schema.org",
      "@type": "Vehicle",
      "name": `${car.year} ${car.make} ${car.model}`,
      "description": car.description || `${car.year} ${car.make} ${car.model}`,
      "vehicleIdentificationNumber": car.vin,
      "modelDate": car.year,
      "manufacturer": {
        "@type": "Organization",
        "name": car.make
      },
      "model": car.model,
      "bodyType": car.bodyType,
      "fuelType": car.fuelType,
      "transmission": car.vehicleTransmission,
      "driveWheelConfiguration": car.driveWheelConfiguration,
      "mileageFromOdometer": {
        "@type": "QuantitativeValue",
        "value": car.mileage,
        "unitCode": car.mileageUnit === 'km' ? 'KMT' : 'SMI'
      },
      "vehicleEngine": car.vehicleEngine,
      "color": car.color,
      "numberOfDoors": car.numberOfDoors,
      "image": car.images || [car.image]
    };

    return (
      <div className="bg-[#E2F1E7]">
        <BlogPostJsonLd data={vehicleJsonLd} />
        <ListingPage 
          car={car} 
          id={params.id}
          favoriteButton={<FavoriteButton carId={car._id} />} 
        />
      </div>
    );
  } catch (error) {
    console.error('Error in CarDetailsPage:', error);
    notFound();
  }
} 