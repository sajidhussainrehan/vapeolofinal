import { Facebook, Instagram, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    productos: [
      { name: "CYBER - 20,000 Puffs", href: "#productos" },
      { name: "CUBE - 20,000 Puffs", href: "#productos" },
      { name: "ENERGY - 15,000 Puffs", href: "#productos" },
      { name: "TORCH - 6,000 Puffs", href: "#productos" },
      { name: "BAR - 800 Puffs", href: "#productos" }
    ],
    empresa: [
      { name: "Sobre LAVIE", href: "#inicio" },
      { name: "Programa de Afiliación", href: "#afiliados" },
      { name: "Testimonios", href: "#testimonios" },
      { name: "Contacto", href: "#contacto" }
    ],
    soporte: [
      { name: "Envíos y devoluciones", href: "#contacto" },
      { name: "Métodos de pago", href: "#contacto" },
      { name: "Preguntas frecuentes", href: "#contacto" },
      { name: "Soporte técnico", href: "#contacto" }
    ]
  }

  return (
    <footer className="bg-black border-t border-purple-500/20">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="text-3xl font-black bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-4 font-mono">
              LAVIE
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              15 años diseñando los mejores cigarrillos electrónicos del mercado. 
              Donde la experiencia y el sabor se fusionan.
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
            <h3 className="text-white font-bold text-lg mb-4">Productos</h3>
            <ul className="space-y-3">
              {footerLinks.productos.map((link, idx) => (
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
            <h3 className="text-white font-bold text-lg mb-4">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link, idx) => (
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
            <h3 className="text-white font-bold text-lg mb-4">Soporte</h3>
            <ul className="space-y-3">
              {footerLinks.soporte.map((link, idx) => (
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
              © {currentYear} LAVIE Vapes. Todos los derechos reservados.
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                Política de Cookies
              </a>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-purple-500/10 text-center">
            <p className="text-gray-500 text-xs">
              Este sitio web es solo para mayores de 18 años. Los productos de vapeo contienen nicotina, 
              una sustancia química adictiva.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}