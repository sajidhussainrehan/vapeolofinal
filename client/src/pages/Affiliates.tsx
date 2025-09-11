import Header from '@/components/Header'
import AffiliateProgram from '@/components/AffiliateProgram'
import Footer from '@/components/Footer'

export default function Affiliates() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="pt-16"> {/* Space for fixed header */}
        <AffiliateProgram />
      </div>
      <Footer />
    </div>
  )
}