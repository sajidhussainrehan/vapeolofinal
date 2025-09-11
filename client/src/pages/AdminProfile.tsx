import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Lock, 
  Save,
  ArrowLeft,
  Calendar
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";
import {
  updateSelfProfileSchema,
  changePasswordSchema,
  type UpdateSelfProfile,
  type ChangePassword,
  type User as UserType
} from "@shared/schema";
import { useState } from "react";

export default function AdminProfile() {
  const { user, logout, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Redirect if not logged in
  if (!user) {
    setLocation("/admin/login");
    return null;
  }

  // Fetch current user profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/admin/me"],
    queryFn: async () => {
      const response = await fetch("/api/admin/me", {
        headers: {
          Authorization: token || "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const result = await response.json();
      return result.data as UserType;
    },
  });

  // Profile update form (restricted to username only for security)
  const profileForm = useForm<UpdateSelfProfile>({
    resolver: zodResolver(updateSelfProfileSchema),
    defaultValues: {
      username: profile?.username || "",
    },
  });

  // Password change form
  const passwordForm = useForm<ChangePassword>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateSelfProfile) => apiRequest(`/api/admin/me`, "PATCH", data),
    onSuccess: () => {
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al actualizar el perfil",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePassword) => apiRequest(`/api/admin/me/password`, "PATCH", data),
    onSuccess: () => {
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente",
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al cambiar la contraseña",
      });
    },
  });

  // Update default values when profile data loads
  React.useEffect(() => {
    if (profile) {
      profileForm.reset({
        username: profile.username,
      });
    }
  }, [profile, profileForm]);

  const onProfileSubmit = (data: UpdateSelfProfile) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: ChangePassword) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/admin/dashboard")}
              className="text-purple-400 hover:bg-purple-500/10"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
              <p className="text-gray-400">Gestiona tu información personal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AdminProfileDropdown />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg mb-6">
          <Button
            variant={activeTab === 'profile' ? "default" : "ghost"}
            onClick={() => setActiveTab('profile')}
            className={`flex-1 ${activeTab === 'profile' 
              ? 'bg-purple-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            data-testid="tab-profile"
          >
            <User className="w-4 h-4 mr-2" />
            Información Personal
          </Button>
          <Button
            variant={activeTab === 'password' ? "default" : "ghost"}
            onClick={() => setActiveTab('password')}
            className={`flex-1 ${activeTab === 'password' 
              ? 'bg-purple-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            data-testid="tab-password"
          >
            <Lock className="w-4 h-4 mr-2" />
            Cambiar Contraseña
          </Button>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <Card className="bg-gray-900 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-400" />
                Información del Perfil
              </CardTitle>
              <CardDescription className="text-gray-400">
                Actualiza tu nombre de usuario. Los roles y permisos solo pueden ser modificados por administradores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-24 bg-gray-800" />
                  <Skeleton className="h-10 w-full bg-gray-800" />
                  <Skeleton className="h-4 w-24 bg-gray-800" />
                  <Skeleton className="h-10 w-full bg-gray-800" />
                  <Skeleton className="h-4 w-24 bg-gray-800" />
                  <Skeleton className="h-6 w-12 bg-gray-800" />
                </div>
              ) : (
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    {/* Username field - only editable field for security */}
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Usuario</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nombre de usuario"
                              className="bg-gray-800 border-gray-700 text-white"
                              data-testid="input-username"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Display read-only information */}
                    <div className="space-y-4">
                      <Separator className="bg-gray-700" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <Label className="text-gray-400">Rol</Label>
                          <div className="text-white bg-gray-800 p-2 rounded flex items-center">
                            <User className="w-4 h-4 mr-2 text-green-400" />
                            {profile?.role === 'admin' ? 'Administrador' : 'Ventas'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-400">Estado</Label>
                          <div className={`p-2 rounded flex items-center ${
                            profile?.active 
                              ? 'text-green-400 bg-green-400/10' 
                              : 'text-red-400 bg-red-400/10'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              profile?.active ? 'bg-green-400' : 'bg-red-400'
                            }`}></div>
                            {profile?.active ? 'Activo' : 'Inactivo'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-400">ID de Usuario</Label>
                          <div className="text-white font-mono text-xs bg-gray-800 p-2 rounded">
                            {profile?.id}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-400 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Fecha de Creación
                          </Label>
                          <div className="text-white">
                            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                        data-testid="button-save-profile"
                      >
                        {updateProfileMutation.isPending ? (
                          <>Guardando...</>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Password Change Tab */}
        {activeTab === 'password' && (
          <Card className="bg-gray-900 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lock className="w-5 h-5 mr-2 text-purple-400" />
                Cambiar Contraseña
              </CardTitle>
              <CardDescription className="text-gray-400">
                Actualiza tu contraseña por motivos de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Contraseña Actual</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Ingresa tu contraseña actual"
                            className="bg-gray-800 border-gray-700 text-white"
                            data-testid="input-current-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Nueva Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Ingresa tu nueva contraseña"
                            className="bg-gray-800 border-gray-700 text-white"
                            data-testid="input-new-password"
                          />
                        </FormControl>
                        <FormMessage />
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>La contraseña debe contener:</div>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Al menos 8 caracteres</li>
                            <li>Una letra mayúscula</li>
                            <li>Una letra minúscula</li>
                            <li>Un número</li>
                            <li>Un carácter especial</li>
                          </ul>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Confirmar Nueva Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Confirma tu nueva contraseña"
                            className="bg-gray-800 border-gray-700 text-white"
                            data-testid="input-confirm-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                      data-testid="button-change-password"
                    >
                      {changePasswordMutation.isPending ? (
                        <>Cambiando...</>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Cambiar Contraseña
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}