import { Footer } from './footer'
import { Header } from './header'
import { Breadcrumb } from '@/components/common/Breadcrumb'

export function DefaultLayout({ children }) {
  return (
    <div className="bg-background min-h-screen">
      <Header />

      <main className="container-padded">
        <Breadcrumb className="mb-6" />
        {children}
      </main>

      <Footer />
    </div>
  )
}
