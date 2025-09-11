import { Facebook, Instagram, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { HomepageContentResponse, type FooterContent } from '@shared/schema'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  // Fetch homepage content for footer
  const { data: homepageContent } = useQuery<HomepageContentResponse>({
    queryKey: ['/api/homepage-content'],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })

  // Default footer content as fallback
  const defaultFooterContent = {
    brandName: 'VAPEOLO',
    brandDescription: 'Distribuidora oficial de LAVIE con 15 años diseñando los mejores cigarrillos electrónicos del mercado. Donde la experiencia y el sabor se fusionan.',
    columns: {
      products: {
        title: 'Productos',
        links: [
          { name: "CYBER - 20,000 Puffs", href: "#productos" },
          { name: "CUBE - 20,000 Puffs", href: "#productos" },
          { name: "ENERGY - 15,000 Puffs", href: "#productos" },
          { name: "TORCH - 6,000 Puffs", href: "#productos" },
          { name: "BAR - 800 Puffs", href: "#productos" }
        ]
      },
      company: {
        title: 'Empresa',
        links: [
          { name: "Sobre LAVIE", href: "#inicio" },
          { name: "Programa de Afiliación", href: "#afiliados" },
          { name: "Testimonios", href: "#testimonios" },
          { name: "Contacto", href: "#contacto" }
        ]
      },
      support: {
        title: 'Soporte',
        links: [
          { name: "Envíos y devoluciones", href: "#contacto" },
          { name: "Métodos de pago", href: "#contacto" },
          { name: "Preguntas frecuentes", href: "#contacto" },
          { name: "Soporte técnico", href: "#contacto" }
        ]
      }
    },
    copyright: '© {currentYear} VAPEOLO - Distribuidora oficial LAVIE. Todos los derechos reservados.',
    legalLinks: [
      { name: "Términos y Condiciones", href: "#" },
      { name: "Política de Privacidad", href: "#" },
      { name: "Política de Cookies", href: "#" }
    ],
    ageWarning: 'Este sitio web es solo para mayores de 18 años. Los productos de vapeo contienen nicotina, una sustancia química adictiva.'
  }

  // Parse footer content from CMS or use defaults
  let footerContent = defaultFooterContent
  try {
    const footerSection = homepageContent && 'success' in homepageContent && homepageContent.data?.footer
    if (footerSection && 'content' in footerSection && footerSection.content) {
      const parsedContent = JSON.parse(footerSection.content) as FooterContent
      footerContent = parsedContent
    }
  } catch {
    // Fallback to default if JSON parsing fails
    footerContent = defaultFooterContent
  }

  return (
    <footer className="bg-black border-t border-purple-500/20">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="text-3xl font-black bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-4 font-mono">
              {footerContent.brandName}
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {footerContent.brandDescription}
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                size="icon"
                className="border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10"
                data-testid="button-social-instagram"
              >
                <Instagram className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="border-blue-500/30 hover:border-blue-400 hover:bg-blue-500/10"
                data-testid="button-social-facebook"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="border-green-500/30 hover:border-green-400 hover:bg-green-500/10"
                data-testid="button-social-whatsapp"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{footerContent.columns.products.title}</h3>
            <ul className="space-y-3">
              {footerContent.columns.products.links.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                    data-testid={`link-product-${idx}`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{footerContent.columns.company.title}</h3>
            <ul className="space-y-3">
              {footerContent.columns.company.links.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                    data-testid={`link-company-${idx}`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{footerContent.columns.support.title}</h3>
            <ul className="space-y-3">
              {footerContent.columns.support.links.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                    data-testid={`link-support-${idx}`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-purple-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              {footerContent.copyright.replace('{currentYear}', currentYear.toString())}
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm">
              {footerContent.legalLinks.map((link, idx) => (
                <a key={idx} href={link.href} className="text-gray-400 hover:text-purple-400 transition-colors">
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-purple-500/10 text-center">
            <p className="text-gray-500 text-xs">
              {footerContent.ageWarning}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}