import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/landing/Hero'
import TrustStrip from '../components/landing/TrustStrip'
import Services from '../components/landing/Services'
import HowItWorks from '../components/landing/HowItWorks'
import LifestyleFeatures from '../components/landing/LifestyleFeatures'
import HealthSafety from '../components/landing/HealthSafety'
import CallToAction from '../components/landing/CallToAction'

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background">
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <Services />
        <HowItWorks />
        <LifestyleFeatures />
        <HealthSafety />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}
