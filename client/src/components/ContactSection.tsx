import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MapPin, Phone, Mail, MessageCircle, Truck, CreditCard, Clock, Loader2 } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { HomepageContentResponse, ContactContent } from '@shared/schema'

export default function ContactSection() {
  // Fetch homepage content
  const { data: homepageContent, isLoading } = useQuery<HomepageContentResponse>({
    queryKey: ['/api/homepage-content'],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })

  // Parse contact content from database
  let contactData: ContactContent | null = null;
  try {
    if (homepageContent && 'success' in homepageContent && homepageContent.data?.contact?.content) {
      contactData = JSON.parse(homepageContent.data.contact.content);
    }
  } catch (error) {
    console.error('Error parsing contact content:', error);
  }

  const content = homepageContent && 'success' in homepageContent ? homepageContent.data?.contact : null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const { toast } = useToast()

  const contactMutation = useMutation({
    mutationFn: async (contactSubmissionData: typeof formData) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactSubmissionData),
      })
      
      if (!response.ok) {
        throw new Error('Error al enviar el mensaje')
      }
      
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "¡Mensaje enviado!",
        description: "Nos pondremos en contacto contigo pronto.",
      })
      setFormData({ name: '', email: '', message: '' })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    contactMutation.mutate(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Get icon for contact info
  const getContactIcon = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('whatsapp') || titleLower.includes('teléfono') || titleLower.includes('telefono')) return Phone;
    if (titleLower.includes('email') || titleLower.includes('correo')) return Mail;
    if (titleLower.includes('ubicación') || titleLower.includes('ubicacion') || titleLower.includes('dirección') || titleLower.includes('direccion')) return MapPin;
    return Mail; // Default
  };

  // Get icon for shipping info
  const getShippingIcon = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('envío') || titleLower.includes('envio') || titleLower.includes('entrega')) return Truck;
    if (titleLower.includes('pago') || titleLower.includes('tarjeta') || titleLower.includes('método')) return CreditCard;
    if (titleLower.includes('gratis') || titleLower.includes('tiempo') || titleLower.includes('hora')) return Clock;
    return Truck; // Default
  };

  // Show loading state if data is still loading
  if (isLoading) {
    return (
      <section id="contacto" className="py-20 bg-gradient-to-b from-black to-gray-900 relative">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Cargando información de contacto...</p>
        </div>
      </section>
    );
  }

  // Show error state if no content is available
  if (!content || !contactData) {
    return (
      <section id="contacto" className="py-20 bg-gradient-to-b from-black to-gray-900 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Contacto
            </span>
          </h2>
          <p className="text-gray-400 mb-8">
            La información de contacto no está disponible en este momento.
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
    <section id="contacto" className="py-20 bg-gradient-to-b from-black to-gray-900 relative">
      {/* Background Elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {content.title}
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form - COMPLETELY DYNAMIC */}
          <Card className="bg-black/60 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                {contactData.formTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="contact-name" className="text-white">
                    {contactData.formLabels.name}
                  </Label>
                  <Input
                    id="contact-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-gray-800/50 border-purple-500/30 text-white"
                    placeholder={contactData.formPlaceholders.name}
                    data-testid="input-contact-name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact-email" className="text-white">
                    {contactData.formLabels.email}
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-gray-800/50 border-purple-500/30 text-white"
                    placeholder={contactData.formPlaceholders.email}
                    data-testid="input-contact-email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact-message" className="text-white">
                    {contactData.formLabels.message}
                  </Label>
                  <Textarea
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="bg-gray-800/50 border-purple-500/30 text-white"
                    placeholder={contactData.formPlaceholders.message}
                    rows={4}
                    data-testid="textarea-contact-message"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold"
                  data-testid="button-submit-contact"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {contactMutation.isPending ? 'Enviando...' : contactData.formButton}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info & Shipping - COMPLETELY DYNAMIC */}
          <div className="space-y-8">
            {/* Contact Methods - DYNAMIC FROM DATABASE */}
            <div className="space-y-4">
              {contactData.contactInfo.map((info, idx) => {
                const IconComponent = getContactIcon(info.title);
                return (
                  <Card 
                    key={idx}
                    className="bg-gray-900/60 border-purple-500/20 hover:border-purple-400/30 transition-all duration-300 hover-elevate"
                    data-testid={`card-contact-${idx}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold">{info.title}</h3>
                          <p className="text-gray-400 text-sm">{info.description}</p>
                          <p className="text-purple-300 font-medium">{info.value}</p>
                        </div>
                        {info.title.toLowerCase().includes('whatsapp') && (
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
                );
              })}
            </div>

            {/* Shipping Info - COMPLETELY DYNAMIC */}
            <Card className="bg-black/60 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  Envío y Pagos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Dynamic Shipping Information */}
                <div className="space-y-4">
                  {contactData.shippingInfo.map((info, idx) => {
                    const IconComponent = getShippingIcon(info.title);
                    return (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{info.title}</h4>
                          <p className="text-gray-400 text-sm">{info.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dynamic Payment Methods */}
                <div className="mt-6 pt-6 border-t border-purple-500/20">
                  <h4 className="text-white font-medium mb-3">Métodos de pago aceptados:</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-400">
                    {contactData.paymentMethods.map((method, idx) => (
                      <div key={idx}>✓ {method}</div>
                    ))}
                  </div>
                  {/* Dynamic Shipping Notice */}
                  <p className="text-xs text-purple-300 mt-2">{contactData.shippingNotice}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}