export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default async function CarDetailsLayout({
  children,
  params
}) {
  try {
    // Remove authentication check for public car details
    return (
      <div>
        {children}
      </div>
    );
  } catch (error) {
    console.error('Car details layout error:', error);
    return (
      <div>
        <p>Error loading page</p>
      </div>
    );
  }
} 