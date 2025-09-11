import { Card } from '@/components/ui/card'
import { Globe, Battery, Wind, Shield } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { HomepageContentResponse } from '@shared/schema'

export default function AboutSection() {
  // Fetch homepage content with graceful fallback
  const { data: homepageContent } = useQuery<HomepageContentResponse>({
    queryKey: ['/api/homepage-content'],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })

  // Default hardcoded content as fallback
  const defaultContent = {
    title: '¿Quiénes somos?',
    subtitle: 'VAPEOLO es distribuidora oficial de LAVIE, una marca con más de 15 años de innovación en diseño y fabricación de vapes.',
    description: 'Nuestra misión: redefinir el vapeo en Latinoamérica'
  }

  // Use database content if available, otherwise fallback to default
  const content = (homepageContent && 'success' in homepageContent && homepageContent.data?.about) || defaultContent

  const highlights = [
    {
      icon: Globe,
      title: "Presencia en más de 10 países",
      description: "Distribuyendo experiencias únicas a nivel internacional"
    },
    {
      icon: Battery,
      title: "Baterías de larga duración", 
      description: "Tecnología avanzada para máximo rendimiento"
    },
    {
      icon: Wind,
      title: "Hasta 20,000 puffs por dispositivo",
      description: "La duración más larga del mercado"
    },
    {
      icon: Shield,
      title: "Garantía de calidad",
      description: "15 años de experiencia y excelencia comprobada"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900 relative">
      {/* Background Elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {content.title}
            </span>
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              {content.subtitle || content.description || defaultContent.subtitle}
            </p>
            {(content.description && content.subtitle !== content.description) && (
              <p className="text-lg text-blue-300 font-medium">
                {content.description}
              </p>
            )}
          </div>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((highlight, index) => (
            <Card 
              key={index} 
              className="bg-black/40 border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 p-6 hover-elevate"
              data-testid={`card-highlight-${index}`}
            >
              <div className="text-center">
                <div className="mb-4 mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <highlight.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {highlight.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {highlight.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-gradient-to-r from-purple-500/20 to-transparent p-6 rounded-lg">
            <div className="text-4xl font-black text-purple-400 mb-2">15+</div>
            <div className="text-gray-300">Años de experiencia</div>
          </div>
          <div className="bg-gradient-to-r from-blue-500/20 to-transparent p-6 rounded-lg">
            <div className="text-4xl font-black text-blue-400 mb-2">25+</div>
            <div className="text-gray-300">Sabores disponibles</div>
          </div>
          <div className="bg-gradient-to-r from-green-500/20 to-transparent p-6 rounded-lg">
            <div className="text-4xl font-black text-green-400 mb-2">10+</div>
            <div className="text-gray-300">Países con presencia</div>
          </div>
        </div>
      </div>
    </section>
  )
}