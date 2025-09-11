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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Save,
  Eye,
  Edit3,
  Layout,
  Users,
  MessageSquare,
  Phone,
  Loader2,
  Navigation,
  ShoppingBag,
  UserPlus,
  Footprints,
  Menu,
  Globe,
  Star,
  Mail,
  MapPin,
  Truck,
  CreditCard,
  Clock,
  Instagram,
  Facebook
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  type HomepageContent,
  updateHomepageContentSchema,
  type UpdateHomepageContent,
  type NavigationContent,
  type HeroFeatures,
  type AboutContent,
  type AboutHighlight,
  type AboutStats,
  type TestimonialsContent,
  type ContactContent,
  type ContactInfo,
  type ShippingInfo,
  type AffiliatesContent,
  type AffiliateLevel,
  type FooterContent,
  type FooterLinkGroup
} from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";

export default function AdminHomepage() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

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
      toast({
        title: "Contenido actualizado",
        description: `La sección ${section} se ha actualizado correctamente`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el contenido. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const getContentBySection = (section: string): HomepageContent | undefined => {
    return homepageContent?.find((content) => content.section === section);
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
              <h1 className="text-2xl font-bold text-white">Gestión de Contenido Completa</h1>
              <p className="text-gray-400">Edita TODO el texto del homepage desde aquí</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AdminProfileDropdown />
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-gray-900 border-purple-500/20">
              <TabsTrigger value="overview" className="text-xs">Vista General</TabsTrigger>
              <TabsTrigger value="navigation" className="text-xs">Navegación</TabsTrigger>
              <TabsTrigger value="hero" className="text-xs">Hero</TabsTrigger>
              <TabsTrigger value="about" className="text-xs">Nosotros</TabsTrigger>
              <TabsTrigger value="testimonials" className="text-xs">Testimonios</TabsTrigger>
              <TabsTrigger value="contact" className="text-xs">Contacto</TabsTrigger>
              <TabsTrigger value="affiliates" className="text-xs">Afiliados</TabsTrigger>
              <TabsTrigger value="footer" className="text-xs">Footer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <OverviewSection 
                homepageContent={homepageContent} 
                updateMutation={updateContentMutation}
                token={token}
              />
            </TabsContent>
            
            <TabsContent value="navigation" className="mt-6">
              <NavigationSection 
                content={getContentBySection("navigation")} 
                updateMutation={updateContentMutation}
                token={token}
              />
            </TabsContent>
            
            <TabsContent value="hero" className="mt-6">
              <HeroSection 
                content={getContentBySection("hero")} 
                updateMutation={updateContentMutation}
                token={token}
              />
            </TabsContent>
            
            <TabsContent value="about" className="mt-6">
              <AboutSection 
                content={getContentBySection("about")} 
                updateMutation={updateContentMutation}
                token={token}
              />
            </TabsContent>
            
            <TabsContent value="testimonials" className="mt-6">
              <TestimonialsSection 
                content={getContentBySection("testimonials")} 
                updateMutation={updateContentMutation}
                token={token}
              />
            </TabsContent>
            
            <TabsContent value="contact" className="mt-6">
              <ContactSection 
                content={getContentBySection("contact")} 
                updateMutation={updateContentMutation}
                token={token}
              />
            </TabsContent>
            
            <TabsContent value="affiliates" className="mt-6">
              <AffiliatesSection 
                content={getContentBySection("affiliates")} 
                updateMutation={updateContentMutation}
                token={token}
              />
            </TabsContent>
            
            <TabsContent value="footer" className="mt-6">
              <FooterSection 
                content={getContentBySection("footer")} 
                updateMutation={updateContentMutation}
                token={token}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

// Helper interfaces for section props
interface SectionProps {
  content: HomepageContent | undefined;
  updateMutation: any;
  token: string | null;
}

interface OverviewSectionProps {
  homepageContent: any;
  updateMutation: any;
  token: string | null;
}

// Overview Section Component
function OverviewSection({ homepageContent, updateMutation, token }: OverviewSectionProps) {
  const sections = [
    { key: "navigation", title: "Navegación", icon: Navigation, description: "Menú y botones del header" },
    { key: "hero", title: "Hero", icon: Layout, description: "Sección principal con título y botones" },
    { key: "about", title: "Nosotros", icon: Users, description: "Información de la empresa" },
    { key: "testimonials", title: "Testimonios", icon: Star, description: "Reseñas y redes sociales" },
    { key: "contact", title: "Contacto", icon: Phone, description: "Información de contacto completa" },
    { key: "affiliates", title: "Afiliados", icon: UserPlus, description: "Programa de afiliación" },
    { key: "footer", title: "Footer", icon: Footprints, description: "Pie de página y enlaces" },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Vista General del Contenido
          </CardTitle>
          <CardDescription className="text-gray-400">
            Gestiona todo el contenido de texto del homepage desde esta interfaz completa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <h3 className="text-white font-medium mb-2">🎯 Sistema de Gestión Completo</h3>
            <p className="text-gray-300 text-sm mb-3">
              Ahora puedes editar absolutamente TODO el texto que aparece en el homepage:
            </p>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• Menú de navegación y botones del header</li>
              <li>• Títulos, subtítulos y características del hero</li>
              <li>• Información completa de contacto (WhatsApp, email, dirección)</li>
              <li>• Todos los textos de formularios y etiquetas</li>
              <li>• Enlaces del footer y contenido legal</li>
              <li>• Contenido de redes sociales y testimonios</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => {
              const Icon = section.icon;
              const content = homepageContent?.find((c: any) => c.section === section.key);
              
              return (
                <Card key={section.key} className="bg-gray-800/50 border-purple-500/10 hover:border-purple-500/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{section.title}</h3>
                        <p className="text-xs text-gray-400">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        content?.active 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {content?.active ? "Activo" : "Inactivo"}
                      </span>
                      <p className="text-xs text-gray-500">
                        {content?.title ? `"${content.title.substring(0, 20)}..."` : "Sin contenido"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Navigation Section Component
function NavigationSection({ content, updateMutation, token }: SectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Parse current navigation content
  let navigationData: NavigationContent = {
    logoAlt: 'VAPEOLO',
    menuItems: {
      inicio: 'Inicio',
      productos: 'Productos',
      afiliados: 'Afiliados',
      contacto: 'Contacto'
    },
    buttons: {
      cart: 'Carrito',
      login: 'Iniciar Sesión',
      mobileMenu: 'Menú'
    }
  };
  
  try {
    if (content?.content) {
      navigationData = JSON.parse(content.content);
    }
  } catch {
    // Use default if parsing fails
  }
  
  const form = useForm({
    defaultValues: {
      active: content?.active ?? true,
      logoAlt: navigationData.logoAlt,
      menuInicio: navigationData.menuItems.inicio,
      menuProductos: navigationData.menuItems.productos,
      menuAfiliados: navigationData.menuItems.afiliados,
      menuContacto: navigationData.menuItems.contacto,
      buttonCart: navigationData.buttons.cart,
      buttonLogin: navigationData.buttons.login,
      buttonMobileMenu: navigationData.buttons.mobileMenu
    }
  });
  
  const onSubmit = (data: any) => {
    const navigationContent: NavigationContent = {
      logoAlt: data.logoAlt,
      menuItems: {
        inicio: data.menuInicio,
        productos: data.menuProductos,
        afiliados: data.menuAfiliados,
        contacto: data.menuContacto
      },
      buttons: {
        cart: data.buttonCart,
        login: data.buttonLogin,
        mobileMenu: data.buttonMobileMenu
      }
    };
    
    updateMutation.mutate({
      section: 'navigation',
      data: {
        title: 'Navegación',
        content: JSON.stringify(navigationContent),
        active: data.active
      }
    });
    
    setIsEditing(false);
  };
  
  return (
    <Card className="bg-gray-900 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Navigation className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Navegación del Header</CardTitle>
              <CardDescription className="text-gray-400">
                Configura textos del menú principal, botones y logo
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-300">Logo Alt Text</Label>
                <p className="text-white mt-1">{navigationData.logoAlt}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300">Estado</Label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  content?.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {content?.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Elementos del Menú</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Inicio</p>
                  <p className="text-white">{navigationData.menuItems.inicio}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Productos</p>
                  <p className="text-white">{navigationData.menuItems.productos}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Afiliados</p>
                  <p className="text-white">{navigationData.menuItems.afiliados}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Contacto</p>
                  <p className="text-white">{navigationData.menuItems.contacto}</p>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Botones</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Carrito</p>
                  <p className="text-white">{navigationData.buttons.cart}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Login</p>
                  <p className="text-white">{navigationData.buttons.login}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Menú Móvil</p>
                  <p className="text-white">{navigationData.buttons.mobileMenu}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="logoAlt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Logo Alt Text</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-gray-800/50 border-purple-500/30 text-white"
                          placeholder="Texto alternativo del logo"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-white">Activo</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <Label className="text-white font-medium">Elementos del Menú</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <FormField
                    control={form.control}
                    name="menuInicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Inicio</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="menuProductos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Productos</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="menuAfiliados"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Afiliados</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="menuContacto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Contacto</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-white font-medium">Botones</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <FormField
                    control={form.control}
                    name="buttonCart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Carrito</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="buttonLogin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Login</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="buttonMobileMenu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Menú Móvil</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

// Hero Section Component
function HeroSection({ content, updateMutation, token }: SectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Parse current hero content
  let heroFeatures: HeroFeatures = {
    flavors: 'Más de 25 sabores',
    puffs: 'Hasta 20,000 puffs',
    shipping: 'Envíos a todo el país'
  };
  
  try {
    if (content?.content) {
      heroFeatures = JSON.parse(content.content);
    }
  } catch {
    // Use default if parsing fails
  }
  
  const form = useForm({
    defaultValues: {
      active: content?.active ?? true,
      title: content?.title || 'VAPEOLO:',
      subtitle: content?.subtitle || 'Donde la experiencia y el sabor se fusionan',
      description: content?.description || '15 años diseñando los mejores cigarrillos electrónicos del mercado',
      buttonText: content?.buttonText || 'Ver Productos',
      buttonSecondaryText: content?.buttonSecondaryText || 'Unirme como Afiliado',
      featureFlavors: heroFeatures.flavors,
      featurePuffs: heroFeatures.puffs,
      featureShipping: heroFeatures.shipping
    }
  });
  
  const onSubmit = (data: any) => {
    const features: HeroFeatures = {
      flavors: data.featureFlavors,
      puffs: data.featurePuffs,
      shipping: data.featureShipping
    };
    
    updateMutation.mutate({
      section: 'hero',
      data: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        buttonText: data.buttonText,
        buttonSecondaryText: data.buttonSecondaryText,
        content: JSON.stringify(features),
        active: data.active
      }
    });
    
    setIsEditing(false);
  };
  
  return (
    <Card className="bg-gray-900 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Layout className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Sección Hero Principal</CardTitle>
              <CardDescription className="text-gray-400">
                Título principal, subtítulo, características destacadas y botones de acción
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-300">Título Principal</Label>
                <p className="text-white mt-1 text-lg font-bold">{content?.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300">Estado</Label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  content?.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {content?.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Subtítulo</Label>
              <p className="text-gray-300 mt-1">{content?.subtitle}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Descripción</Label>
              <p className="text-gray-300 mt-1">{content?.description}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Botones</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Botón Principal</p>
                  <p className="text-purple-300">{content?.buttonText}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Botón Secundario</p>
                  <p className="text-blue-300">{content?.buttonSecondaryText}</p>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Características Destacadas</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Sabores</p>
                  <p className="text-white">{heroFeatures.flavors}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Puffs</p>
                  <p className="text-white">{heroFeatures.puffs}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Envíos</p>
                  <p className="text-white">{heroFeatures.shipping}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-white">Sección Activa</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Título Principal *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-gray-800/50 border-purple-500/30 text-white"
                        placeholder="Ej: VAPEOLO:"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Subtítulo *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-gray-800/50 border-purple-500/30 text-white"
                        placeholder="Ej: Donde la experiencia y el sabor se fusionan"
                      />
                    </FormControl>
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
                        className="bg-gray-800/50 border-purple-500/30 text-white"
                        placeholder="Descripción adicional del hero"
                        rows={3}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="buttonText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Texto Botón Principal</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-gray-800/50 border-purple-500/30 text-white"
                          placeholder="Ej: Ver Productos"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="buttonSecondaryText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Texto Botón Secundario</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-gray-800/50 border-purple-500/30 text-white"
                          placeholder="Ej: Unirme como Afiliado"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <Label className="text-white font-medium">Características Destacadas</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <FormField
                    control={form.control}
                    name="featureFlavors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Sabores</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-gray-800/50 border-purple-500/30 text-white"
                            placeholder="Ej: Más de 25 sabores"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="featurePuffs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Puffs</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-gray-800/50 border-purple-500/30 text-white"
                            placeholder="Ej: Hasta 20,000 puffs"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="featureShipping"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Envíos</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-gray-800/50 border-purple-500/30 text-white"
                            placeholder="Ej: Envíos a todo el país"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

// About Section Component
function AboutSection({ content, updateMutation, token }: SectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Parse current about content
  let aboutData: AboutContent = {
    highlights: [
      { title: "Presencia en más de 10 países", description: "Distribuyendo experiencias únicas a nivel internacional" },
      { title: "Baterías de larga duración", description: "Tecnología avanzada para máximo rendimiento" },
      { title: "Hasta 20,000 puffs por dispositivo", description: "La duración más larga del mercado" },
      { title: "Garantía de calidad", description: "15 años de experiencia y excelencia comprobada" }
    ],
    stats: {
      experience: "Años de experiencia",
      flavors: "Sabores disponibles",
      countries: "Países con presencia"
    }
  };
  
  try {
    if (content?.content) {
      aboutData = JSON.parse(content.content);
    }
  } catch {
    // Use default if parsing fails
  }
  
  const form = useForm({
    defaultValues: {
      active: content?.active ?? true,
      title: content?.title || '¿Quiénes somos?',
      subtitle: content?.subtitle || 'VAPEOLO es distribuidora oficial de LAVIE, una marca con más de 15 años de innovación en diseño y fabricación de vapes.',
      description: content?.description || 'Nuestra misión: redefinir el vapeo en Latinoamérica',
      highlight1Title: aboutData.highlights[0]?.title || '',
      highlight1Desc: aboutData.highlights[0]?.description || '',
      highlight2Title: aboutData.highlights[1]?.title || '',
      highlight2Desc: aboutData.highlights[1]?.description || '',
      highlight3Title: aboutData.highlights[2]?.title || '',
      highlight3Desc: aboutData.highlights[2]?.description || '',
      highlight4Title: aboutData.highlights[3]?.title || '',
      highlight4Desc: aboutData.highlights[3]?.description || '',
      statExperience: aboutData.stats.experience,
      statFlavors: aboutData.stats.flavors,
      statCountries: aboutData.stats.countries
    }
  });
  
  const onSubmit = (data: any) => {
    const aboutContent: AboutContent = {
      highlights: [
        { title: data.highlight1Title, description: data.highlight1Desc },
        { title: data.highlight2Title, description: data.highlight2Desc },
        { title: data.highlight3Title, description: data.highlight3Desc },
        { title: data.highlight4Title, description: data.highlight4Desc }
      ],
      stats: {
        experience: data.statExperience,
        flavors: data.statFlavors,
        countries: data.statCountries
      }
    };
    
    updateMutation.mutate({
      section: 'about',
      data: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        content: JSON.stringify(aboutContent),
        active: data.active
      }
    });
    
    setIsEditing(false);
  };
  
  return (
    <Card className="bg-gray-900 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Sección Nosotros</CardTitle>
              <CardDescription className="text-gray-400">
                Información de empresa, destacados y estadísticas
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-300">Título</Label>
                <p className="text-white mt-1 text-lg font-bold">{content?.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300">Estado</Label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  content?.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {content?.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Subtítulo</Label>
              <p className="text-gray-300 mt-1">{content?.subtitle}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Descripción</Label>
              <p className="text-gray-300 mt-1">{content?.description}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Destacados</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {aboutData.highlights.map((highlight, idx) => (
                  <div key={idx} className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-white font-medium text-sm">{highlight.title}</p>
                    <p className="text-gray-400 text-xs mt-1">{highlight.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Estadísticas</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Experiencia</p>
                  <p className="text-white">{aboutData.stats.experience}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Sabores</p>
                  <p className="text-white">{aboutData.stats.flavors}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Países</p>
                  <p className="text-white">{aboutData.stats.countries}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-white">Sección Activa</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Título *</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                    </FormControl>
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
                      <Textarea {...field} className="bg-gray-800/50 border-purple-500/30 text-white" rows={2} />
                    </FormControl>
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
                      <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div>
                <Label className="text-white font-medium">Destacados (4 elementos)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="space-y-2 p-4 bg-gray-800/30 rounded-lg">
                      <FormField
                        control={form.control}
                        name={`highlight${num}Title` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Título {num}</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`highlight${num}Desc` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Descripción {num}</FormLabel>
                            <FormControl>
                              <Textarea {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" rows={2} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-white font-medium">Estadísticas</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <FormField
                    control={form.control}
                    name="statExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Años Experiencia</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="statFlavors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Sabores</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="statCountries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Países</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

// Testimonials Section Component
function TestimonialsSection({ content, updateMutation, token }: SectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Parse current testimonials content
  let testimonialsData: TestimonialsContent = {
    socialPrompt: 'Síguenos en redes sociales',
    socialPlatforms: [
      { platform: "Instagram", handle: "@lavievapes.gt", followers: "45.2K" },
      { platform: "TikTok", handle: "@lavievapes", followers: "32.8K" },
      { platform: "Facebook", handle: "LAVIE Vapes Guatemala", followers: "28.1K" }
    ],
    ctaPrompt: 'Síguenos para contenido exclusivo',
    ctaFeatures: '📸 Fotos de clientes • 🎥 Reviews y unboxing • 🎁 Promos y giveaways'
  };
  
  try {
    if (content?.content) {
      testimonialsData = JSON.parse(content.content);
    }
  } catch {
    // Use default if parsing fails
  }
  
  const form = useForm({
    defaultValues: {
      active: content?.active ?? true,
      title: content?.title || 'Testimonios',
      subtitle: content?.subtitle || 'Lo que dicen nuestros clientes y socios',
      socialPrompt: testimonialsData.socialPrompt,
      platform1: testimonialsData.socialPlatforms[0]?.platform || '',
      handle1: testimonialsData.socialPlatforms[0]?.handle || '',
      followers1: testimonialsData.socialPlatforms[0]?.followers || '',
      platform2: testimonialsData.socialPlatforms[1]?.platform || '',
      handle2: testimonialsData.socialPlatforms[1]?.handle || '',
      followers2: testimonialsData.socialPlatforms[1]?.followers || '',
      platform3: testimonialsData.socialPlatforms[2]?.platform || '',
      handle3: testimonialsData.socialPlatforms[2]?.handle || '',
      followers3: testimonialsData.socialPlatforms[2]?.followers || '',
      ctaPrompt: testimonialsData.ctaPrompt,
      ctaFeatures: testimonialsData.ctaFeatures
    }
  });
  
  const onSubmit = (data: any) => {
    const testimonialsContent: TestimonialsContent = {
      socialPrompt: data.socialPrompt,
      socialPlatforms: [
        { platform: data.platform1, handle: data.handle1, followers: data.followers1 },
        { platform: data.platform2, handle: data.handle2, followers: data.followers2 },
        { platform: data.platform3, handle: data.handle3, followers: data.followers3 }
      ],
      ctaPrompt: data.ctaPrompt,
      ctaFeatures: data.ctaFeatures
    };
    
    updateMutation.mutate({
      section: 'testimonials',
      data: {
        title: data.title,
        subtitle: data.subtitle,
        content: JSON.stringify(testimonialsContent),
        active: data.active
      }
    });
    
    setIsEditing(false);
  };
  
  return (
    <Card className="bg-gray-900 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Sección Testimonios</CardTitle>
              <CardDescription className="text-gray-400">
                Reseñas, redes sociales y llamadas a la acción
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-300">Título</Label>
                <p className="text-white mt-1">{content?.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300">Estado</Label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  content?.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {content?.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Subtítulo</Label>
              <p className="text-gray-300 mt-1">{content?.subtitle}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Prompt de Redes Sociales</Label>
              <p className="text-gray-300 mt-1">{testimonialsData.socialPrompt}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Plataformas Sociales</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {testimonialsData.socialPlatforms.map((platform, idx) => (
                  <div key={idx} className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-white font-medium text-sm">{platform.platform}</p>
                    <p className="text-gray-400 text-xs">{platform.handle}</p>
                    <p className="text-purple-300 text-xs">{platform.followers} seguidores</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">CTA y Características</Label>
              <div className="mt-2 space-y-2">
                <p className="text-gray-300">{testimonialsData.ctaPrompt}</p>
                <p className="text-gray-400 text-sm">{testimonialsData.ctaFeatures}</p>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-white">Sección Activa</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Título *</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                    </FormControl>
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
                      <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="socialPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Prompt Redes Sociales</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div>
                <Label className="text-white font-medium">Plataformas Sociales (3 plataformas)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="space-y-2 p-4 bg-gray-800/30 rounded-lg">
                      <FormField
                        control={form.control}
                        name={`platform${num}` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Plataforma {num}</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`handle${num}` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Handle</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`followers${num}` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Seguidores</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="ctaPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Llamada a la Acción</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ctaFeatures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Características del CTA</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="bg-gray-800/50 border-purple-500/30 text-white" rows={2} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

// Contact Section Component - THE MOST COMPREHENSIVE CONTACT MANAGEMENT
function ContactSection({ content, updateMutation, token }: SectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Parse current contact content
  let contactData: ContactContent = {
    formTitle: 'Envíanos un mensaje',
    formLabels: {
      name: 'Nombre',
      email: 'Email',
      message: 'Mensaje'
    },
    formPlaceholders: {
      name: 'Tu nombre',
      email: 'tu@email.com',
      message: '¿En qué podemos ayudarte?'
    },
    formButton: 'Enviar mensaje',
    contactInfo: [
      { title: "WhatsApp", description: "¿Dudas? Escríbenos al instante", value: "+502 1234-5678", action: "Chatear ahora" },
      { title: "Email", description: "Contacto comercial", value: "info@lavievapes.gt", action: "Enviar email" },
      { title: "Ubicación", description: "Envíos a toda Guatemala", value: "Ciudad de Guatemala", action: "Ver cobertura" }
    ],
    shippingInfo: [
      { title: "Envíos a toda Guatemala", description: "Entregas en 24-72h hábiles" },
      { title: "Múltiples métodos de pago", description: "Tarjeta, transferencia, contra entrega" },
      { title: "Envío gratis", description: "En compras desde Q200" }
    ],
    paymentMethods: ["Tarjeta de crédito", "Transferencia", "Contra entrega"],
    shippingNotice: "* Contra entrega minimo de Q200 o costo de Q35 por envio"
  };
  
  try {
    if (content?.content) {
      contactData = JSON.parse(content.content);
    }
  } catch {
    // Use default if parsing fails
  }
  
  const form = useForm({
    defaultValues: {
      active: content?.active ?? true,
      title: content?.title || 'Contacto',
      subtitle: content?.subtitle || 'Estamos aquí para ayudarte',
      formTitle: contactData.formTitle,
      labelName: contactData.formLabels.name,
      labelEmail: contactData.formLabels.email,
      labelMessage: contactData.formLabels.message,
      placeholderName: contactData.formPlaceholders.name,
      placeholderEmail: contactData.formPlaceholders.email,
      placeholderMessage: contactData.formPlaceholders.message,
      formButton: contactData.formButton,
      whatsappTitle: contactData.contactInfo[0]?.title || '',
      whatsappDesc: contactData.contactInfo[0]?.description || '',
      whatsappValue: contactData.contactInfo[0]?.value || '',
      whatsappAction: contactData.contactInfo[0]?.action || '',
      emailTitle: contactData.contactInfo[1]?.title || '',
      emailDesc: contactData.contactInfo[1]?.description || '',
      emailValue: contactData.contactInfo[1]?.value || '',
      emailAction: contactData.contactInfo[1]?.action || '',
      locationTitle: contactData.contactInfo[2]?.title || '',
      locationDesc: contactData.contactInfo[2]?.description || '',
      locationValue: contactData.contactInfo[2]?.value || '',
      locationAction: contactData.contactInfo[2]?.action || '',
      shipping1Title: contactData.shippingInfo[0]?.title || '',
      shipping1Desc: contactData.shippingInfo[0]?.description || '',
      shipping2Title: contactData.shippingInfo[1]?.title || '',
      shipping2Desc: contactData.shippingInfo[1]?.description || '',
      shipping3Title: contactData.shippingInfo[2]?.title || '',
      shipping3Desc: contactData.shippingInfo[2]?.description || '',
      paymentMethod1: contactData.paymentMethods[0] || '',
      paymentMethod2: contactData.paymentMethods[1] || '',
      paymentMethod3: contactData.paymentMethods[2] || '',
      shippingNotice: contactData.shippingNotice
    }
  });
  
  const onSubmit = (data: any) => {
    const contactContent: ContactContent = {
      formTitle: data.formTitle,
      formLabels: {
        name: data.labelName,
        email: data.labelEmail,
        message: data.labelMessage
      },
      formPlaceholders: {
        name: data.placeholderName,
        email: data.placeholderEmail,
        message: data.placeholderMessage
      },
      formButton: data.formButton,
      contactInfo: [
        { title: data.whatsappTitle, description: data.whatsappDesc, value: data.whatsappValue, action: data.whatsappAction },
        { title: data.emailTitle, description: data.emailDesc, value: data.emailValue, action: data.emailAction },
        { title: data.locationTitle, description: data.locationDesc, value: data.locationValue, action: data.locationAction }
      ],
      shippingInfo: [
        { title: data.shipping1Title, description: data.shipping1Desc },
        { title: data.shipping2Title, description: data.shipping2Desc },
        { title: data.shipping3Title, description: data.shipping3Desc }
      ],
      paymentMethods: [data.paymentMethod1, data.paymentMethod2, data.paymentMethod3],
      shippingNotice: data.shippingNotice
    };
    
    updateMutation.mutate({
      section: 'contact',
      data: {
        title: data.title,
        subtitle: data.subtitle,
        content: JSON.stringify(contactContent),
        active: data.active
      }
    });
    
    setIsEditing(false);
  };
  
  return (
    <Card className="bg-gray-900 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">📞 Información de Contacto Completa</CardTitle>
              <CardDescription className="text-gray-400">
                🎯 GESTIONA TODO: WhatsApp, Email, Dirección, Formularios, Envíos y Pagos
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h3 className="text-green-400 font-medium mb-2">✅ Información de Contacto Principal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contactData.contactInfo.map((info, idx) => (
                  <div key={idx} className="text-center p-3 bg-gray-800/30 rounded">
                    <p className="text-white font-medium">{info.title}</p>
                    <p className="text-green-400 font-bold text-lg">{info.value}</p>
                    <p className="text-gray-400 text-sm">{info.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-300">Título Principal</Label>
                <p className="text-white mt-1">{content?.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300">Estado</Label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  content?.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {content?.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Subtítulo</Label>
              <p className="text-gray-300 mt-1">{content?.subtitle}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">📝 Formulario de Contacto</Label>
              <div className="mt-2 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-white font-medium">{contactData.formTitle}</p>
                <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                  <p className="text-gray-400">{contactData.formLabels.name}</p>
                  <p className="text-gray-400">{contactData.formLabels.email}</p>
                  <p className="text-gray-400">{contactData.formLabels.message}</p>
                </div>
                <p className="text-purple-300 mt-2 text-sm">{contactData.formButton}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">🚚 Información de Envío</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {contactData.shippingInfo.map((shipping, idx) => (
                  <div key={idx} className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-white font-medium text-sm">{shipping.title}</p>
                    <p className="text-gray-400 text-xs">{shipping.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">💳 Métodos de Pago</Label>
              <div className="mt-2 p-3 bg-gray-800/50 rounded-lg">
                <div className="grid grid-cols-3 gap-2">
                  {contactData.paymentMethods.map((method, idx) => (
                    <p key={idx} className="text-gray-300 text-sm">✓ {method}</p>
                  ))}
                </div>
                <p className="text-purple-300 text-xs mt-2">{contactData.shippingNotice}</p>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-white">Sección Activa</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Título Principal *</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                      </FormControl>
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
                        <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Label className="text-green-400 font-medium">📞 INFORMACIÓN DE CONTACTO PRINCIPAL</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { prefix: 'whatsapp', label: '📱 WhatsApp', placeholder: '+502 1234-5678' }, 
                    { prefix: 'email', label: '📧 Email', placeholder: 'info@empresa.com' }, 
                    { prefix: 'location', label: '📍 Ubicación', placeholder: 'Ciudad de Guatemala' }
                  ].map((contact, idx) => (
                    <div key={idx} className="space-y-2 p-3 bg-gray-800/30 rounded">
                      <h4 className="text-white font-medium text-sm">{contact.label}</h4>
                      <FormField
                        control={form.control}
                        name={`${contact.prefix}Title` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300 text-xs">Título</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${contact.prefix}Value` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-green-400 text-xs font-bold">VALOR PRINCIPAL *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-gray-800/50 border-green-500/30 text-green-400 font-bold text-sm" 
                                placeholder={contact.placeholder}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${contact.prefix}Desc` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300 text-xs">Descripción</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${contact.prefix}Action` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300 text-xs">Acción</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Label className="text-blue-400 font-medium">📝 Formulario de Contacto</Label>
                
                <FormField
                  control={form.control}
                  name="formTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Título del Formulario</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="labelName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Label Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="labelEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Label Email</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="labelMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Label Mensaje</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="placeholderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Placeholder Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="placeholderEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Placeholder Email</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="placeholderMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Placeholder Mensaje</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="formButton"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Texto del Botón</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <Label className="text-yellow-400 font-medium">🚚 Información de Envío</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="space-y-2">
                      <FormField
                        control={form.control}
                        name={`shipping${num}Title` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Envío {num} - Título</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`shipping${num}Desc` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Descripción</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <Label className="text-purple-400 font-medium">💳 Métodos de Pago</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((num) => (
                    <FormField
                      key={num}
                      control={form.control}
                      name={`paymentMethod${num}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Método {num}</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                
                <FormField
                  control={form.control}
                  name="shippingNotice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Aviso de Envío</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="bg-gray-800/50 border-purple-500/30 text-white" rows={2} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                💾 Guardar Toda la Información de Contacto
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

// Affiliates Section Component - COMPLETE AFFILIATE PROGRAM MANAGEMENT
function AffiliatesSection({ content, updateMutation, token }: SectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Parse current affiliates content
  let affiliatesData: AffiliatesContent = {
    sectionSubtitle: 'Únete a nuestro programa de distribuidores',
    levels: [
      { id: 'bronze', name: 'Distribuidor Bronce', discount: '15%', minimum: 'Q1,000', features: ['Descuento en mayoreo', 'Soporte básico', 'Material promocional'] },
      { id: 'silver', name: 'Distribuidor Plata', discount: '25%', minimum: 'Q2,500', features: ['Mayor descuento', 'Soporte prioritario', 'Productos exclusivos', 'Envío gratis'] },
      { id: 'gold', name: 'Distribuidor Oro', discount: '35%', minimum: 'Q5,000', features: ['Máximo descuento', 'Soporte dedicado', 'Lanzamientos exclusivos', 'Sin mínimo de envío', 'Capacitaciones'] }
    ],
    formTitle: 'Solicitar membresía de distribuidor',
    formLabels: {
      name: 'Nombre completo',
      email: 'Email',
      phone: 'Teléfono',
      level: 'Nivel deseado',
      message: 'Mensaje'
    },
    formPlaceholders: {
      name: 'Tu nombre completo',
      email: 'tu@email.com',
      phone: '+502 1234-5678',
      message: 'Cuéntanos sobre tu negocio...'
    },
    formButton: 'Enviar solicitud',
    levelOptions: [
      { label: 'Distribuidor Bronce', value: 'bronze' },
      { label: 'Distribuidor Plata', value: 'silver' },
      { label: 'Distribuidor Oro', value: 'gold' }
    ],
    messages: {
      success: {
        title: 'Solicitud enviada',
        description: 'Te contactaremos pronto para procesar tu solicitud'
      },
      error: {
        title: 'Error al enviar',
        description: 'Por favor intenta de nuevo o contáctanos directamente'
      }
    }
  };
  
  try {
    if (content?.content) {
      affiliatesData = JSON.parse(content.content);
    }
  } catch {
    // Use default if parsing fails
  }
  
  const form = useForm({
    defaultValues: {
      active: content?.active ?? true,
      title: content?.title || 'Programa de Afiliados',
      subtitle: content?.subtitle || 'Conviértete en distribuidor oficial de VAPEOLO',
      sectionSubtitle: affiliatesData.sectionSubtitle,
      formTitle: affiliatesData.formTitle,
      labelName: affiliatesData.formLabels.name,
      labelEmail: affiliatesData.formLabels.email,
      labelPhone: affiliatesData.formLabels.phone,
      labelLevel: affiliatesData.formLabels.level,
      labelMessage: affiliatesData.formLabels.message,
      placeholderName: affiliatesData.formPlaceholders.name,
      placeholderEmail: affiliatesData.formPlaceholders.email,
      placeholderPhone: affiliatesData.formPlaceholders.phone,
      placeholderMessage: affiliatesData.formPlaceholders.message,
      formButton: affiliatesData.formButton,
      bronzeName: affiliatesData.levels[0]?.name || '',
      bronzeDiscount: affiliatesData.levels[0]?.discount || '',
      bronzeMinimum: affiliatesData.levels[0]?.minimum || '',
      bronzeFeature1: affiliatesData.levels[0]?.features[0] || '',
      bronzeFeature2: affiliatesData.levels[0]?.features[1] || '',
      bronzeFeature3: affiliatesData.levels[0]?.features[2] || '',
      silverName: affiliatesData.levels[1]?.name || '',
      silverDiscount: affiliatesData.levels[1]?.discount || '',
      silverMinimum: affiliatesData.levels[1]?.minimum || '',
      silverFeature1: affiliatesData.levels[1]?.features[0] || '',
      silverFeature2: affiliatesData.levels[1]?.features[1] || '',
      silverFeature3: affiliatesData.levels[1]?.features[2] || '',
      silverFeature4: affiliatesData.levels[1]?.features[3] || '',
      goldName: affiliatesData.levels[2]?.name || '',
      goldDiscount: affiliatesData.levels[2]?.discount || '',
      goldMinimum: affiliatesData.levels[2]?.minimum || '',
      goldFeature1: affiliatesData.levels[2]?.features[0] || '',
      goldFeature2: affiliatesData.levels[2]?.features[1] || '',
      goldFeature3: affiliatesData.levels[2]?.features[2] || '',
      goldFeature4: affiliatesData.levels[2]?.features[3] || '',
      goldFeature5: affiliatesData.levels[2]?.features[4] || '',
      successTitle: affiliatesData.messages.success.title,
      successDescription: affiliatesData.messages.success.description,
      errorTitle: affiliatesData.messages.error.title,
      errorDescription: affiliatesData.messages.error.description
    }
  });
  
  const onSubmit = (data: any) => {
    const affiliatesContent: AffiliatesContent = {
      sectionSubtitle: data.sectionSubtitle,
      levels: [
        { 
          id: 'bronze', 
          name: data.bronzeName, 
          discount: data.bronzeDiscount, 
          minimum: data.bronzeMinimum, 
          features: [data.bronzeFeature1, data.bronzeFeature2, data.bronzeFeature3].filter(f => f) 
        },
        { 
          id: 'silver', 
          name: data.silverName, 
          discount: data.silverDiscount, 
          minimum: data.silverMinimum, 
          features: [data.silverFeature1, data.silverFeature2, data.silverFeature3, data.silverFeature4].filter(f => f) 
        },
        { 
          id: 'gold', 
          name: data.goldName, 
          discount: data.goldDiscount, 
          minimum: data.goldMinimum, 
          features: [data.goldFeature1, data.goldFeature2, data.goldFeature3, data.goldFeature4, data.goldFeature5].filter(f => f) 
        }
      ],
      formTitle: data.formTitle,
      formLabels: {
        name: data.labelName,
        email: data.labelEmail,
        phone: data.labelPhone,
        level: data.labelLevel,
        message: data.labelMessage
      },
      formPlaceholders: {
        name: data.placeholderName,
        email: data.placeholderEmail,
        phone: data.placeholderPhone,
        message: data.placeholderMessage
      },
      formButton: data.formButton,
      levelOptions: [
        { label: data.bronzeName, value: 'bronze' },
        { label: data.silverName, value: 'silver' },
        { label: data.goldName, value: 'gold' }
      ],
      messages: {
        success: {
          title: data.successTitle,
          description: data.successDescription
        },
        error: {
          title: data.errorTitle,
          description: data.errorDescription
        }
      }
    };
    
    updateMutation.mutate({
      section: 'affiliates',
      data: {
        title: data.title,
        subtitle: data.subtitle,
        content: JSON.stringify(affiliatesContent),
        active: data.active
      }
    });
    
    setIsEditing(false);
  };
  
  return (
    <Card className="bg-gray-900 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">🤝 Programa de Afiliados Completo</CardTitle>
              <CardDescription className="text-gray-400">
                Gestiona niveles, beneficios, formularios y mensajes del programa
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-300">Título Principal</Label>
                <p className="text-white mt-1">{content?.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300">Estado</Label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  content?.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {content?.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Subtítulo Principal</Label>
              <p className="text-gray-300 mt-1">{content?.subtitle}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">Subtítulo de Sección</Label>
              <p className="text-gray-300 mt-1">{affiliatesData.sectionSubtitle}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">🎖️ Niveles de Distribución</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {affiliatesData.levels.map((level, idx) => (
                  <div key={idx} className="p-4 bg-gray-800/50 rounded-lg border border-purple-500/20">
                    <div className="text-center mb-3">
                      <h3 className="text-white font-bold">{level.name}</h3>
                      <p className="text-2xl font-bold text-purple-400">{level.discount}</p>
                      <p className="text-gray-400 text-sm">Mínimo: {level.minimum}</p>
                    </div>
                    <div className="space-y-1">
                      {level.features.map((feature, featureIdx) => (
                        <p key={featureIdx} className="text-gray-300 text-sm">✓ {feature}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">📝 Formulario de Solicitud</Label>
              <div className="mt-2 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-white font-medium mb-2">{affiliatesData.formTitle}</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                  <p className="text-gray-400">{affiliatesData.formLabels.name}</p>
                  <p className="text-gray-400">{affiliatesData.formLabels.email}</p>
                  <p className="text-gray-400">{affiliatesData.formLabels.phone}</p>
                  <p className="text-gray-400">{affiliatesData.formLabels.level}</p>
                  <p className="text-gray-400">{affiliatesData.formLabels.message}</p>
                </div>
                <p className="text-purple-300 mt-2">{affiliatesData.formButton}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">💬 Mensajes del Sistema</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 font-medium text-sm">{affiliatesData.messages.success.title}</p>
                  <p className="text-gray-300 text-xs">{affiliatesData.messages.success.description}</p>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 font-medium text-sm">{affiliatesData.messages.error.title}</p>
                  <p className="text-gray-300 text-xs">{affiliatesData.messages.error.description}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-white">Sección Activa</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Título Principal *</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Subtítulo Principal</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="sectionSubtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Subtítulo de Sección</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="space-y-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <Label className="text-purple-400 font-medium">🎖️ Niveles de Distribución</Label>
                
                {[
                  { key: 'bronze', label: '🥉 Bronce', features: 3 },
                  { key: 'silver', label: '🥈 Plata', features: 4 },
                  { key: 'gold', label: '🥇 Oro', features: 5 }
                ].map((level) => (
                  <div key={level.key} className="p-4 bg-gray-800/30 rounded-lg">
                    <h4 className="text-white font-medium mb-3">{level.label}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <FormField
                        control={form.control}
                        name={`${level.key}Name` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Nombre</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${level.key}Discount` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Descuento</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`${level.key}Minimum` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Mínimo</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Array.from({ length: level.features }, (_, i) => (
                        <FormField
                          key={i}
                          control={form.control}
                          name={`${level.key}Feature${i + 1}` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Beneficio {i + 1}</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Label className="text-blue-400 font-medium">📝 Formulario de Solicitud</Label>
                
                <FormField
                  control={form.control}
                  name="formTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Título del Formulario</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 font-medium">Labels</Label>
                    <div className="space-y-2 mt-2">
                      {['Name', 'Email', 'Phone', 'Level', 'Message'].map((field) => (
                        <FormField
                          key={field}
                          control={form.control}
                          name={`label${field}` as any}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel className="text-gray-400 text-xs">{field}</FormLabel>
                              <FormControl>
                                <Input {...formField} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 font-medium">Placeholders</Label>
                    <div className="space-y-2 mt-2">
                      {['Name', 'Email', 'Phone', 'Message'].map((field) => (
                        <FormField
                          key={field}
                          control={form.control}
                          name={`placeholder${field}` as any}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel className="text-gray-400 text-xs">{field}</FormLabel>
                              <FormControl>
                                <Input {...formField} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="formButton"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Texto del Botón</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Label className="text-green-400 font-medium">💬 Mensajes del Sistema</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 font-medium">Mensaje de Éxito</Label>
                    <div className="space-y-2 mt-2">
                      <FormField
                        control={form.control}
                        name="successTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400 text-xs">Título</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="successDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400 text-xs">Descripción</FormLabel>
                            <FormControl>
                              <Textarea {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" rows={2} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 font-medium">Mensaje de Error</Label>
                    <div className="space-y-2 mt-2">
                      <FormField
                        control={form.control}
                        name="errorTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400 text-xs">Título</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="errorDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400 text-xs">Descripción</FormLabel>
                            <FormControl>
                              <Textarea {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" rows={2} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                💾 Guardar Programa de Afiliados
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

// Footer Section Component - COMPLETE FOOTER MANAGEMENT
function FooterSection({ content, updateMutation, token }: SectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Parse current footer content
  let footerData: FooterContent = {
    brandName: 'VAPEOLO',
    brandDescription: 'Tu distribuidora oficial de LAVIE en Guatemala. Más de 15 años innovando en el mundo del vapeo.',
    columns: [
      {
        title: 'Productos',
        links: [
          { label: 'Vapes Desechables', url: '/productos/desechables' },
          { label: 'Líquidos Premium', url: '/productos/liquidos' },
          { label: 'Accesorios', url: '/productos/accesorios' },
          { label: 'Novedades', url: '/productos/novedades' }
        ]
      },
      {
        title: 'Empresa',
        links: [
          { label: 'Sobre Nosotros', url: '/about' },
          { label: 'Ubicaciones', url: '/ubicaciones' },
          { label: 'Contáctanos', url: '/contacto' },
          { label: 'Blog', url: '/blog' }
        ]
      },
      {
        title: 'Soporte',
        links: [
          { label: 'Centro de Ayuda', url: '/ayuda' },
          { label: 'Envíos y Devoluciones', url: '/envios' },
          { label: 'Garantía', url: '/garantia' },
          { label: 'FAQ', url: '/faq' }
        ]
      }
    ],
    legalLinks: [
      { label: 'Términos y Condiciones', url: '/terminos' },
      { label: 'Política de Privacidad', url: '/privacidad' },
      { label: 'Política de Cookies', url: '/cookies' }
    ],
    ageNotice: 'Producto destinado exclusivamente para mayores de edad',
    copyright: '© 2024 VAPEOLO. Todos los derechos reservados.',
    socialLinks: {
      facebook: 'https://facebook.com/vapeolo',
      instagram: 'https://instagram.com/vapeolo',
      tiktok: 'https://tiktok.com/@vapeolo'
    }
  };
  
  try {
    if (content?.content) {
      footerData = JSON.parse(content.content);
    }
  } catch {
    // Use default if parsing fails
  }
  
  const form = useForm({
    defaultValues: {
      active: content?.active ?? true,
      title: content?.title || 'Footer',
      brandName: footerData.brandName,
      brandDescription: footerData.brandDescription,
      ageNotice: footerData.ageNotice,
      copyright: footerData.copyright,
      facebookUrl: footerData.socialLinks.facebook,
      instagramUrl: footerData.socialLinks.instagram,
      tiktokUrl: footerData.socialLinks.tiktok,
      // Column 1 - Productos
      col1Title: footerData.columns[0]?.title || '',
      col1Link1Label: footerData.columns[0]?.links[0]?.label || '',
      col1Link1Url: footerData.columns[0]?.links[0]?.url || '',
      col1Link2Label: footerData.columns[0]?.links[1]?.label || '',
      col1Link2Url: footerData.columns[0]?.links[1]?.url || '',
      col1Link3Label: footerData.columns[0]?.links[2]?.label || '',
      col1Link3Url: footerData.columns[0]?.links[2]?.url || '',
      col1Link4Label: footerData.columns[0]?.links[3]?.label || '',
      col1Link4Url: footerData.columns[0]?.links[3]?.url || '',
      // Column 2 - Empresa
      col2Title: footerData.columns[1]?.title || '',
      col2Link1Label: footerData.columns[1]?.links[0]?.label || '',
      col2Link1Url: footerData.columns[1]?.links[0]?.url || '',
      col2Link2Label: footerData.columns[1]?.links[1]?.label || '',
      col2Link2Url: footerData.columns[1]?.links[1]?.url || '',
      col2Link3Label: footerData.columns[1]?.links[2]?.label || '',
      col2Link3Url: footerData.columns[1]?.links[2]?.url || '',
      col2Link4Label: footerData.columns[1]?.links[3]?.label || '',
      col2Link4Url: footerData.columns[1]?.links[3]?.url || '',
      // Column 3 - Soporte
      col3Title: footerData.columns[2]?.title || '',
      col3Link1Label: footerData.columns[2]?.links[0]?.label || '',
      col3Link1Url: footerData.columns[2]?.links[0]?.url || '',
      col3Link2Label: footerData.columns[2]?.links[1]?.label || '',
      col3Link2Url: footerData.columns[2]?.links[1]?.url || '',
      col3Link3Label: footerData.columns[2]?.links[2]?.label || '',
      col3Link3Url: footerData.columns[2]?.links[2]?.url || '',
      col3Link4Label: footerData.columns[2]?.links[3]?.label || '',
      col3Link4Url: footerData.columns[2]?.links[3]?.url || '',
      // Legal Links
      legal1Label: footerData.legalLinks[0]?.label || '',
      legal1Url: footerData.legalLinks[0]?.url || '',
      legal2Label: footerData.legalLinks[1]?.label || '',
      legal2Url: footerData.legalLinks[1]?.url || '',
      legal3Label: footerData.legalLinks[2]?.label || '',
      legal3Url: footerData.legalLinks[2]?.url || ''
    }
  });
  
  const onSubmit = (data: any) => {
    const footerContent: FooterContent = {
      brandName: data.brandName,
      brandDescription: data.brandDescription,
      columns: [
        {
          title: data.col1Title,
          links: [
            { label: data.col1Link1Label, url: data.col1Link1Url },
            { label: data.col1Link2Label, url: data.col1Link2Url },
            { label: data.col1Link3Label, url: data.col1Link3Url },
            { label: data.col1Link4Label, url: data.col1Link4Url }
          ].filter(link => link.label && link.url)
        },
        {
          title: data.col2Title,
          links: [
            { label: data.col2Link1Label, url: data.col2Link1Url },
            { label: data.col2Link2Label, url: data.col2Link2Url },
            { label: data.col2Link3Label, url: data.col2Link3Url },
            { label: data.col2Link4Label, url: data.col2Link4Url }
          ].filter(link => link.label && link.url)
        },
        {
          title: data.col3Title,
          links: [
            { label: data.col3Link1Label, url: data.col3Link1Url },
            { label: data.col3Link2Label, url: data.col3Link2Url },
            { label: data.col3Link3Label, url: data.col3Link3Url },
            { label: data.col3Link4Label, url: data.col3Link4Url }
          ].filter(link => link.label && link.url)
        }
      ],
      legalLinks: [
        { label: data.legal1Label, url: data.legal1Url },
        { label: data.legal2Label, url: data.legal2Url },
        { label: data.legal3Label, url: data.legal3Url }
      ].filter(link => link.label && link.url),
      ageNotice: data.ageNotice,
      copyright: data.copyright,
      socialLinks: {
        facebook: data.facebookUrl,
        instagram: data.instagramUrl,
        tiktok: data.tiktokUrl
      }
    };
    
    updateMutation.mutate({
      section: 'footer',
      data: {
        title: data.title,
        content: JSON.stringify(footerContent),
        active: data.active
      }
    });
    
    setIsEditing(false);
  };
  
  return (
    <Card className="bg-gray-900 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Footprints className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">🦶 Footer Completo</CardTitle>
              <CardDescription className="text-gray-400">
                Gestiona marca, enlaces, legal, redes sociales y copyright
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-300">Estado</Label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  content?.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {content?.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">🏢 Información de Marca</Label>
              <div className="mt-2 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-white font-bold text-lg">{footerData.brandName}</p>
                <p className="text-gray-300 text-sm mt-1">{footerData.brandDescription}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">🔗 Columnas de Enlaces</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {footerData.columns.map((column, idx) => (
                  <div key={idx} className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-white font-medium text-sm mb-2">{column.title}</p>
                    <div className="space-y-1">
                      {column.links.map((link, linkIdx) => (
                        <div key={linkIdx} className="text-xs">
                          <p className="text-purple-300">{link.label}</p>
                          <p className="text-gray-500">{link.url}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">📱 Redes Sociales</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-blue-400 font-medium text-sm">Facebook</p>
                  <p className="text-gray-400 text-xs">{footerData.socialLinks.facebook}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-pink-400 font-medium text-sm">Instagram</p>
                  <p className="text-gray-400 text-xs">{footerData.socialLinks.instagram}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400 font-medium text-sm">TikTok</p>
                  <p className="text-gray-400 text-xs">{footerData.socialLinks.tiktok}</p>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">⚖️ Enlaces Legales</Label>
              <div className="mt-2 p-3 bg-gray-800/50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {footerData.legalLinks.map((link, idx) => (
                    <div key={idx} className="text-xs">
                      <p className="text-yellow-300">{link.label}</p>
                      <p className="text-gray-500">{link.url}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-300">📄 Textos Legales</Label>
              <div className="mt-2 space-y-2">
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 font-medium text-sm">Aviso de Edad</p>
                  <p className="text-gray-300 text-sm">{footerData.ageNotice}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400 font-medium text-sm">Copyright</p>
                  <p className="text-gray-300 text-sm">{footerData.copyright}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-500/20 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-white">Sección Activa</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="space-y-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Label className="text-blue-400 font-medium">🏢 Información de Marca</Label>
                
                <FormField
                  control={form.control}
                  name="brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Nombre de la Marca</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="brandDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Descripción de la Marca</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="bg-gray-800/50 border-purple-500/30 text-white" rows={3} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <Label className="text-purple-400 font-medium">🔗 Columnas de Enlaces</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((colNum) => (
                    <div key={colNum} className="p-4 bg-gray-800/30 rounded-lg">
                      <h4 className="text-white font-medium mb-3">Columna {colNum}</h4>
                      
                      <FormField
                        control={form.control}
                        name={`col${colNum}Title` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Título</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-2 mt-3">
                        {[1, 2, 3, 4].map((linkNum) => (
                          <div key={linkNum} className="grid grid-cols-2 gap-2">
                            <FormField
                              control={form.control}
                              name={`col${colNum}Link${linkNum}Label` as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-400 text-xs">Link {linkNum}</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-xs" placeholder="Etiqueta" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`col${colNum}Link${linkNum}Url` as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-400 text-xs">URL</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-xs" placeholder="/url" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4 p-4 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                <Label className="text-pink-400 font-medium">📱 Redes Sociales</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="facebookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Facebook URL</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instagramUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Instagram URL</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tiktokUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">TikTok URL</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <Label className="text-yellow-400 font-medium">⚖️ Enlaces Legales</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="space-y-2">
                      <FormField
                        control={form.control}
                        name={`legal${num}Label` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Legal {num} - Etiqueta</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`legal${num}Url` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">URL</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white text-sm" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Label className="text-green-400 font-medium">📄 Textos Legales</Label>
                
                <FormField
                  control={form.control}
                  name="ageNotice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Aviso de Edad</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="copyright"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Copyright</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800/50 border-purple-500/30 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                💾 Guardar Footer Completo
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}