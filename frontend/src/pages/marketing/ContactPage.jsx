import { useState } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import MarketingLayout from '../../components/marketing/MarketingLayout'
import MarketingPageHero from '../../components/marketing/MarketingPageHero'
import Button from '../../components/ui/Button'
import Container from '../../components/ui/Container'
import FadeIn from '../../components/ui/FadeIn'

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <MarketingLayout>
      <MarketingPageHero
        eyebrow="Contact"
        title="Talk with the BioFit wellness team"
        description="Reach VitalLife Wellness for programme questions, appointments or general support. We’ll help you find the right next step."
        primaryLabel="Create account"
        secondaryLabel="Sign in"
      />
      <section className="bf-section">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <FadeIn>
              <h2 className="font-display text-2xl font-bold text-[#111827]">
                Visit or message us
              </h2>
              <ul className="mt-6 space-y-5 text-sm text-[#374151]">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#005a40]" />
                  <span>
                    VitalLife Clinic, 450 Health Parkway, Suite 800, Medical City
                  </span>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#005a40]" />
                  <a href="mailto:care@biofitvitallife.com" className="hover:underline">
                    care@biofitvitallife.com
                  </a>
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#005a40]" />
                  <a href="tel:+94112345678" className="hover:underline">
                    +94 11 234 5678
                  </a>
                </li>
              </ul>
            </FadeIn>

            <FadeIn delay={100}>
              <form
                onSubmit={handleSubmit}
                className="rounded-[1.5rem] border border-[#e8ecf1] bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:p-8"
              >
                <h2 className="font-display text-xl font-bold text-[#111827]">
                  Send a message
                </h2>
                {sent ? (
                  <p className="mt-4 rounded-xl bg-[#e6f5f0] px-4 py-3 text-sm text-[#005a40]">
                    Thanks — your message has been noted. Our team will follow up soon.
                  </p>
                ) : (
                  <div className="mt-5 space-y-4">
                    <label className="block text-sm font-semibold text-[#111827]">
                      Full name
                      <input required className="bf-input mt-1 !px-3" />
                    </label>
                    <label className="block text-sm font-semibold text-[#111827]">
                      Email
                      <input type="email" required className="bf-input mt-1 !px-3" />
                    </label>
                    <label className="block text-sm font-semibold text-[#111827]">
                      Message
                      <textarea required rows={4} className="bf-input mt-1 !px-3" />
                    </label>
                    <Button type="submit" className="rounded-full px-6">
                      Submit
                    </Button>
                  </div>
                )}
              </form>
            </FadeIn>
          </div>
        </Container>
      </section>
    </MarketingLayout>
  )
}
