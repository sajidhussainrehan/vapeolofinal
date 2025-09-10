import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Check, 
  X, 
  Users,
  Mail,
  Phone,
  Calendar,
  DollarSign
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: string;
  discount: string;
  minimumPurchase: string;
  status: string;
  message?: string;
  createdAt: string;
  approvedAt?: string;
}

export default function AdminAffiliates() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not logged in
  if (!user) {
    setLocation("/admin/login");
    return null;
  }

  const { data: affiliates, isLoading } = useQuery({
    queryKey: ["/api/admin/affiliates"],
    queryFn: async () => {
      const response = await fetch("/api/admin/affiliates", {
        headers: {
          Authorization: token || "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch affiliates");
      }
      const result = await response.json();
      return result.data as Affiliate[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/affiliates/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update affiliate status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({
        title: "Estado actualizado",
        description: "El estado del afiliado se ha actualizado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del afiliado",
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
      case "approved":
        return <Badge variant="secondary" className="bg-green-500/10 text-green-400">Aprobado</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-500/10 text-red-400">Rechazado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLevelInfo = (level: string) => {
    switch (level) {
      case "agente":
        return { name: "Agente", discount: "10-12%", minimum: "Q500" };
      case "distribuidor":
        return { name: "Distribuidor", discount: "25-30%", minimum: "Q1,500" };
      case "socio":
        return { name: "Socio", discount: "45-50%", minimum: "Q3,500" };
      default:
        return { name: level, discount: "N/A", minimum: "N/A" };
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
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
            <h1 className="text-2xl font-bold text-white">Gestión de Afiliados</h1>
            <p className="text-gray-400">Aprobar y gestionar solicitudes de afiliación</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
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
          <div className="space-y-6">
            {affiliates?.length === 0 ? (
              <Card className="bg-gray-900 border-purple-500/20">
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No hay afiliados registrados</h3>
                  <p className="text-gray-400">Las solicitudes de afiliación aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              affiliates?.map((affiliate) => {
                const levelInfo = getLevelInfo(affiliate.level);
                return (
                  <Card key={affiliate.id} className="bg-gray-900 border-purple-500/20">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            {affiliate.name}
                            {getStatusBadge(affiliate.status)}
                          </CardTitle>
                          <div className="text-sm text-gray-400 mt-2 space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {affiliate.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {affiliate.phone}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Solicitud: {format(new Date(affiliate.createdAt), "dd/MM/yyyy")}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-2 border-purple-500/50 text-purple-400">
                            {levelInfo.name}
                          </Badge>
                          <div className="text-sm text-gray-400">
                            <div>Descuento: {levelInfo.discount}</div>
                            <div>Mínimo: {levelInfo.minimum}</div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {affiliate.message && (
                        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-300">
                            <strong>Mensaje:</strong> {affiliate.message}
                          </p>
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          Descuento asignado: {affiliate.discount}%
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <DollarSign className="w-4 h-4 text-blue-400" />
                          Compra mínima: Q{affiliate.minimumPurchase}
                        </div>
                      </div>

                      {affiliate.status === "pending" && (
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleUpdateStatus(affiliate.id, "approved")}
                            disabled={updateStatusMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`button-approve-${affiliate.id}`}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Aprobar
                          </Button>
                          <Button
                            onClick={() => handleUpdateStatus(affiliate.id, "rejected")}
                            disabled={updateStatusMutation.isPending}
                            variant="destructive"
                            data-testid={`button-reject-${affiliate.id}`}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      )}

                      {affiliate.approvedAt && (
                        <div className="text-sm text-green-400">
                          ✓ Aprobado el {format(new Date(affiliate.approvedAt), "dd/MM/yyyy")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}