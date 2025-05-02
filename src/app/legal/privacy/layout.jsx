import Header from '@/components/template/header'
import Component from '@/components/template/leftsidebar'

export const metadata = {
    title: 'Privacy Policy | JDM Global',
    description: 'Learn how JDM Global collects, uses, and protects your personal information.',
    openGraph: {
      title: 'Privacy Policy | Global Drive Motors',
      description: 'Learn how Global Drive Motors collects, uses, and protects your personal information.',
      type: 'website',
      url: 'https://globaldrivemotors.com/legal/privacy',
    },
}

export default function PrivacyLayout({ children }) {
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