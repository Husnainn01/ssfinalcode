import Header from '@/components/template/header'
import Footer from '@/components/template/footer'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CarsLayout({ children }) {
  return (
    <>
      <Header />
      <main className="bg-[#E2F1E7]">
        {children}
      </main>
      <Footer />
    </>
  )
} 