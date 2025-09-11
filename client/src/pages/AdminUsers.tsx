import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  Plus,
  ArrowLeft,
  Edit,
  Lock,
  Shield,
  User,
  Check,
  X,
  MoreHorizontal
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  insertUserSchema,
  updateUserSchema,
  adminResetPasswordSchema,
  type InsertUser,
  type UpdateUser,
  type AdminResetPassword,
  type User as UserType
} from "@shared/schema";

interface UsersResponse {
  success: true;
  data: UserType[];
}

export default function AdminUsers() {
  const { user, logout, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // Redirect if not logged in or not admin
  if (!user) {
    setLocation("/admin/login");
    return null;
  }
  
  if (user.role !== 'admin') {
    setLocation("/admin/dashboard");
    return null;
  }

  // Fetch users list
  const { data: users, isLoading } = useQuery<UsersResponse>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: token || "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return await response.json();
    },
  });

  // Create user form
  const createForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "sales",
      active: true,
    },
  });

  // Edit user form
  const editForm = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      username: "",
      role: "sales",
      active: true,
    },
  });

  // Reset password form
  const passwordForm = useForm<AdminResetPassword>({
    resolver: zodResolver(adminResetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: InsertUser) => apiRequest(`/api/admin/users`, "POST", data),
    onSuccess: () => {
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al crear el usuario",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUser }) => 
      apiRequest(`/api/admin/users/${userId}`, "PATCH", data),
    onSuccess: () => {
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al actualizar el usuario",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AdminResetPassword }) => 
      apiRequest(`/api/admin/users/${userId}/password`, "PATCH", data),
    onSuccess: () => {
      toast({
        title: "Contraseña restablecida",
        description: "La contraseña ha sido restablecida exitosamente",
      });
      setIsPasswordDialogOpen(false);
      setSelectedUser(null);
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al restablecer la contraseña",
      });
    },
  });

  const onCreateSubmit = (data: InsertUser) => {
    createUserMutation.mutate(data);
  };

  const onEditSubmit = (data: UpdateUser) => {
    if (selectedUser) {
      updateUserMutation.mutate({ userId: selectedUser.id, data });
    }
  };

  const onPasswordSubmit = (data: AdminResetPassword) => {
    if (selectedUser) {
      resetPasswordMutation.mutate({ userId: selectedUser.id, data });
    }
  };

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    editForm.reset({
      username: user.username,
      role: user.role,
      active: user.active,
    });
    setIsEditDialogOpen(true);
  };

  const handleResetPassword = (user: UserType) => {
    setSelectedUser(user);
    passwordForm.reset();
    setIsPasswordDialogOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-600' : 'bg-green-600';
  };

  const getStatusBadgeColor = (active: boolean) => {
    return active ? 'bg-green-600' : 'bg-red-600';
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
              <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
              <p className="text-gray-400">Administra usuarios del sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-create-user"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Usuario
            </Button>
            <span className="text-white">Bienvenido, {user.username}</span>
            <Button 
              variant="outline" 
              onClick={() => {
                logout();
                setLocation("/admin/login");
              }}
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              data-testid="button-logout"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Card className="bg-gray-900 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-400" />
              Lista de Usuarios
            </CardTitle>
            <CardDescription className="text-gray-400">
              {users?.data ? `${users.data.length} usuarios registrados` : "Cargando usuarios..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full bg-gray-800" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48 bg-gray-800" />
                      <Skeleton className="h-3 w-32 bg-gray-800" />
                    </div>
                    <div className="ml-auto">
                      <Skeleton className="h-8 w-20 bg-gray-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : users?.data && users.data.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">Usuario</TableHead>
                      <TableHead className="text-gray-400">Rol</TableHead>
                      <TableHead className="text-gray-400">Estado</TableHead>
                      <TableHead className="text-gray-400">Fecha de Creación</TableHead>
                      <TableHead className="text-gray-400 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.data.map((user) => (
                      <TableRow key={user.id} className="border-gray-700" data-testid={`user-row-${user.id}`}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-white" data-testid={`text-username-${user.id}`}>
                                {user.username}
                              </div>
                              <div className="text-xs text-gray-400 font-mono">
                                {user.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`${getRoleBadgeColor(user.role)} text-white`}
                            data-testid={`badge-role-${user.id}`}
                          >
                            {user.role === 'admin' ? (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Administrador
                              </>
                            ) : (
                              <>
                                <User className="w-3 h-3 mr-1" />
                                Ventas
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`${getStatusBadgeColor(user.active)} text-white`}
                            data-testid={`badge-status-${user.id}`}
                          >
                            {user.active ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Activo
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3 mr-1" />
                                Inactivo
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(user.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                data-testid={`button-actions-${user.id}`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="end" 
                              className="bg-gray-800 border-gray-700"
                            >
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user)}
                                className="text-white hover:bg-gray-700 cursor-pointer"
                                data-testid={`menu-edit-${user.id}`}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Usuario
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleResetPassword(user)}
                                className="text-white hover:bg-gray-700 cursor-pointer"
                                data-testid={`menu-password-${user.id}`}
                              >
                                <Lock className="mr-2 h-4 w-4" />
                                Restablecer Contraseña
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No hay usuarios</h3>
                <p className="text-gray-400 mb-4">Comienza creando tu primer usuario</p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Usuario
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2 text-purple-400" />
                Crear Nuevo Usuario
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Crea un nuevo usuario para el sistema
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Nombre de Usuario</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ingresa el nombre de usuario"
                          className="bg-gray-800 border-gray-700 text-white"
                          data-testid="input-create-username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Ingresa la contraseña"
                          className="bg-gray-800 border-gray-700 text-white"
                          data-testid="input-create-password"
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>La contraseña debe contener:</div>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Al menos 8 caracteres</li>
                          <li>Una letra mayúscula y una minúscula</li>
                          <li>Un número y un carácter especial</li>
                        </ul>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Rol</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger 
                            className="bg-gray-800 border-gray-700 text-white"
                            data-testid="select-create-role"
                          >
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="admin" className="text-white hover:bg-gray-700">
                            <div className="flex items-center">
                              <Shield className="w-4 h-4 mr-2 text-purple-400" />
                              Administrador
                            </div>
                          </SelectItem>
                          <SelectItem value="sales" className="text-white hover:bg-gray-700">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-green-400" />
                              Ventas
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-white">
                          Usuario Activo
                        </FormLabel>
                        <div className="text-sm text-gray-400">
                          Determina si el usuario puede acceder al sistema
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-create-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-gray-700 text-gray-400 hover:bg-gray-800"
                    data-testid="button-create-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-create-submit"
                  >
                    {createUserMutation.isPending ? "Creando..." : "Crear Usuario"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Edit className="w-5 h-5 mr-2 text-purple-400" />
                Editar Usuario
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Modifica la información del usuario
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Nombre de Usuario</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ingresa el nombre de usuario"
                          className="bg-gray-800 border-gray-700 text-white"
                          data-testid="input-edit-username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Rol</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger 
                            className="bg-gray-800 border-gray-700 text-white"
                            data-testid="select-edit-role"
                          >
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="admin" className="text-white hover:bg-gray-700">
                            <div className="flex items-center">
                              <Shield className="w-4 h-4 mr-2 text-purple-400" />
                              Administrador
                            </div>
                          </SelectItem>
                          <SelectItem value="sales" className="text-white hover:bg-gray-700">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-green-400" />
                              Ventas
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-white">
                          Usuario Activo
                        </FormLabel>
                        <div className="text-sm text-gray-400">
                          Determina si el usuario puede acceder al sistema
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-edit-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setSelectedUser(null);
                    }}
                    className="border-gray-700 text-gray-400 hover:bg-gray-800"
                    data-testid="button-edit-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateUserMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-edit-submit"
                  >
                    {updateUserMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2 text-purple-400" />
                Restablecer Contraseña
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedUser && `Establece una nueva contraseña para ${selectedUser.username}`}
              </DialogDescription>
            </DialogHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
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
                          placeholder="Ingresa la nueva contraseña"
                          className="bg-gray-800 border-gray-700 text-white"
                          data-testid="input-reset-password"
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>La contraseña debe contener:</div>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Al menos 8 caracteres</li>
                          <li>Una letra mayúscula y una minúscula</li>
                          <li>Un número y un carácter especial</li>
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
                          placeholder="Confirma la nueva contraseña"
                          className="bg-gray-800 border-gray-700 text-white"
                          data-testid="input-confirm-reset-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsPasswordDialogOpen(false);
                      setSelectedUser(null);
                    }}
                    className="border-gray-700 text-gray-400 hover:bg-gray-800"
                    data-testid="button-password-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={resetPasswordMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-password-submit"
                  >
                    {resetPasswordMutation.isPending ? "Restableciendo..." : "Restablecer Contraseña"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}