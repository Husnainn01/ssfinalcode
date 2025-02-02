import Header from '@/components/template/header'
import Component from '@/components/template/leftsidebar'

export const metadata = {
    title: 'Terms and Conditions | Global Drive Motors',
    description: 'Read our terms and conditions to understand your rights and responsibilities when using Global Drive Motors services.',
    openGraph: {
      title: 'Terms and Conditions | Global Drive Motors',
      description: 'Read our terms and conditions to understand your rights and responsibilities when using Global Drive Motors services.',
      type: 'website',
      url: 'https://globaldrivemotors.com/legal/terms',
    },
  }
  
  export default function TermsLayout({ children }) {
    return (
      <div className="relative">
        <Header />
        <div className="flex">
          <Component />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    )
  }