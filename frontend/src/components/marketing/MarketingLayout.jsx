import Navbar from '../layout/Navbar'
import Footer from '../layout/Footer'

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-svh bg-background">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
