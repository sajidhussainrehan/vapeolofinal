import { Button } from '@/components/ui/button'
import { ArrowRight, ShoppingCart, Users, Loader2 } from 'lucide-react'
import { useLocation } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { HomepageContentResponse, type HeroContent, type HeroFeature } from '@shared/schema'
import heroImage from '@assets/generated_images/Hero_banner_lifestyle_image_3d61fbb5.png'

export default function HeroSection() {
  const [, setLocation] = useLocation()

  // Fetch homepage content for hero section
  const { data: homepageContent, isLoading } = useQuery<HomepageContentResponse>({
    queryKey: ['/api/homepage-content'],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })

  // Parse hero content from database
  let heroData: HeroContent | null = null;
  try {
    if (homepageContent && 'success' in homepageContent && homepageContent.data?.hero?.content) {
      heroData = JSON.parse(homepageContent.data.hero.content);
    }
  } catch (error) {
    console.error('Error parsing hero content:', error);
  }

  const content = homepageContent && 'success' in homepageContent ? homepageContent.data?.hero : null;

  const scrollToProducts = () => {
    const productosSection = document.getElementById('productos')
    if (productosSection) {
      productosSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const navigateToAffiliates = () => {
    setLocation('/affiliates')
  }

  // Show loading state
  if (isLoading) {
    return (
      <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="LAVIE Vapes Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-purple-900/50 to-blue-900/30"></div>
        </div>
        <div className="relative z-10 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-300 text-xl">Cargando contenido principal...</p>
        </div>
      </section>
    );
  }

  // Show error state if no content is available
  if (!content || !heroData) {
    return (
      <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="LAVIE Vapes Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-purple-900/50 to-blue-900/30"></div>
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              VAPEOLO
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            El contenido principal no está disponible en este momento.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Recargar página
          </Button>
        </div>
      </section>
    );
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
      
      {/* Content - COMPLETELY DYNAMIC */}
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="max-w-4xl">
          {/* Main Heading - DYNAMIC FROM DATABASE */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {content.title}
            </span>
            <br />
            <span className="text-white">
              {content.subtitle}
            </span>
          </h1>

          {/* Subtitle - DYNAMIC FROM DATABASE */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 font-medium">
            {content.description}
          </p>

          {/* Features - COMPLETELY DYNAMIC FROM DATABASE */}
          <div className="flex flex-wrap gap-6 mb-10 text-lg">
            {heroData.features.map((feature: HeroFeature, idx: number) => (
              <div key={idx} className="flex items-center text-purple-300">
                <span className="text-2xl mr-2">{feature.icon}</span>
                <span className={`${
                  idx === 0 ? 'text-purple-300' : 
                  idx === 1 ? 'text-blue-300' : 'text-green-300'
                }`}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons - DYNAMIC FROM DATABASE */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-8 py-4 text-lg"
              data-testid="button-ver-productos"
              onClick={scrollToProducts}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {heroData.buttons.primary}
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
              {heroData.buttons.secondary}
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