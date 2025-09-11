import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  UserCheck,
  DollarSign,
  Layout,
  User,
  Settings
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";

export default function AdminDashboard() {
  const { user, logout, token } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not logged in
  if (!user) {
    setLocation("/admin/login");
    return null;
  }

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: token || "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      const result = await response.json();
      return result.data;
    },
  });

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">VAPEOLO Admin</h1>
            <p className="text-gray-400">Panel de Administración</p>
          </div>
          <div className="flex items-center gap-4">
            <AdminProfileDropdown />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Total Afiliados
              </CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16 bg-gray-800" />
              ) : (
                <div className="text-2xl font-bold text-white" data-testid="stat-total-affiliates">
                  {stats?.totalAffiliates || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Afiliados Pendientes
              </CardTitle>
              <UserCheck className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16 bg-gray-800" />
              ) : (
                <div className="text-2xl font-bold text-white" data-testid="stat-pending-affiliates">
                  {stats?.pendingAffiliates || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Total Ventas
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16 bg-gray-800" />
              ) : (
                <div className="text-2xl font-bold text-white" data-testid="stat-total-sales">
                  {stats?.totalSales || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Ingresos Totales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20 bg-gray-800" />
              ) : (
                <div className="text-2xl font-bold text-white" data-testid="stat-total-revenue">
                  Q{parseFloat(stats?.totalRevenue || "0").toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-6">
          <Card className="bg-gray-900 border-purple-500/20 hover-elevate">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-400" />
                Gestionar Afiliados
              </CardTitle>
              <CardDescription className="text-gray-400">
                Aprobar solicitudes y gestionar afiliados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => setLocation("/admin/affiliates")}
                data-testid="button-manage-affiliates"
              >
                Ver Afiliados
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-purple-500/20 hover-elevate">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-400" />
                Gestionar Productos
              </CardTitle>
              <CardDescription className="text-gray-400">
                Agregar y editar productos del catálogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setLocation("/admin/products")}
                data-testid="button-manage-products"
              >
                Ver Productos
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-purple-500/20 hover-elevate">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-blue-400" />
                Gestionar Ventas
              </CardTitle>
              <CardDescription className="text-gray-400">
                Revisar y gestionar ventas realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setLocation("/admin/sales")}
                data-testid="button-manage-sales"
              >
                Ver Ventas
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-purple-500/20 hover-elevate">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-yellow-400" />
                Mensajes
              </CardTitle>
              <CardDescription className="text-gray-400">
                {stats?.unreadMessages ? `${stats.unreadMessages} mensajes sin leer` : "Sin mensajes nuevos"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                onClick={() => setLocation("/admin/messages")}
                data-testid="button-manage-messages"
              >
                Ver Mensajes
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-purple-500/20 hover-elevate">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Layout className="w-5 h-5 mr-2 text-pink-400" />
                Contenido Homepage
              </CardTitle>
              <CardDescription className="text-gray-400">
                Editar títulos, subtítulos y contenido del sitio web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-pink-600 hover:bg-pink-700"
                onClick={() => setLocation("/admin/homepage")}
                data-testid="button-manage-homepage"
              >
                Editar Contenido
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}