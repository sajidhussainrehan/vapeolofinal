import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ShoppingCart,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Package,
  CheckCircle,
  X,
  Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";

interface Sale {
  id: string;
  affiliateId?: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  discount?: string;
  totalAmount: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status: string;
  createdAt: string;
}

export default function AdminSales() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');

  // Redirect if not logged in
  if (!user) {
    setLocation("/admin/login");
    return null;
  }

  const { data: sales, isLoading } = useQuery({
    queryKey: ["/api/admin/sales"],
    queryFn: async () => {
      const response = await fetch("/api/admin/sales", {
        headers: {
          Authorization: token || "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch sales");
      }
      const result = await response.json();
      return result.data as Sale[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/sales/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update sale status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({
        title: "Estado actualizado",
        description: "El estado de la venta se ha actualizado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la venta",
        variant: "destructive",
      });
    },
  });

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400">Pendiente</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-500/10 text-green-400">Completada</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="bg-red-500/10 text-red-400">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const sortedSales = sales?.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'amount':
        return parseFloat(b.totalAmount) - parseFloat(a.totalAmount);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const totalRevenue = sales?.reduce((sum, sale) => {
    if (sale.status === 'completed') {
      return sum + parseFloat(sale.totalAmount);
    }
    return sum;
  }, 0) || 0;

  const completedSales = sales?.filter(sale => sale.status === 'completed').length || 0;
  const pendingSales = sales?.filter(sale => sale.status === 'pending').length || 0;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/admin")}
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Gestión de Ventas</h1>
              <p className="text-gray-400">Revisar y gestionar todas las ventas</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AdminProfileDropdown />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gray-900 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Ventas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="stat-total-sales">
                {sales?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Ventas Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="stat-completed-sales">
                {completedSales}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="stat-revenue">
                Q{totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sorting Options */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={sortBy === 'date' ? 'default' : 'outline'}
            onClick={() => setSortBy('date')}
            size="sm"
            className={sortBy === 'date' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10'}
            data-testid="sort-date"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Por Fecha
          </Button>
          <Button
            variant={sortBy === 'amount' ? 'default' : 'outline'}
            onClick={() => setSortBy('amount')}
            size="sm"
            className={sortBy === 'amount' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10'}
            data-testid="sort-amount"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Por Monto
          </Button>
          <Button
            variant={sortBy === 'status' ? 'default' : 'outline'}
            onClick={() => setSortBy('status')}
            size="sm"
            className={sortBy === 'status' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10'}
            data-testid="sort-status"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Por Estado
          </Button>
        </div>

        {/* Sales List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-gray-900 border-purple-500/20">
                <CardHeader>
                  <Skeleton className="h-6 w-48 bg-gray-800" />
                  <Skeleton className="h-4 w-32 bg-gray-800" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 bg-gray-800" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSales?.length === 0 ? (
              <Card className="bg-gray-900 border-purple-500/20">
                <CardContent className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No hay ventas registradas</h3>
                  <p className="text-gray-400">Las ventas aparecerán aquí cuando se realicen</p>
                </CardContent>
              </Card>
            ) : (
              sortedSales?.map((sale) => (
                <Card key={sale.id} className="bg-gray-900 border-purple-500/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Package className="w-5 h-5 text-purple-400" />
                          Venta #{sale.id.slice(-8)}
                          {getStatusBadge(sale.status)}
                        </CardTitle>
                        <div className="text-sm text-gray-400 mt-2 space-y-1">
                          {sale.customerName && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Cliente: {sale.customerName}
                            </div>
                          )}
                          {sale.customerPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {sale.customerPhone}
                            </div>
                          )}
                          {sale.customerEmail && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {sale.customerEmail}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm")}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          Q{parseFloat(sale.totalAmount).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {sale.quantity} unidad{sale.quantity !== 1 ? 'es' : ''}
                        </div>
                        {sale.discount && parseFloat(sale.discount) > 0 && (
                          <div className="text-sm text-green-400">
                            Descuento: {sale.discount}%
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3 flex-wrap">
                      {sale.status === "pending" && (
                        <>
                          <Button
                            onClick={() => handleUpdateStatus(sale.id, "completed")}
                            disabled={updateStatusMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                            data-testid={`button-complete-${sale.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marcar Completada
                          </Button>
                          <Button
                            onClick={() => handleUpdateStatus(sale.id, "cancelled")}
                            disabled={updateStatusMutation.isPending}
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            size="sm"
                            data-testid={`button-cancel-${sale.id}`}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                        </>
                      )}
                      {sale.status === "completed" && (
                        <Button
                          onClick={() => handleUpdateStatus(sale.id, "pending")}
                          disabled={updateStatusMutation.isPending}
                          variant="outline"
                          className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                          size="sm"
                          data-testid={`button-revert-${sale.id}`}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Marcar Pendiente
                        </Button>
                      )}
                      {sale.status === "cancelled" && (
                        <Button
                          onClick={() => handleUpdateStatus(sale.id, "pending")}
                          disabled={updateStatusMutation.isPending}
                          variant="outline"
                          className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                          size="sm"
                          data-testid={`button-restore-${sale.id}`}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Restaurar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}