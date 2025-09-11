import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useDistributor } from '@/contexts/DistributorContext'
import { useToast } from '@/hooks/use-toast'
import type { ProductFlavor } from '@shared/schema'
import { isFlavorOutOfStock, getFlavorAvailableInventory } from '@shared/schema'

interface FlavorSelectorProps {
  product: {
    id: string
    name: string
    price: string
    puffs: string
    image: string
    sabores: string[]
    flavors?: ProductFlavor[]
    availableFlavors?: ProductFlavor[]
    hasFlavorInventory?: boolean
  }
}

export default function FlavorSelector({ product }: FlavorSelectorProps) {
  const [selectedFlavor, setSelectedFlavor] = useState<string>('')
  const { addToCart } = useCart()
  const { distributor } = useDistributor()
  const { toast } = useToast()

  // Calculate the actual price (distributor price if logged in)
  const actualPrice = distributor 
    ? `Q${(parseFloat(product.price.replace('Q', '')) * (1 - parseFloat(distributor.discount) / 100)).toFixed(0)}`
    : product.price

  // Use availableFlavors if present (new system), otherwise fall back to sabores (legacy)
  const flavorsToShow = product.availableFlavors && product.availableFlavors.length > 0
    ? product.availableFlavors
    : product.sabores?.map(saborName => ({ 
        id: `legacy-${saborName}`,
        name: saborName, 
        active: true, 
        inventory: 999, 
        reservedInventory: 0,
        lowStockThreshold: 5,
        createdAt: new Date(),
        productId: product.id
      } as ProductFlavor)) || [];

  const handleAddToCart = () => {
    if (!selectedFlavor) {
      toast.warning('Por favor selecciona un sabor antes de agregar al carrito')
      return
    }

    // For flavor-based inventory, check if selected flavor is still available
    if (product.hasFlavorInventory) {
      const selectedFlavorObj = flavorsToShow.find(f => f.name === selectedFlavor)
      if (selectedFlavorObj && isFlavorOutOfStock(selectedFlavorObj)) {
        toast.error('El sabor seleccionado ya no está disponible. Por favor selecciona otro sabor.')
        setSelectedFlavor('') // Clear invalid selection
        return
      }
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: actualPrice,
      puffs: product.puffs,
      image: product.image,
      flavor: selectedFlavor
    })

    // Reset selection after adding to cart
    setSelectedFlavor('')
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-300 block mb-2">
          Selecciona tu sabor:
        </label>
        <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
          <SelectTrigger 
            className="w-full bg-gray-800/50 border-purple-500/30 text-white"
            data-testid={`select-flavor-${product.id}`}
          >
            <SelectValue placeholder="Elige un sabor..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-purple-500/30">
            {flavorsToShow.map((flavor) => {
              const isOutOfStock = product.hasFlavorInventory ? isFlavorOutOfStock(flavor) : false;
              const availableStock = product.hasFlavorInventory ? getFlavorAvailableInventory(flavor) : null;
              
              return (
                <SelectItem 
                  key={flavor.name} 
                  value={flavor.name}
                  disabled={isOutOfStock}
                  className={`text-white hover:bg-purple-600/20 hover:text-white hover:font-bold focus:bg-purple-600/20 focus:text-white focus:font-bold ${
                    isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  data-testid={`option-flavor-${product.id}-${flavor.name}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span>{flavor.name}</span>
                    {product.hasFlavorInventory && (
                      <span className={`text-xs ml-2 ${
                        isOutOfStock ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {isOutOfStock ? 'Agotado' : 'Disponible'}
                      </span>
                    )}
                  </div>
                </SelectItem>
              );
            })}
            {flavorsToShow.length === 0 && (
              <SelectItem value="" disabled className="text-gray-400">
                No hay sabores disponibles
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <Button 
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        onClick={handleAddToCart}
        data-testid={`button-add-cart-${product.id}`}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Agregar al carrito
      </Button>
    </div>
  )
}