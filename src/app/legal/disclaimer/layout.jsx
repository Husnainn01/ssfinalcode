import Header from '@/components/template/header'
import Component from '@/components/template/leftsidebar'

export const metadata = {
  title: 'Disclaimer | SS Holdings',
  description: 'Read our disclaimer to understand the limitations and terms of use for SS Holdings website and services.',
  openGraph: {
    title: 'Disclaimer | Global Drive Motors',
    description: 'Read our disclaimer to understand the limitations and terms of use for Global Drive Motors website and services.',
    type: 'website',
    url: 'https://globaldrivemotors.com/legal/disclaimer',
  },
}

export default function DisclaimerLayout({ children }) {
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