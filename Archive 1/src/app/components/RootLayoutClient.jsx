"use client"
import { Providers } from '@/components/providers/Providers'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from '@/context/AuthContext'

export default function RootLayoutClient({ children }) {
  return (
    <>
      <AuthProvider>
        <Providers>
          <FavoritesProvider>
            {children}
            <ToastContainer 
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              style={{ zIndex: 99999 }}
            />
          </FavoritesProvider>
        </Providers>
      </AuthProvider>
    </>
  )
} 