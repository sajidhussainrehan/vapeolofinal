import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Lock,
  Users,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import {
  changePasswordSchema,
  type ChangePassword,
} from "@shared/schema";

export default function AdminProfileDropdown() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // Password change form
  const passwordForm = useForm<ChangePassword>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
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
      setIsPasswordDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al cambiar la contraseña",
      });
    },
  });

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  const handlePasswordSubmit = (data: ChangePassword) => {
    changePasswordMutation.mutate(data);
  };

  const handleManageUsers = () => {
    setLocation("/admin/users");
  };

  const handleProfileSettings = () => {
    setLocation("/admin/profile");
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-white hover:bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40"
            data-testid="button-profile-dropdown"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-purple-600 text-white text-sm">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">{user.username}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-gray-900 border-purple-500/20 text-white"
          data-testid="dropdown-profile-content"
        >
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-white">{user.username}</p>
            <p className="text-xs text-gray-400">
              {user.role === 'admin' ? 'Administrador' : 'Ventas'}
            </p>
          </div>
          <DropdownMenuSeparator className="bg-purple-500/20" />
          
          <DropdownMenuItem
            onClick={handleProfileSettings}
            className="text-white hover:bg-purple-500/10 cursor-pointer"
            data-testid="menu-profile-settings"
          >
            <Settings className="mr-2 h-4 w-4" />
            Configuración de Perfil
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setIsPasswordDialogOpen(true)}
            className="text-white hover:bg-purple-500/10 cursor-pointer"
            data-testid="menu-change-password"
          >
            <Lock className="mr-2 h-4 w-4" />
            Cambiar Contraseña
          </DropdownMenuItem>

          {user.role === 'admin' && (
            <DropdownMenuItem
              onClick={handleManageUsers}
              className="text-white hover:bg-purple-500/10 cursor-pointer"
              data-testid="menu-manage-users"
            >
              <Users className="mr-2 h-4 w-4" />
              Gestionar Usuarios
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-purple-500/20" />
          
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-400 hover:bg-red-500/10 cursor-pointer"
            data-testid="menu-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="bg-gray-900 border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2 text-purple-400" />
              Cambiar Contraseña
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Actualiza tu contraseña por motivos de seguridad
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPasswordDialogOpen(false)}
                  className="border-gray-700 text-gray-400 hover:bg-gray-800"
                  data-testid="button-password-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                  data-testid="button-password-submit"
                >
                  {changePasswordMutation.isPending ? "Cambiando..." : "Cambiar Contraseña"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}