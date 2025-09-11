import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Save,
  Eye,
  Edit3,
  Layout,
  Users,
  MessageSquare,
  Phone,
  Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  type HomepageContent,
  updateHomepageContentSchema,
  type UpdateHomepageContent
} from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function AdminHomepage() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Redirect if not logged in
  if (!user) {
    setLocation("/admin/login");
    return null;
  }

  const { data: homepageContent, isLoading } = useQuery({
    queryKey: ["/api/admin/homepage-content"],
    queryFn: async () => {
      const response = await fetch("/api/admin/homepage-content", {
        headers: {
          Authorization: token || "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch homepage content");
      }
      const result = await response.json();
      return result.data as HomepageContent[];
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ section, data }: { section: string; data: UpdateHomepageContent }) => {
      const response = await fetch(`/api/admin/homepage-content/${section}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update content");
      }
      return response.json();
    },
    onSuccess: (_, { section }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/homepage-content"] });
      setEditingSection(null);
      toast({
        title: "Contenido actualizado",
        description: `La sección ${section} se ha actualizado correctamente`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el contenido",
        variant: "destructive",
      });
    },
  });

  const getContentBySection = (section: string): HomepageContent | undefined => {
    return homepageContent?.find(content => content.section === section);
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "hero": return Layout;
      case "about": return Users;
      case "testimonials": return MessageSquare;
      case "contact": return Phone;
      default: return Edit3;
    }
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case "hero": return "Sección Hero";
      case "about": return "Sección Acerca de";
      case "testimonials": return "Sección Testimonios";
      case "contact": return "Sección Contacto";
      default: return section;
    }
  };

  const getSectionDescription = (section: string) => {
    switch (section) {
      case "hero": return "Edita el título principal, subtítulo y botones de llamada a la acción";
      case "about": return "Gestiona el contenido de la sección 'Quiénes somos'";
      case "testimonials": return "Configura el título y subtítulo de la sección de testimonios";
      case "contact": return "Personaliza el título y subtítulo de la sección de contacto";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/admin")}
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
            <Separator orientation="vertical" className="h-6 bg-purple-500/20" />
            <div>
              <h1 className="text-2xl font-bold text-white">Contenido de Homepage</h1>
              <p className="text-gray-400">Gestiona el contenido de todas las secciones</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-gray-900 border-purple-500/20">
                <CardHeader>
                  <Skeleton className="h-6 w-48 bg-gray-800" />
                  <Skeleton className="h-4 w-96 bg-gray-800" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full bg-gray-800" />
                    <Skeleton className="h-10 w-full bg-gray-800" />
                    <Skeleton className="h-24 w-full bg-gray-800" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {["hero", "about", "testimonials", "contact"].map((section) => (
              <ContentSectionCard
                key={section}
                section={section}
                content={getContentBySection(section)}
                isEditing={editingSection === section}
                onEdit={() => setEditingSection(section)}
                onCancel={() => setEditingSection(null)}
                onSave={(data) => updateContentMutation.mutate({ section, data })}
                isLoading={updateContentMutation.isPending}
                getSectionIcon={getSectionIcon}
                getSectionTitle={getSectionTitle}
                getSectionDescription={getSectionDescription}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ContentSectionCardProps {
  section: string;
  content: HomepageContent | undefined;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: UpdateHomepageContent) => void;
  isLoading: boolean;
  getSectionIcon: (section: string) => any;
  getSectionTitle: (section: string) => string;
  getSectionDescription: (section: string) => string;
}

function ContentSectionCard({
  section,
  content,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isLoading,
  getSectionIcon,
  getSectionTitle,
  getSectionDescription
}: ContentSectionCardProps) {
  const Icon = getSectionIcon(section);
  
  const form = useForm<UpdateHomepageContent>({
    resolver: zodResolver(updateHomepageContentSchema),
    defaultValues: {
      title: content?.title || "",
      subtitle: content?.subtitle || "",
      description: content?.description || "",
      buttonText: content?.buttonText || "",
      buttonUrl: content?.buttonUrl || "",
      active: content?.active ?? true,
    },
  });

  // Reset form when content changes or editing starts
  useState(() => {
    if (content) {
      form.reset({
        title: content.title || "",
        subtitle: content.subtitle || "",
        description: content.description || "",
        buttonText: content.buttonText || "",
        buttonUrl: content.buttonUrl || "",
        active: content.active ?? true,
      });
    }
  });

  const onSubmit = (data: UpdateHomepageContent) => {
    onSave(data);
  };

  const hasButtonFields = section === "hero";

  return (
    <Card className="bg-gray-900 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">{getSectionTitle(section)}</CardTitle>
              <CardDescription className="text-gray-400">
                {getSectionDescription(section)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                data-testid={`button-edit-${section}`}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="border-gray-500/50 text-gray-400 hover:bg-gray-500/10"
                  data-testid={`button-cancel-${section}`}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  data-testid={`button-save-${section}`}
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            {content ? (
              <>
                <div>
                  <Label className="text-sm font-medium text-gray-300">Título</Label>
                  <p className="text-white mt-1" data-testid={`text-title-${section}`}>
                    {content.title || "Sin título"}
                  </p>
                </div>
                {content.subtitle && (
                  <div>
                    <Label className="text-sm font-medium text-gray-300">Subtítulo</Label>
                    <p className="text-gray-300 mt-1" data-testid={`text-subtitle-${section}`}>
                      {content.subtitle}
                    </p>
                  </div>
                )}
                {content.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-300">Descripción</Label>
                    <p className="text-gray-300 mt-1 whitespace-pre-wrap" data-testid={`text-description-${section}`}>
                      {content.description}
                    </p>
                  </div>
                )}
                {hasButtonFields && content.buttonText && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-300">Texto del Botón</Label>
                      <p className="text-purple-300 mt-1" data-testid={`text-button-text-${section}`}>
                        {content.buttonText}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-300">URL del Botón</Label>
                      <p className="text-blue-300 mt-1" data-testid={`text-button-url-${section}`}>
                        {content.buttonUrl || "Sin URL"}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium text-gray-300">Estado</Label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    content.active 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-red-500/20 text-red-400"
                  }`} data-testid={`status-${section}`}>
                    {content.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No hay contenido para esta sección</p>
                <p className="text-sm text-gray-500 mt-1">Haz clic en "Editar" para agregar contenido</p>
              </div>
            )}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Título *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-gray-800/50 border-purple-500/30 text-white"
                        placeholder="Ingresa el título de la sección"
                        data-testid={`input-title-${section}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Subtítulo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        className="bg-gray-800/50 border-purple-500/30 text-white"
                        placeholder="Ingresa el subtítulo (opcional)"
                        data-testid={`input-subtitle-${section}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        className="bg-gray-800/50 border-purple-500/30 text-white"
                        placeholder="Ingresa la descripción del contenido (opcional)"
                        rows={4}
                        data-testid={`textarea-description-${section}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {hasButtonFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="buttonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Texto del Botón</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            className="bg-gray-800/50 border-purple-500/30 text-white"
                            placeholder="Ej: Ver Productos"
                            data-testid={`input-button-text-${section}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buttonUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">URL del Botón</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            className="bg-gray-800/50 border-purple-500/30 text-white"
                            placeholder="Ej: #productos"
                            data-testid={`input-button-url-${section}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-white">Sección Activa</FormLabel>
                      <div className="text-sm text-gray-400">
                        Determina si esta sección se muestra en el sitio web
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid={`switch-active-${section}`}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}