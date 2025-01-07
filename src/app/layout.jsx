import { Inter } from 'next/font/google'
import "./globals.css"
import RootLayoutClient from './components/RootLayoutClient'
import { metadata } from './metadata'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ['latin'] })

export { metadata }

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <FavoritesProvider>
          <RootLayoutClient>
            {children}
            <SpeedInsights />
          </RootLayoutClient>
        </FavoritesProvider>
      </body>
    </html>
  )
}