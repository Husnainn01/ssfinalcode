import Header from '@/components/template/header'
import Component from '@/components/template/leftsidebar'

export const metadata = {
    title: 'Terms and Conditions | SS Holdings',
    description: 'Read our terms and conditions to understand your rights and responsibilities when using SS Holdings services.',
    openGraph: {
      title: 'Terms and Conditions | SS Holdings',
      description: 'Read our terms and conditions to understand your rights and responsibilities when using SS Holdings services.',
      type: 'website',
      url: 'https://ss-holdings.com/legal/terms',
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