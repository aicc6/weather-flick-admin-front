import { Footer } from './footer'
import { Breadcrumb } from '../../common/Breadcrumb'

export function DefaultLayout({ children }) {
  return (
    <div className="bg-background min-h-screen">
      <main className="container-padded">
        <Breadcrumb className="mb-6" />
        {children}
      </main>

      <Footer />
    </div>
  )
}
