import { useDistributor } from '@/contexts/DistributorContext'
import { useLocation } from 'wouter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut, User, Percent, DollarSign, Store } from 'lucide-react'

export default function DistributorDashboard() {
  const { distributor, logout } = useDistributor()
  const [, setLocation] = useLocation()

  if (!distributor) {
    setLocation('/distributor/login')
    return null
  }

  const handleLogout = () => {
    logout()
    setLocation('/')
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'socio':
        return 'from-yellow-500 to-orange-500'
      case 'distribuidor':
        return 'from-blue-500 to-purple-500'
      case 'agente':
        return 'from-green-500 to-teal-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getLevelName = (level: string) => {
    switch (level) {
      case 'socio':
        return 'Socio'
      case 'distribuidor':
        return 'Distribuidor'
      case 'agente':
        return 'Agente'
      default:
        return level
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-black/60 border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Store className="h-8 w-8 text-purple-400" />
                <h1 className="text-2xl font-black text-white">
                  <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    VAPEOLO
                  </span>
                </h1>
              </div>
              <div className="text-gray-400">|</div>
              <div>
                <p className="text-sm text-gray-400">Panel de</p>
                <p className="text-white font-bold">{getLevelName(distributor.level)}</p>
              </div>
            </div>
            
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:text-red-300"
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            ¡Bienvenido, {distributor.name}!
          </h2>
          <p className="text-gray-400">
            Accede a precios preferenciales y gestiona tus pedidos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Level Card */}
          <Card className="bg-black/60 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Nivel de Afiliación
              </CardTitle>
              <User className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge className={`bg-gradient-to-r ${getLevelColor(distributor.level)} text-white`}>
                  {getLevelName(distributor.level)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Discount Card */}
          <Card className="bg-black/60 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Tu Descuento
              </CardTitle>
              <Percent className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {distributor.discount}%
              </div>
              <p className="text-xs text-gray-400">
                Sobre precio público
              </p>
            </CardContent>
          </Card>

          {/* Minimum Purchase Card */}
          <Card className="bg-black/60 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Compra Mínima
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                Q{distributor.minimumPurchase}
              </div>
              <p className="text-xs text-gray-400">
                Pedido mínimo requerido
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shop Products */}
          <Card className="bg-black/60 border-purple-500/20 hover-elevate">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Store className="h-5 w-5" />
                Ver Productos
              </CardTitle>
              <CardDescription className="text-gray-400">
                Explora nuestro catálogo con precios preferenciales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => setLocation('/?distributor=true')}
                data-testid="button-view-products"
              >
                Ir a la Tienda
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="bg-black/60 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Información de Cuenta
              </CardTitle>
              <CardDescription className="text-gray-400">
                Detalles de tu membresía
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-gray-400 text-sm">Email:</span>
                <p className="text-white">{distributor.email}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Teléfono:</span>
                <p className="text-white">{distributor.phone}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Estado:</span>
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  {distributor.status === 'approved' ? 'Aprobado' : distributor.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}