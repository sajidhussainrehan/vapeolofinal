import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, ShoppingCart, User, X, Loader2 } from 'lucide-react'
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
  const { data: homepageContent, isLoading } = useQuery<HomepageContentResponse>({
    queryKey: ['/api/homepage-content'],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })

  // Parse navigation content from database
  let navigationData: NavigationContent | null = null;
  try {
    if (homepageContent && 'success' in homepageContent && homepageContent.data?.navigation?.content) {
      navigationData = JSON.parse(homepageContent.data.navigation.content);
    }
  } catch (error) {
    console.error('Error parsing navigation content:', error);
  }

  const content = homepageContent && 'success' in homepageContent ? homepageContent.data?.navigation : null;

  // Show loading state
  if (isLoading) {
    return (
      <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-16">
            <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
            <span className="text-gray-400 ml-2">Cargando navegación...</span>
          </div>
        </div>
      </header>
    );
  }

  // Show minimal header if no content is available
  if (!content || !navigationData) {
    return (
      <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img 
                src={vapeologyLogo} 
                alt="VAPEOLO" 
                className="h-14 w-auto"
                data-testid="img-vapeolo-logo"
              />
            </div>
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
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-sm"
              >
                Recargar
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-purple-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - DYNAMIC ALT TEXT */}
          <div className="flex items-center space-x-2">
            <img 
              src={vapeologyLogo} 
              alt={navigationData.logoAlt} 
              className="h-14 w-auto"
              data-testid="img-vapeolo-logo"
            />
          </div>

          {/* Desktop Navigation - COMPLETELY DYNAMIC */}
          <nav className="hidden lg:flex items-center space-x-8">
            {Object.entries(navigationData.menuItems).map(([key, label], idx) => {
              const urlMap: Record<string, string> = {
                inicio: '#inicio',
                productos: '#productos', 
                afiliados: '#afiliados',
                contacto: '#contacto'
              };
              return (
                <a 
                  key={idx}
                  href={urlMap[key] || '#'} 
                  className="text-gray-300 hover:text-purple-400 transition-colors"
                  data-testid={`link-menu-${idx}`}
                >
                  {label}
                </a>
              );
            })}
          </nav>

          {/* Action Buttons - DYNAMIC TOOLTIPS/LABELS */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="relative border-purple-500/30 hover:border-purple-400 text-white hover:text-white"
              onClick={openCart}
              data-testid="button-cart"
              title={navigationData.buttons.cart}
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
              title={navigationData.buttons.login}
            >
              <User className="h-4 w-4 text-white" />
            </Button>

            <Button 
              variant="outline" 
              size="icon" 
              className="lg:hidden border-purple-500/30 text-white hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title={navigationData.buttons.mobileMenu}
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? <X className="h-4 w-4 text-white" /> : <Menu className="h-4 w-4 text-white" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu - COMPLETELY DYNAMIC */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-purple-500/20">
            <nav className="flex flex-col space-y-4">
              {Object.entries(navigationData.menuItems).map(([key, label], idx) => {
                const urlMap: Record<string, string> = {
                  inicio: '#inicio',
                  productos: '#productos', 
                  afiliados: '#afiliados',
                  contacto: '#contacto'
                };
                return (
                  <a 
                    key={idx}
                    href={urlMap[key] || '#'} 
                    className="text-gray-300 hover:text-purple-400 transition-colors py-2"
                    data-testid={`link-mobile-menu-${idx}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </a>
                );
              })}
              <Button 
                variant="outline" 
                className="w-full border-purple-500/30 hover:border-purple-400 text-white hover:text-white"
                onClick={() => {
                  setIsMenuOpen(false);
                  distributor ? setLocation('/distributor/dashboard') : setLocation('/distributor/login');
                }}
                data-testid="button-mobile-login"
              >
                <User className="h-4 w-4 mr-2 text-white" />
                {navigationData.buttons.login}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}