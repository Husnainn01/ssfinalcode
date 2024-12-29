import Car from './Car';

export default async function handler(req, res) {
  try {
    // Get unique makes
    const makes = await Car.distinct('make');

    // Get unique models
    const models = await Car.distinct('model');

    // Get unique body types
    const types = await Car.distinct('bodyType');

    // Get unique colors
    const colors = await Car.distinct('color');

    // Get unique transmissions
    const transmissions = await Car.distinct('vehicleTransmission');

    // Get unique fuel types
    const fuelTypes = await Car.distinct('fuelType');

    // Get unique drive configurations
    const driveTypes = await Car.distinct('driveWheelConfiguration');

    // Get min and max prices for dynamic price ranges
    const minPrice = await Car.findOne().sort({ price: 1 }).select('price');
    const maxPrice = await Car.findOne().sort({ price: -1 }).select('price');

    // Create dynamic price ranges based on actual data
    const priceRanges = [];
    if (minPrice && maxPrice) {
      const min = Math.floor(minPrice.price / 5000) * 5000;
      const max = Math.ceil(maxPrice.price / 5000) * 5000;

      for (let i = min; i < max; i += 5000) {
        priceRanges.push({
          value: `${i}-${i + 5000}`,
          label: `$${i.toLocaleString()} - $${(i + 5000).toLocaleString()}`
        });
      }
    }

    // Get unique years for year range
    const years = await Car.distinct('year');
    const yearRange = {
      min: Math.min(...years.filter(Boolean)),
      max: Math.max(...years.filter(Boolean))
    };

    res.json({
      makes: makes.filter(make => make), // Remove null/empty values
      models: models.filter(model => model),
      types: types.filter(type => type),
      priceRanges,
      yearRange,
      colors: colors.filter(color => color),
      transmissions: transmissions.filter(transmission => transmission),
      fuelTypes: fuelTypes.filter(fuelType => fuelType),
      driveTypes: driveTypes.filter(driveType => driveType)
    });
  } catch (error) {
    console.error('Error fetching options:', error);
    res.status(500).json({ error: 'Failed to fetch options' });
  }
}