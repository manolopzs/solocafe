import { outfit } from '@/components/landing/fonts'
import { FloatingNav } from '@/components/landing/nav'
import { Hero } from '@/components/landing/hero'
import { ProductCards } from '@/components/landing/product-cards'
import { HowItWorks } from '@/components/landing/how-it-works'
import { SignatureSection } from '@/components/landing/signature-section'
import { ForCafes } from '@/components/landing/for-cafes'
import { Pricing } from '@/components/landing/pricing'
import { FAQ } from '@/components/landing/faq'
import { FinalCTA } from '@/components/landing/final-cta'
import { Footer } from '@/components/landing/footer'

export default function Home() {
  return (
    <main
      lang="en"
      className={`${outfit.variable} flex flex-1 flex-col`}
      data-hide-bottom-nav
    >
      <FloatingNav />
      <Hero />
      <ProductCards />
      <HowItWorks />
      <SignatureSection />
      <ForCafes />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
