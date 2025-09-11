import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, ShoppingCart, Loader2, AlertCircle } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useDistributor } from '@/contexts/DistributorContext'
import FlavorSelector from '@/components/FlavorSelector'
import { useQuery } from '@tanstack/react-query'
import type { Product, ProductFlavor } from '@shared/schema'
import { getFlavorAvailableInventory, isFlavorOutOfStock } from '@shared/schema'
import barImage from '@assets/BAR (1)_1757558165026.png'
import cubeImage from '@assets/CUBE_1757558165026.png'
import cyberImage from '@assets/CYBER_1757558165027.png'
import energyImage from '@assets/ENERGY_1757558165028.png'
import torchImage from '@assets/TORCH (1)_1757558165028.png'

// Image mapping for products from database
const imageMapping: Record<string, string> = {
  'CYBER_1757558165027.png': cyberImage,
  'CUBE_1757558165026.png': cubeImage,
  'ENERGY_1757558165028.png': energyImage,
  'TORCH (1)_1757558165028.png': torchImage,
  'BAR (1)_1757558165026.png': barImage,
};

// Transform database product for display
function transformProduct(product: Product & { flavors?: ProductFlavor[] }) {
  // For backward compatibility, use sabores if no flavors are present
  const flavors = product.flavors && product.flavors.length > 0 
    ? product.flavors
    : product.sabores?.map(saborName => ({ 
        id: `legacy-${saborName}`,
        name: saborName, 
        active: true, 
        inventory: 999, 
        reservedInventory: 0,
        productId: product.id,
        lowStockThreshold: 5,
        createdAt: new Date()
      } as ProductFlavor)) || [];
  
  // Get available flavors (not out of stock) - but only filter for inventory if using new flavor system
  const availableFlavors = product.flavors && product.flavors.length > 0
    ? flavors.filter(flavor => flavor.active && !isFlavorOutOfStock(flavor))
    : flavors.filter(flavor => flavor.active); // For legacy, all active flavors are available

  // Handle image paths - support both uploaded images and legacy static imports
  let imageSrc = '';
  if (product.image) {
    if (product.image.startsWith('products/')) {
      // This is an uploaded image, serve from uploads directory
      imageSrc = `/uploads/${product.image}`;
    } else {
      // This is a legacy image, use the mapping
      imageSrc = imageMapping[product.image] || '';
    }
  }

  return {
    id: product.id,
    name: product.name,
    puffs: `${product.puffs.toLocaleString()} Puffs`, // Format number with commas
    price: `Q${Math.round(parseFloat(product.price))}`, // Add Q prefix and round
    image: imageSrc,
    sabores: product.sabores, // Keep for backward compatibility
    flavors: flavors, // New flavor structure with inventory
    availableFlavors: availableFlavors, // Only flavors that can be selected
    popular: product.popular,
    originalPrice: parseFloat(product.price), // Keep original for calculations
    hasFlavorInventory: product.flavors && product.flavors.length > 0 // Flag to indicate if using flavor-level inventory
  };
}

export default function ProductStore() {
  const { getCartCount } = useCart()
  const { distributor } = useDistributor()

  // Fetch products from API
  const { data: productsResponse, isLoading, error } = useQuery<{success: boolean; data: (Product & { flavors?: ProductFlavor[] })[]}>({
    queryKey: ['/api/products'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform products for display
  const products = productsResponse?.data?.map((product: Product) => transformProduct(product)) || [];


  return (
    <section id="productos" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Ordena Online
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Descubre nuestra línea completa de vapes premium
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20" data-testid="loading-products">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400 mb-4" />
            <p className="text-xl text-gray-300">Cargando productos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20" data-testid="error-products">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-xl text-red-300 mb-2">Error al cargar productos</p>
            <p className="text-gray-400">Por favor, intenta recargar la página</p>
          </div>
        )}

        {/* No Products State */}
        {!isLoading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20" data-testid="no-products">
            <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-xl text-gray-300 mb-2">No hay productos disponibles</p>
            <p className="text-gray-400">Vuelve pronto para ver nuestros productos</p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card 
              key={product.id}
              className="bg-black/60 border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 overflow-hidden hover-elevate"
              data-testid={`card-product-${product.id}`}
            >
              <div className="relative">
                {product.popular && (
                  <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-purple-500 to-pink-500">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
                
                <div className="aspect-square bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center p-8">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                      data-testid={`img-product-${product.id}`}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-700/50 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">{product.name}</h3>
                    <p className="text-purple-300 font-medium">{product.puffs}</p>
                  </div>
                  <div className="text-right">
                    {distributor ? (
                      <div className="space-y-1">
                        <div className="text-sm text-gray-400 line-through">
                          Público: {product.price}
                        </div>
                        <div className="text-2xl font-black text-green-400">
                          Q{(product.originalPrice * (1 - parseFloat(distributor.discount) / 100)).toFixed(0)}
                        </div>
                        <div className="text-xs text-purple-300">
                          {distributor.discount}% desc.
                        </div>
                      </div>
                    ) : (
                      <div className="text-2xl font-black text-green-400">{product.price}</div>
                    )}
                  </div>
                </div>

                {/* Sabores */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-2">Sabores disponibles:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.availableFlavors.slice(0, 3).map((flavor, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                        {flavor.name}
                      </Badge>
                    ))}
                    {product.availableFlavors.length > 3 && (
                      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                        +{product.availableFlavors.length - 3} más
                      </Badge>
                    )}
                    {product.availableFlavors.length === 0 && product.hasFlavorInventory && (
                      <Badge variant="outline" className="text-xs border-red-500/30 text-red-300">
                        Sin sabores disponibles
                      </Badge>
                    )}
                  </div>
                </div>

                <FlavorSelector product={product} />
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {/* Cart Summary */}
        {getCartCount() > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center bg-purple-600/20 border border-purple-500/30 rounded-lg px-6 py-3">
              <ShoppingCart className="mr-2 h-5 w-5 text-purple-400" />
              <span className="text-white">
                {getCartCount()} producto{getCartCount() !== 1 ? 's' : ''} en el carrito
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}