import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MapPin, Phone, Mail, MessageCircle, Truck, CreditCard, Clock } from 'lucide-react'

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Formulario de contacto enviado:', formData)
    // TODO: Remove mock functionality
    alert('¡Mensaje enviado! Nos pondremos en contacto contigo pronto.')
    setFormData({ name: '', email: '', message: '' })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "WhatsApp",
      description: "¿Dudas? Escríbenos al instante",
      value: "+502 1234-5678",
      action: "Chatear ahora"
    },
    {
      icon: Mail,
      title: "Email",
      description: "Contacto comercial",
      value: "info@lavievapes.gt",
      action: "Enviar email"
    },
    {
      icon: MapPin,
      title: "Ubicación",
      description: "Envíos a toda Guatemala",
      value: "Ciudad de Guatemala",
      action: "Ver cobertura"
    }
  ]

  const shippingInfo = [
    {
      icon: Truck,
      title: "Envíos a toda Guatemala",
      description: "Entregas en 24-72h hábiles"
    },
    {
      icon: CreditCard,
      title: "Múltiples métodos de pago",
      description: "Tarjeta, transferencia, contra entrega"
    },
    {
      icon: Clock,
      title: "Envío gratis",
      description: "En compras desde Q500"
    }
  ]

  return (
    <section id="contacto" className="py-20 bg-gradient-to-b from-black to-gray-900 relative">
      {/* Background Elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Contacto
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Estamos aquí para ayudarte
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-black/60 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                Envíanos un mensaje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="contact-name" className="text-white">Nombre</Label>
                  <Input
                    id="contact-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-gray-800/50 border-purple-500/30 text-white"
                    placeholder="Tu nombre"
                    data-testid="input-contact-name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact-email" className="text-white">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-gray-800/50 border-purple-500/30 text-white"
                    placeholder="tu@email.com"
                    data-testid="input-contact-email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact-message" className="text-white">Mensaje</Label>
                  <Textarea
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="bg-gray-800/50 border-purple-500/30 text-white"
                    placeholder="¿En qué podemos ayudarte?"
                    rows={4}
                    data-testid="textarea-contact-message"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold"
                  data-testid="button-submit-contact"
                >
                  Enviar mensaje
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info & Shipping */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="space-y-4">
              {contactInfo.map((info, idx) => (
                <Card 
                  key={idx}
                  className="bg-gray-900/60 border-purple-500/20 hover:border-purple-400/30 transition-all duration-300 hover-elevate"
                  data-testid={`card-contact-${idx}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <info.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{info.title}</h3>
                        <p className="text-gray-400 text-sm">{info.description}</p>
                        <p className="text-purple-300 font-medium">{info.value}</p>
                      </div>
                      {info.title === "WhatsApp" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                          data-testid="button-whatsapp"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {info.action}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Shipping Info */}
            <Card className="bg-black/60 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  Envío y Pagos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shippingInfo.map((info, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <info.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{info.title}</h4>
                        <p className="text-gray-400 text-sm">{info.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-purple-500/20">
                  <h4 className="text-white font-medium mb-3">Métodos de pago aceptados:</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-400">
                    <div>✓ Tarjeta de crédito</div>
                    <div>✓ Transferencia</div>
                    <div>✓ Contra entrega</div>
                  </div>
                  <p className="text-xs text-purple-300 mt-2">
                    * Contra entrega mínimo Q50
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}