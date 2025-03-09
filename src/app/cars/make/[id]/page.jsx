import TypePgae from "./make";

export async function generateMetadata({ params }) {
  const currentYear = new Date().getFullYear(); // Get the current year

  return {
    title: `Explore the Best ${params.id} Cars of ${currentYear} | Top Deals & Reviews`, // SEO-friendly title
    description: `Discover the best ${params.id} cars available this year. Get top deals, expert reviews, and detailed comparisons to find your perfect car.`, // SEO-friendly description
    openGraph: {
      title: `Explore the Best ${params.id} Cars of ${currentYear} | Top Deals & Reviews`,
      description: `Discover the best ${params.id} cars available this year. Get top deals, expert reviews, and detailed comparisons to find your perfect car.`,
      images: [
        {
          url: '/logo.svg', 
          alt: `Best ${params.id} Cars`
        }
      ],
    },
  };
}

export default function Page({ params }) {
  return (
    <div className="mb-10"><TypePgae id={params.id} /></div>
  );
}
