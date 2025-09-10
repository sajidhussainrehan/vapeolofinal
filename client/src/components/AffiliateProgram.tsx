import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { User, Briefcase, Crown, Check, DollarSign, Users, Headphones } from 'lucide-react'

export default function AffiliateProgram() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    level: 'agente',
    message: ''
  })

  const affiliateLevels = [
    {
      id: 'agente',
      name: 'Agente',
      icon: User,
      discount: '10% - 12%',
      minimum: 'Q500',
      color: 'from-purple-500 to-purple-600',
      features: [
        'Descuento del 10% al 12%',
        'Monto mínimo de compra: Q500',
        'Ideal para uso personal',
        'Acceso a ofertas exclusivas'
      ]
    },
    {
      id: 'distribuidor',
      name: 'Distribuidor', 
      icon: Briefcase,
      discount: '25% - 30%',
      minimum: 'Q1,500',
      color: 'from-blue-500 to-blue-600',
      popular: true,
      features: [
        'Descuento del 25% al 30%',
        'Monto mínimo de compra: Q1,500',
        'Para revendedores activos',
        'Herramientas de marketing incluidas'
      ]
    },
    {
      id: 'socio',
      name: 'Socio',
      icon: Crown,
      discount: '45% - 50%',
      minimum: 'Q3,500',
      color: 'from-yellow-500 to-orange-500',
      features: [
        'Descuento del 45% al 50%',
        'Monto mínimo de compra: Q3,500',
        'Apoyo comercial personalizado',
        'Beneficios exclusivos y prioridad de stock'
      ]
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Formulario de afiliación enviado:', formData)
    // TODO: Remove mock functionality
    alert('¡Solicitud enviada! Nos pondremos en contacto contigo pronto.')
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <section id="afiliados" className="py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Programa de Afiliación
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-4">
            Gana mientras vapeas - ¡Haz parte de LAVIE!
          </p>
          <p className="text-lg text-purple-300">
            ¿Quieres ganar dinero vendiendo nuestros vapes? ¡Únete a nuestro equipo!
          </p>
        </div>

        {/* Affiliate Levels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {affiliateLevels.map((level) => (
            <Card 
              key={level.id}
              className={`relative bg-black/60 border-2 transition-all duration-300 hover-elevate ${
                level.popular ? 'border-blue-400/50 scale-105' : 'border-purple-500/20 hover:border-purple-400/50'
              }`}
              data-testid={`card-affiliate-${level.id}`}
            >
              {level.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500">
                  Más popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${level.color} rounded-full flex items-center justify-center mb-4`}>
                  <level.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-black text-white">{level.name}</CardTitle>
                <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                  {level.discount}
                </div>
                <p className="text-gray-400">Monto mínimo: {level.minimum}</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {level.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Registration Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-black/60 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white text-center">
                Registrarse como Afiliado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Nombre completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-gray-800/50 border-purple-500/30 text-white"
                      placeholder="Tu nombre completo"
                      data-testid="input-name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-gray-800/50 border-purple-500/30 text-white"
                      placeholder="tu@email.com"
                      data-testid="input-email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-gray-800/50 border-purple-500/30 text-white"
                    placeholder="+502 1234-5678"
                    data-testid="input-phone"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="level" className="text-white">Nivel de afiliación deseado</Label>
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    className="w-full bg-gray-800/50 border border-purple-500/30 text-white rounded-md px-3 py-2"
                    data-testid="select-level"
                  >
                    <option value="agente">Agente (10-12%)</option>
                    <option value="distribuidor">Distribuidor (25-30%)</option>
                    <option value="socio">Socio (45-50%)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="message" className="text-white">Mensaje (opcional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="bg-gray-800/50 border-purple-500/30 text-white"
                    placeholder="Cuéntanos sobre tu experiencia en ventas o por qué quieres ser parte de LAVIE..."
                    rows={4}
                    data-testid="textarea-message"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3"
                  data-testid="button-submit-affiliate"
                >
                  Enviar Solicitud
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}