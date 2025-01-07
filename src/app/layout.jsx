import { Inter } from 'next/font/google'
import "./globals.css"
import RootLayoutClient from './components/RootLayoutClient'
import { metadata } from './metadata'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export { metadata }

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
      </head>
      <body className={inter.className}>
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