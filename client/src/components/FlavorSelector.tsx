import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useDistributor } from '@/contexts/DistributorContext'

interface FlavorSelectorProps {
  product: {
    id: string
    name: string
    price: string
    puffs: string
    image: string
    sabores: string[]
  }
}

export default function FlavorSelector({ product }: FlavorSelectorProps) {
  const [selectedFlavor, setSelectedFlavor] = useState<string>('')
  const { addToCart } = useCart()
  const { distributor } = useDistributor()

  // Calculate the actual price (distributor price if logged in)
  const actualPrice = distributor 
    ? `Q${(parseFloat(product.price.replace('Q', '')) * (1 - parseFloat(distributor.discount) / 100)).toFixed(0)}`
    : product.price

  const handleAddToCart = () => {
    if (!selectedFlavor) {
      alert('Por favor selecciona un sabor antes de agregar al carrito')
      return
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
            {product.sabores.map((sabor) => (
              <SelectItem 
                key={sabor} 
                value={sabor}
                className="text-white hover:bg-purple-600/20 focus:bg-purple-600/20"
                data-testid={`option-flavor-${product.id}-${sabor}`}
              >
                {sabor}
              </SelectItem>
            ))}
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