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
  MessageSquare,
  User,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  MessageCircle,
  CheckCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminMessages() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'name'>('date');
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  // Redirect if not logged in
  if (!user) {
    setLocation("/admin/login");
    return null;
  }

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/admin/messages"],
    queryFn: async () => {
      const response = await fetch("/api/admin/messages", {
        headers: {
          Authorization: token || "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const result = await response.json();
      return result.data as ContactMessage[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/messages/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update message status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({
        title: "Estado actualizado",
        description: "El estado del mensaje se ha actualizado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del mensaje",
        variant: "destructive",
      });
    },
  });

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleToggleExpand = (messageId: string, currentStatus: string) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
    
    // Auto-mark as read when expanding unread messages
    if (expandedMessage !== messageId && currentStatus === 'unread') {
      handleUpdateStatus(messageId, 'read');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <Badge variant="secondary" className="bg-red-500/10 text-red-400">No leído</Badge>;
      case "read":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">Leído</Badge>;
      case "replied":
        return <Badge variant="secondary" className="bg-green-500/10 text-green-400">Respondido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const sortedMessages = messages?.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'status':
        const statusOrder = { 'unread': 0, 'read': 1, 'replied': 2 };
        return (statusOrder[a.status as keyof typeof statusOrder] || 3) - (statusOrder[b.status as keyof typeof statusOrder] || 3);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const unreadCount = messages?.filter(message => message.status === 'unread').length || 0;
  const readCount = messages?.filter(message => message.status === 'read').length || 0;
  const repliedCount = messages?.filter(message => message.status === 'replied').length || 0;

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
              <h1 className="text-2xl font-bold text-white">Gestión de Mensajes</h1>
              <p className="text-gray-400">Revisar y gestionar mensajes de contacto</p>
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
              <CardTitle className="text-sm font-medium text-white">No Leídos</CardTitle>
              <MessageSquare className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="stat-unread-messages">
                {unreadCount}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Leídos</CardTitle>
              <Eye className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="stat-read-messages">
                {readCount}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Respondidos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="stat-replied-messages">
                {repliedCount}
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
            variant={sortBy === 'status' ? 'default' : 'outline'}
            onClick={() => setSortBy('status')}
            size="sm"
            className={sortBy === 'status' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10'}
            data-testid="sort-status"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Por Estado
          </Button>
          <Button
            variant={sortBy === 'name' ? 'default' : 'outline'}
            onClick={() => setSortBy('name')}
            size="sm"
            className={sortBy === 'name' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10'}
            data-testid="sort-name"
          >
            <User className="w-4 h-4 mr-2" />
            Por Nombre
          </Button>
        </div>

        {/* Messages List */}
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
            {sortedMessages?.length === 0 ? (
              <Card className="bg-gray-900 border-purple-500/20">
                <CardContent className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No hay mensajes</h3>
                  <p className="text-gray-400">Los mensajes de contacto aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              sortedMessages?.map((message) => (
                <Card key={message.id} className="bg-gray-900 border-purple-500/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-white flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-purple-400" />
                          {message.name}
                          {getStatusBadge(message.status)}
                        </CardTitle>
                        <div className="text-sm text-gray-400 mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {message.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(message.createdAt), "dd/MM/yyyy HH:mm")}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleExpand(message.id, message.status)}
                        className="text-purple-400 hover:bg-purple-500/10"
                        data-testid={`button-expand-${message.id}`}
                      >
                        {expandedMessage === message.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {expandedMessage === message.id ? 'Ocultar' : 'Ver mensaje'}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {expandedMessage === message.id && (
                    <CardContent>
                      <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                        <p className="text-gray-300 whitespace-pre-wrap">
                          {message.message}
                        </p>
                      </div>
                      
                      <div className="flex gap-3 flex-wrap">
                        {message.status === "unread" && (
                          <Button
                            onClick={() => handleUpdateStatus(message.id, "read")}
                            disabled={updateStatusMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                            data-testid={`button-mark-read-${message.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Marcar como Leído
                          </Button>
                        )}
                        
                        {(message.status === "read" || message.status === "unread") && (
                          <Button
                            onClick={() => handleUpdateStatus(message.id, "replied")}
                            disabled={updateStatusMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                            data-testid={`button-mark-replied-${message.id}`}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Marcar como Respondido
                          </Button>
                        )}
                        
                        {message.status === "replied" && (
                          <Button
                            onClick={() => handleUpdateStatus(message.id, "read")}
                            disabled={updateStatusMutation.isPending}
                            variant="outline"
                            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                            size="sm"
                            data-testid={`button-mark-unresponded-${message.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Marcar como No Respondido
                          </Button>
                        )}
                        
                        {message.status !== "unread" && (
                          <Button
                            onClick={() => handleUpdateStatus(message.id, "unread")}
                            disabled={updateStatusMutation.isPending}
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            size="sm"
                            data-testid={`button-mark-unread-${message.id}`}
                          >
                            <EyeOff className="w-4 h-4 mr-2" />
                            Marcar como No Leído
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}