import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, ShoppingCart, User, X } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useDistributor } from '@/contexts/DistributorContext'
import { useLocation } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { HomepageContentResponse, type NavigationContent } from '@shared/schema'
import vapeologyLogo from '@assets/VAPEOLO(com)LOGO PNG_1757600785076.png'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { getCartCount, openCart } = useCart()
  const { distributor } = useDistributor()
  const [, setLocation] = useLocation()

  // Fetch homepage content for navigation
  const { data: homepageContent } = useQuery<HomepageContentResponse>({
    queryKey: ['/api/homepage-content'],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })

  // Default navigation content as fallback
  const defaultNavigation = {
    logoAlt: 'VAPEOLO',
    menuItems: {
      inicio: 'Inicio',
      productos: 'Productos', 
      afiliados: 'Afiliados',
      contacto: 'Contacto'
    },
    buttons: {
      cart: 'Carrito',
      login: 'Iniciar Sesión',
      mobileMenu: 'Menú'
    }
  }

  // Parse navigation content from CMS or use defaults
  let navigationContent = defaultNavigation
  try {
    const navSection = homepageContent && 'success' in homepageContent && homepageContent.data?.navigation
    if (navSection && 'content' in navSection && navSection.content) {
      const parsedContent = JSON.parse(navSection.content) as NavigationContent
      navigationContent = parsedContent
    }
  } catch {
    // Fallback to default if JSON parsing fails
    navigationContent = defaultNavigation
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-purple-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img 
              src={vapeologyLogo} 
              alt={navigationContent.logoAlt} 
              className="h-14 w-auto"
              data-testid="img-vapeolo-logo"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#inicio" className="text-gray-300 hover:text-purple-400 transition-colors">
              {navigationContent.menuItems.inicio}
            </a>
            <a href="#productos" className="text-gray-300 hover:text-purple-400 transition-colors">
              {navigationContent.menuItems.productos}
            </a>
            <a href="/affiliates" className="text-gray-300 hover:text-purple-400 transition-colors">
              {navigationContent.menuItems.afiliados}
            </a>
            <a href="#contacto" className="text-gray-300 hover:text-purple-400 transition-colors">
              {navigationContent.menuItems.contacto}
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
            
            <Button 
              variant="outline" 
              size="icon" 
              className="hidden lg:flex border-purple-500/30 hover:border-purple-400 text-white hover:text-white"
              onClick={() => distributor ? setLocation('/distributor/dashboard') : setLocation('/distributor/login')}
              data-testid="button-distributor"
            >
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
                {navigationContent.menuItems.inicio}
              </a>
              <a href="#productos" className="text-gray-300 hover:text-purple-400 transition-colors py-2">
                {navigationContent.menuItems.productos}
              </a>
              <a href="/affiliates" className="text-gray-300 hover:text-purple-400 transition-colors py-2">
                {navigationContent.menuItems.afiliados}
              </a>
              <a href="#contacto" className="text-gray-300 hover:text-purple-400 transition-colors py-2">
                {navigationContent.menuItems.contacto}
              </a>
              <Button variant="outline" className="w-full border-purple-500/30 hover:border-purple-400 text-white hover:text-white">
                <User className="h-4 w-4 mr-2 text-white" />
                {navigationContent.buttons.login}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}