import { Inter } from 'next/font/google'
import "./globals.css"
import RootLayoutClient from './components/RootLayoutClient'
import { metadata } from './metadata'

const inter = Inter({ subsets: ['latin'] })

export { metadata }

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  )
}