import AdminLayoutClient from './components/AdminLayoutClient'
import { adminMetadata as metadata } from '../metadata'

export { metadata }

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
