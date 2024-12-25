import Header from '@/components/template/header'
import Component from '@/components/template/leftsidebar'

export const metadata = {
    title: 'Privacy Policy | SS Holdings',
    description: 'Learn how SS Holdings collects, uses, and protects your personal information.',
    openGraph: {
      title: 'Privacy Policy | SS Holdings',
      description: 'Learn how SS Holdings collects, uses, and protects your personal information.',
      type: 'website',
      url: 'https://ss-holdings.com/legal/privacy',
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