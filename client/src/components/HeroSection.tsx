import { Button } from '@/components/ui/button'
import { ArrowRight, ShoppingCart, Users } from 'lucide-react'
import { useLocation } from 'wouter'
import heroImage from '@assets/generated_images/Hero_banner_lifestyle_image_3d61fbb5.png'

export default function HeroSection() {
  const [, setLocation] = useLocation()

  const scrollToProducts = () => {
    const productosSection = document.getElementById('productos')
    if (productosSection) {
      productosSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const navigateToAffiliates = () => {
    setLocation('/affiliates')
  }
  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="LAVIE Vapes Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-purple-900/50 to-blue-900/30"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="max-w-4xl">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              VAPEOLO:
            </span>
            <br />
            <span className="text-white">
              Donde la experiencia y el sabor se fusionan
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 font-medium">
            15 años diseñando los mejores cigarrillos electrónicos del mercado
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-6 mb-10 text-lg">
            <div className="flex items-center text-purple-300">
              <span className="text-2xl mr-2">🌟</span>
              Más de 25 sabores
            </div>
            <div className="flex items-center text-blue-300">
              <span className="text-2xl mr-2">💨</span>
              Hasta 20,000 puffs
            </div>
            <div className="flex items-center text-green-300">
              <span className="text-2xl mr-2">🚀</span>
              Envíos a todo el país
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-8 py-4 text-lg"
              data-testid="button-ver-productos"
              onClick={scrollToProducts}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Ver Productos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-purple-400 text-purple-300 hover:bg-purple-400 hover:text-black font-bold px-8 py-4 text-lg backdrop-blur-sm"
              data-testid="button-afiliado"
              onClick={navigateToAffiliates}
            >
              <Users className="mr-2 h-5 w-5" />
              Unirme como Afiliado
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-10 right-10 opacity-20">
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-xl"></div>
      </div>
      <div className="absolute top-1/3 right-1/4 opacity-10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 blur-lg"></div>
      </div>
    </section>
  )
}