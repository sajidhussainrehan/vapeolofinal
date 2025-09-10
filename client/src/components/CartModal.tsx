import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Minus, Plus, Trash2, ShoppingBag, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function CartModal() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartCount,
    isCartOpen, 
    closeCart 
  } = useCart()

  const total = getCartTotal()
  const itemCount = getCartCount()

  const handleCheckout = () => {
    alert(`¡Gracias por tu compra! Total: Q${total.toFixed(2)}\n\nSerás redirigido a WhatsApp para completar tu pedido.`)
    // Here you would typically integrate with a payment provider or WhatsApp API
    const message = `¡Hola! Quiero hacer un pedido:\n\n${cart.map(item => 
      `• ${item.name} (${item.puffs}) x${item.quantity} = Q${(parseFloat(item.price.replace('Q', '')) * item.quantity).toFixed(2)}`
    ).join('\n')}\n\nTotal: Q${total.toFixed(2)}`
    
    const whatsappUrl = `https://wa.me/50212345678?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    clearCart()
    closeCart()
  }

  return (
    <Dialog open={isCartOpen} onOpenChange={closeCart}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-black/95 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            <ShoppingBag className="mr-2 h-6 w-6 text-purple-400" />
            Tu Carrito ({itemCount} {itemCount === 1 ? 'artículo' : 'artículos'})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-400 text-lg">Tu carrito está vacío</p>
              <p className="text-gray-500 text-sm">Agrega algunos productos para comenzar</p>
              <Button 
                onClick={closeCart}
                className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Continuar comprando
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <Card key={item.id} className="bg-gray-900/50 border-purple-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.image.startsWith('/placeholder') ? (
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-xs">{item.name}</span>
                            </div>
                          ) : (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-12 h-12 object-contain"
                            />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h4 className="text-white font-bold">{item.name}</h4>
                          <p className="text-purple-300 text-sm">{item.puffs}</p>
                          <p className="text-green-400 font-bold">{item.price}</p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-purple-500/30 text-white hover:text-white"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="text-white font-bold min-w-[2rem] text-center" data-testid={`quantity-${item.id}`}>
                            {item.quantity}
                          </span>
                          
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-purple-500/30 text-white hover:text-white"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right min-w-[4rem]">
                          <p className="text-green-400 font-bold">
                            Q{(parseFloat(item.price.replace('Q', '')) * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 border-red-500/30 text-red-400 hover:text-red-300 hover:border-red-400/50"
                          onClick={() => removeFromCart(item.id)}
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Cart Summary */}
              <Card className="bg-purple-900/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Resumen del pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-white">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? 'artículo' : 'artículos'})</span>
                    <span>Q{total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-white">
                    <span>Envío</span>
                    <span className="text-green-400">Gratis</span>
                  </div>
                  
                  <div className="border-t border-purple-500/30 pt-4">
                    <div className="flex justify-between text-xl font-bold text-white">
                      <span>Total</span>
                      <span className="text-green-400">Q{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold"
                      onClick={handleCheckout}
                      data-testid="button-checkout"
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Finalizar Compra - Q{total.toFixed(2)}
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline"
                        className="flex-1 border-purple-500/30 text-white hover:text-white"
                        onClick={closeCart}
                        data-testid="button-continue-shopping"
                      >
                        Continuar comprando
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="flex-1 border-red-500/30 text-red-400 hover:text-red-300"
                        onClick={clearCart}
                        data-testid="button-clear-cart"
                      >
                        Vaciar carrito
                      </Button>
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-400">
                    <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                      Envío gratis en toda Guatemala
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}