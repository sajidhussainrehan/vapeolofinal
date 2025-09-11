import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, ArrowLeft } from 'lucide-react'

interface CheckoutFormProps {
  total: number
  onSubmit: (customerData: CustomerData) => void
  onBack: () => void
}

export interface CustomerData {
  firstName: string
  lastName: string
  phone: string
  address: string
  department: string
}

const guatemalanDepartments = [
  'Alta Verapaz',
  'Baja Verapaz',
  'Chimaltenango',
  'Chiquimula',
  'El Progreso',
  'Escuintla',
  'Guatemala',
  'Huehuetenango',
  'Izabal',
  'Jalapa',
  'Jutiapa',
  'Petén',
  'Quetzaltenango',
  'Quiché',
  'Retalhuleu',
  'Sacatepéquez',
  'San Marcos',
  'Santa Rosa',
  'Sololá',
  'Suchitepéquez',
  'Totonicapán',
  'Zacapa'
]

export default function CheckoutForm({ total, onSubmit, onBack }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CustomerData>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    department: ''
  })

  const [errors, setErrors] = useState<Partial<CustomerData>>({})

  const validateForm = () => {
    const newErrors: Partial<CustomerData> = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Nombre es requerido'
    if (!formData.lastName.trim()) newErrors.lastName = 'Apellido es requerido'
    if (!formData.phone.trim()) newErrors.phone = 'Número de celular es requerido'
    if (!formData.address.trim()) newErrors.address = 'Dirección es requerida'
    if (!formData.department) newErrors.department = 'Departamento es requerido'

    // Validate phone format (Guatemala format)
    const phoneRegex = /^[0-9]{8}$/
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Formato de teléfono inválido (8 dígitos)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-purple-500/30 text-white hover:text-white"
          data-testid="button-back-to-cart"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al carrito
        </Button>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">
            Total: Q{total.toFixed(2)}
          </div>
        </div>
      </div>

      <Card className="bg-purple-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white text-xl">Información de Entrega</CardTitle>
          <p className="text-gray-400">Complete sus datos para finalizar el pedido</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white">Nombre *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="bg-black/60 border-purple-500/30 text-white"
                  placeholder="Ingresa tu nombre"
                  data-testid="input-first-name"
                />
                {errors.firstName && (
                  <p className="text-red-400 text-sm">{errors.firstName}</p>
                )}
              </div>

              {/* Apellido */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white">Apellido *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="bg-black/60 border-purple-500/30 text-white"
                  placeholder="Ingresa tu apellido"
                  data-testid="input-last-name"
                />
                {errors.lastName && (
                  <p className="text-red-400 text-sm">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Número de Celular *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="bg-black/60 border-purple-500/30 text-white"
                placeholder="Ej: 12345678"
                data-testid="input-phone"
              />
              {errors.phone && (
                <p className="text-red-400 text-sm">{errors.phone}</p>
              )}
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-white">Dirección de Entrega *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="bg-black/60 border-purple-500/30 text-white"
                placeholder="Calle, zona, colonia, referencias"
                data-testid="input-address"
              />
              {errors.address && (
                <p className="text-red-400 text-sm">{errors.address}</p>
              )}
            </div>

            {/* Departamento */}
            <div className="space-y-2">
              <Label htmlFor="department" className="text-white">Departamento *</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => handleInputChange('department', value)}
              >
                <SelectTrigger 
                  className="bg-black/60 border-purple-500/30 text-white"
                  data-testid="select-department"
                >
                  <SelectValue placeholder="Selecciona tu departamento" />
                </SelectTrigger>
                <SelectContent className="bg-black border-purple-500/30 text-white">
                  {guatemalanDepartments.map((dept) => (
                    <SelectItem 
                      key={dept} 
                      value={dept}
                      className="text-white focus:bg-purple-500/20"
                    >
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-red-400 text-sm">{errors.department}</p>
              )}
            </div>

            <div className="pt-4">
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold"
                data-testid="button-complete-order"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Completar Pedido - Q{total.toFixed(2)}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}