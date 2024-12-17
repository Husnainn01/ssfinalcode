import Banner from "@/components/template/banner"
import Header from "@/components/template/header"
import Footer from "@/components/template/footer"
import ScrollToTop from '@/components/block/scrollToTop'
import { Toaster } from "@/components/ui/toaster"

export default function MainLayout({ children }) {
  return (
    <>
      <Banner />
      <Header />
      <main>{children}</main>
      <Footer />
      <ScrollToTop />
      <Toaster />
    </>
  );
}
