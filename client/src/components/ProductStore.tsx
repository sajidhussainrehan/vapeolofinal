import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import FlavorSelector from '@/components/FlavorSelector'
import cubeImage from '@assets/generated_images/CUBE_vape_product_image_0a8cd099.png'
import energyImage from '@assets/generated_images/ENERGY_vape_product_image_9b09255c.png'

export default function ProductStore() {
  const { getCartCount } = useCart()

  const products = [
    {
      id: 'cyber',
      name: 'CYBER',
      puffs: '20,000 Puffs',
      price: 'Q240',
      image: '/placeholder-vape-cyber.png', // Using placeholder since image generation failed
      sabores: ['Mango Ice', 'Blueberry', 'Cola', 'Grape', 'Sandía Chill'],
      popular: true
    },
    {
      id: 'cube',
      name: 'CUBE', 
      puffs: '20,000 Puffs',
      price: 'Q220',
      image: cubeImage,
      sabores: ['Strawberry Kiwi', 'Menta', 'Cola', 'Frutas Tropicales', 'Piña']
    },
    {
      id: 'energy',
      name: 'ENERGY',
      puffs: '15,000 Puffs', 
      price: 'Q170',
      image: energyImage,
      sabores: ['Blue Razz', 'Mango Chill', 'Fresa', 'Cereza', 'Uva']
    },
    {
      id: 'torch',
      name: 'TORCH',
      puffs: '6,000 Puffs',
      price: 'Q125', 
      image: '/placeholder-vape-torch.png', // Using placeholder since image generation failed
      sabores: ['Menta', 'Banana Ice', 'Frutos Rojos', 'Chicle', 'Limonada']
    },
    {
      id: 'bar',
      name: 'BAR',
      puffs: '800 Puffs',
      price: 'Q65',
      image: '/placeholder-vape-bar.png', // Using placeholder since image generation failed 
      sabores: ['Sandía', 'Uva', 'Cola', 'Mango', 'Piña Colada']
    }
  ]


  return (
    <section id="productos" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Tienda Online
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Descubre nuestra línea completa de vapes premium
          </p>
        </div>

        {/* Products Grid */}
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
                  {product.image.startsWith('/placeholder') ? (
                    <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{product.name}</span>
                    </div>
                  ) : (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                    />
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
                    <div className="text-2xl font-black text-green-400">{product.price}</div>
                  </div>
                </div>

                {/* Sabores */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-2">Sabores disponibles:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.sabores.slice(0, 3).map((sabor, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                        {sabor}
                      </Badge>
                    ))}
                    {product.sabores.length > 3 && (
                      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                        +{product.sabores.length - 3} más
                      </Badge>
                    )}
                  </div>
                </div>

                <FlavorSelector product={product} />
              </CardContent>
            </Card>
          ))}
        </div>

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