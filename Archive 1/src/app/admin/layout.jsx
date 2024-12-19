import AdminLayoutClient from './components/AdminLayoutClient'
import { Providers } from "./providers"

export default function AdminLayout({ children }) {
  return (
    <Providers>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </Providers>
  );
}
