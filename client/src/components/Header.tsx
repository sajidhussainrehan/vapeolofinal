import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, ShoppingCart, User, X } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { getCartCount, openCart } = useCart()

  return (
    <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-purple-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent font-mono">
              VAPEOLO
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#inicio" className="text-gray-300 hover:text-purple-400 transition-colors">
              Inicio
            </a>
            <a href="#productos" className="text-gray-300 hover:text-purple-400 transition-colors">
              Productos
            </a>
            <a href="#afiliados" className="text-gray-300 hover:text-purple-400 transition-colors">
              Afiliados
            </a>
            <a href="#contacto" className="text-gray-300 hover:text-purple-400 transition-colors">
              Contacto
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="relative border-purple-500/30 hover:border-purple-400 text-white hover:text-white"
              onClick={openCart}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-4 w-4 text-white" />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Button>
            
            <Button variant="outline" size="icon" className="hidden lg:flex border-purple-500/30 hover:border-purple-400 text-white hover:text-white">
              <User className="h-4 w-4 text-white" />
            </Button>

            <Button 
              variant="outline" 
              size="icon" 
              className="lg:hidden border-purple-500/30 text-white hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4 text-white" /> : <Menu className="h-4 w-4 text-white" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-purple-500/20">
            <nav className="flex flex-col space-y-4">
              <a href="#inicio" className="text-gray-300 hover:text-purple-400 transition-colors py-2">
                Inicio
              </a>
              <a href="#productos" className="text-gray-300 hover:text-purple-400 transition-colors py-2">
                Productos
              </a>
              <a href="#afiliados" className="text-gray-300 hover:text-purple-400 transition-colors py-2">
                Afiliados
              </a>
              <a href="#contacto" className="text-gray-300 hover:text-purple-400 transition-colors py-2">
                Contacto
              </a>
              <Button variant="outline" className="w-full border-purple-500/30 hover:border-purple-400 text-white hover:text-white">
                <User className="h-4 w-4 mr-2 text-white" />
                Iniciar Sesión
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}