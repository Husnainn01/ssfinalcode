"use client"
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/block/card';
import { Image } from "@nextui-org/react";
import { FavoriteButton } from '@/components/ui/FavoriteButton';

export default function CarCard({ car }) {
    return (
        <Card className="w-full h-full hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
                <div className="relative w-full">
                    <div className="absolute top-2 right-2 z-10">
                        <FavoriteButton carId={car._id.toString()} />
                    </div>
                    <Link href={`/cars/${car._id}`}>
                        <Image
                            src={car.image || '/placeholder.jpg'}
                            alt={car.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                        />
                        {car.itemCondition && (
                            <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-md text-sm">
                                {car.itemCondition}
                            </span>
                        )}
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <Link href={`/cars/${car._id}`}>
                    <h3 className="text-lg font-semibold mb-2 hover:text-blue-600">{car.title}</h3>
                </Link>
                <div className="space-y-2">
                    <p className="text-xl font-bold text-primary">
                        {car.priceCurrency} {Number(car.price).toLocaleString()}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>Make: {car.make}</p>
                        <p>Model: {car.model}</p>
                        <p>Year: {car.year}</p>
                        <p>Mileage: {car.mileage} {car.mileageUnit}</p>
                        <p>Transmission: {car.vehicleTransmission}</p>
                        <p>Fuel: {car.fuelType}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 