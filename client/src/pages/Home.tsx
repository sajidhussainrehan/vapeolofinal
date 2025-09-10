import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import AboutSection from '@/components/AboutSection'
import ProductStore from '@/components/ProductStore'
import AffiliateProgram from '@/components/AffiliateProgram'
import TestimonialsSection from '@/components/TestimonialsSection'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <HeroSection />
      <AboutSection />
      <ProductStore />
      <AffiliateProgram />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  )
}