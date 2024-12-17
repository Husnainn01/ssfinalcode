import Header from '@/components/template/header'
import Footer from '@/components/template/footer'

export default function CarsLayout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#E2F1E7] pt-[1px]">
        {children}
      </main>
      <Footer />
    </>
  )
} 