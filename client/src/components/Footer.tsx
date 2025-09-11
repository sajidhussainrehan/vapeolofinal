import { Facebook, Instagram, MessageCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { HomepageContentResponse, type FooterContent } from '@shared/schema'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  // Fetch homepage content for footer
  const { data: homepageContent, isLoading } = useQuery<HomepageContentResponse>({
    queryKey: ['/api/homepage-content'],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })

  // Parse footer content from database
  let footerData: FooterContent | null = null;
  try {
    if (homepageContent && 'success' in homepageContent && homepageContent.data?.footer?.content) {
      footerData = JSON.parse(homepageContent.data.footer.content);
    }
  } catch (error) {
    console.error('Error parsing footer content:', error);
  }

  const content = homepageContent && 'success' in homepageContent ? homepageContent.data?.footer : null;

  // Show loading state
  if (isLoading) {
    return (
      <footer className="bg-black border-t border-purple-500/20">
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Cargando información del footer...</p>
        </div>
      </footer>
    );
  }

  // Show error state if no content is available
  if (!content || !footerData) {
    return (
      <footer className="bg-black border-t border-purple-500/20">
        <div className="container mx-auto px-4 py-16 text-center">
          <h3 className="text-white font-bold text-lg mb-4">Footer</h3>
          <p className="text-gray-400 mb-8">
            La información del footer no está disponible en este momento.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Recargar página
          </Button>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-black border-t border-purple-500/20">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column - COMPLETELY DYNAMIC */}
          <div className="lg:col-span-1">
            <div className="text-3xl font-black bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-4 font-mono">
              {footerData.brandName}
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {footerData.brandDescription}
            </p>
            
            {/* Social Links - DYNAMIC FROM DATABASE */}
            <div className="flex space-x-4">
              {footerData.socialLinks.instagram && (
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10"
                  data-testid="button-social-instagram"
                  onClick={() => window.open(footerData.socialLinks.instagram, '_blank')}
                >
                  <Instagram className="h-4 w-4" />
                </Button>
              )}
              {footerData.socialLinks.facebook && (
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border-blue-500/30 hover:border-blue-400 hover:bg-blue-500/10"
                  data-testid="button-social-facebook"
                  onClick={() => window.open(footerData.socialLinks.facebook, '_blank')}
                >
                  <Facebook className="h-4 w-4" />
                </Button>
              )}
              {footerData.socialLinks.tiktok && (
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border-green-500/30 hover:border-green-400 hover:bg-green-500/10"
                  data-testid="button-social-tiktok"
                  onClick={() => window.open(footerData.socialLinks.tiktok, '_blank')}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Dynamic Columns - COMPLETELY FROM DATABASE */}
          {footerData.columns.map((column, columnIdx) => (
            <div key={columnIdx}>
              <h3 className="text-white font-bold text-lg mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <a 
                      href={link.url}
                      className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                      data-testid={`link-column-${columnIdx}-${linkIdx}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Footer - COMPLETELY DYNAMIC */}
        <div className="py-8 border-t border-purple-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              {footerData.copyright.replace('{currentYear}', currentYear.toString()).replace('$currentYear', currentYear.toString())}
            </div>
            
            {/* Dynamic Legal Links */}
            <div className="flex flex-wrap gap-6 text-sm">
              {footerData.legalLinks.map((link, idx) => (
                <a 
                  key={idx} 
                  href={link.url} 
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                  data-testid={`link-legal-${idx}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Additional Info - DYNAMIC AGE NOTICE */}
          <div className="mt-6 pt-6 border-t border-purple-500/10 text-center">
            <p className="text-gray-500 text-xs">
              {footerData.ageNotice}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}