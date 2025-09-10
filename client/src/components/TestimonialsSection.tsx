import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Quote } from 'lucide-react'

export default function TestimonialsSection() {
  // TODO: Remove mock functionality
  const testimonials = [
    {
      id: 1,
      name: "Carlos G.",
      role: "Socio",
      avatar: "",
      rating: 5,
      text: "Desde que soy distribuidor de LAVIE, genero ingresos mensuales constantes y mis clientes aman los sabores. La calidad es excepcional."
    },
    {
      id: 2,
      name: "Ana M.", 
      role: "Cliente frecuente",
      avatar: "",
      rating: 5,
      text: "Los sabores son intensos, el diseño es moderno y duran muchísimo. Definitivamente la mejor marca de vapes que he probado."
    },
    {
      id: 3,
      name: "Roberto L.",
      role: "Distribuidor",
      avatar: "",
      rating: 5,
      text: "El programa de afiliación es muy justo y el soporte es excelente. LAVIE realmente cuida a sus socios comerciales."
    },
    {
      id: 4,
      name: "María S.",
      role: "Cliente",
      avatar: "",
      rating: 5,
      text: "La duración de 20,000 puffs es real. Un solo vape me dura semanas. Excelente relación precio-calidad."
    }
  ]

  const socialStats = [
    { platform: "Instagram", followers: "45.2K", handle: "@lavievapes.gt" },
    { platform: "TikTok", followers: "32.8K", handle: "@lavievapes" },
    { platform: "Facebook", followers: "28.1K", handle: "LAVIE Vapes Guatemala" }
  ]

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Testimonios
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Lo que dicen nuestros clientes y socios
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id}
              className="bg-gray-900/60 border-purple-500/20 hover:border-purple-400/30 transition-all duration-300 hover-elevate"
              data-testid={`card-testimonial-${testimonial.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Quote className="h-8 w-8 text-purple-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-gray-300 mb-4 italic">
                      "{testimonial.text}"
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="border-2 border-purple-500/30">
                          <AvatarImage src={testimonial.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold">
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-bold">{testimonial.name}</div>
                          <div className="text-purple-300 text-sm">{testimonial.role}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Social Media Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-8">
            Síguenos en redes sociales
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {socialStats.map((social, idx) => (
              <Card 
                key={idx}
                className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover-elevate"
                data-testid={`card-social-${idx}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-black text-white mb-2">{social.followers}</div>
                  <div className="text-purple-300 font-medium mb-1">{social.platform}</div>
                  <div className="text-gray-400 text-sm">{social.handle}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-6 inline-block">
            <p className="text-lg text-white mb-2">
              <span className="text-purple-400 font-bold">Síguenos</span> para contenido exclusivo
            </p>
            <p className="text-gray-300">
              📸 Fotos de clientes • 🎥 Reviews y unboxing • 🎁 Promos y giveaways
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}