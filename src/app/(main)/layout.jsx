import Banner from "@/components/template/banner"
import Header from "@/components/template/header"
import Footer from "@/components/template/footer"
import ScrollToTop from '@/components/block/scrollToTop'
import WhatsAppChat from '@/components/block/WhatsAppChat'
import { Toaster } from "@/components/ui/toaster"
import { SentryErrorBoundary } from '@/components/SentryErrorBoundary'

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Banner />
      <Header />
      <main className="flex-grow bg-[#E2F1E7]">
        <SentryErrorBoundary>
          {children}
        </SentryErrorBoundary>
      </main>
      <Footer />
      <ScrollToTop />
      <WhatsAppChat />
      <Toaster />
    </div>
  );
}
