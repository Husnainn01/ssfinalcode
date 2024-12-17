import { notFound } from 'next/navigation';
import ListingPage from "./carPost";
import { FavoriteButton } from '@/components/FavoriteButton';

async function fetchCar(slug) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    console.log('Fetching car with slug:', slug); // Debug log
    
    const res = await fetch(`${baseUrl}/api/cars/${slug}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error('Failed to fetch car:', res.status); // Debug log
      throw new Error('Failed to fetch car');
    }
    
    const data = await res.json();
    console.log('Fetched car data:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error fetching car:', error);
    throw error;
  }
}

export default async function CarDetailsPage({ params }) {
  console.log('CarDetailsPage params:', params); // Debug log
  
  try {
    const car = await fetchCar(params.slug);
    
    if (!car) {
      console.log('Car not found'); // Debug log
      notFound();
    }

    return (
      <div className="mb-10">
        <ListingPage 
          car={car} 
          slug={params.slug}
          favoriteButton={<FavoriteButton carId={params.slug} />} 
        />
      </div>
    );
  } catch (error) {
    console.error('Error in CarDetailsPage:', error);
    notFound();
  }
}
