import { Inter } from 'next/font/google'
import "./globals.css"
import RootLayoutClient from './components/RootLayoutClient'
import { metadata } from './metadata'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import GoogleAnalytics from '@/components/GoogleAnalytics'
import NoticeBar from '@/components/ui/NoticeBar'

const inter = Inter({ subsets: ['latin'] })

export { metadata }

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
        <link 
          rel="alternate" 
          type="application/rss+xml" 
          title="Global Drive Motors Feed" 
          href="/api/rss" 
        />
      </head>
      <body className={inter.className}>
        <NoticeBar />
        <FavoritesProvider>
          <RootLayoutClient>
            {children}
            <SpeedInsights />
            <Analytics />
          </RootLayoutClient>
        </FavoritesProvider>
      </body>
    </html>
  )
}