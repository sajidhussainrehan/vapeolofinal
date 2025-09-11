import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  Plus,
  Package,
  Edit2,
  Eye,
  EyeOff,
  AlertTriangle,
  TrendingDown,
  CheckCircle,
  Info,
  Settings,
  Trash2,
  Save,
  X,
  Upload,
  ImageIcon,
  Loader2,
  MoreHorizontal
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  type Product,
  type ProductFlavor,
  getAvailableInventory,
  isOutOfStock,
  isLowStock,
  getStockStatus,
  getFlavorAvailableInventory,
  getFlavorStockStatus
} from "@shared/schema";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";

// Product interface is now imported from shared/schema.ts

export default function AdminProducts() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'created'>('name');
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Image upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Flavor management state
  const [flavorDialogOpen, setFlavorDialogOpen] = useState(false);
  const [currentProductForFlavors, setCurrentProductForFlavors] = useState<Product | null>(null);
  const [editingFlavor, setEditingFlavor] = useState<ProductFlavor | null>(null);
  const [deletingFlavor, setDeletingFlavor] = useState<ProductFlavor | null>(null);
  const [flavorFormData, setFlavorFormData] = useState({
    name: "",
    inventory: "0",
    reservedInventory: "0",
    lowStockThreshold: "5",
    active: true
  });
  const [flavorFormErrors, setFlavorFormErrors] = useState<{[key: string]: string}>({});
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Query for flavors when managing a specific product
  const { data: productFlavors, isLoading: flavorsLoading } = useQuery({
    queryKey: ["/api/admin/products", currentProductForFlavors?.id, "flavors"],
    queryFn: async () => {
      if (!currentProductForFlavors?.id) return [];
      const response = await fetch(`/api/admin/products/${currentProductForFlavors.id}/flavors`, {
        headers: {
          Authorization: token || "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch flavors");
      }
      const result = await response.json();
      return result.data as ProductFlavor[];
    },
    enabled: !!currentProductForFlavors?.id,
  });

  // Flavor mutations
  const createFlavorMutation = useMutation({
    mutationFn: async ({ productId, flavorData }: { productId: string; flavorData: any }) => {
      return apiRequest("POST", `/api/admin/products/${productId}/flavors`, flavorData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products", currentProductForFlavors?.id, "flavors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      resetFlavorForm();
      toast({
        title: "Sabor creado",
        description: "El sabor se ha creado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el sabor",
        variant: "destructive",
      });
    },
  });

  const updateFlavorMutation = useMutation({
    mutationFn: async ({ flavorId, flavorData }: { flavorId: string; flavorData: any }) => {
      return apiRequest("PATCH", `/api/admin/flavors/${flavorId}`, flavorData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products", currentProductForFlavors?.id, "flavors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      resetFlavorForm();
      setEditingFlavor(null);
      toast({
        title: "Sabor actualizado",
        description: "El sabor se ha actualizado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el sabor",
        variant: "destructive",
      });
    },
  });

  const deleteFlavorMutation = useMutation({
    mutationFn: async (flavorId: string) => {
      return apiRequest("DELETE", `/api/admin/flavors/${flavorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products", currentProductForFlavors?.id, "flavors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setDeletingFlavor(null);
      toast({
        title: "Sabor eliminado",
        description: "El sabor se ha eliminado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el sabor",
        variant: "destructive",
      });
    },
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    puffs: "",
    price: "",
    image: "",
    sabores: "",
    description: "",
    popular: false,
    active: true,
    inventory: "0",
    reservedInventory: "0",
    lowStockThreshold: "10",
  });

  // Redirect if not logged in
  if (!user) {
    setLocation("/admin/login");
    return null;
  }

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/admin/products"],
    queryFn: async () => {
      const response = await fetch("/api/admin/products", {
        headers: {
          Authorization: token || "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const result = await response.json();
      return result.data as (Product & { flavors?: ProductFlavor[] })[];
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error("Failed to create product");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Producto creado",
        description: "El producto se ha creado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el producto",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, productData }: { id: string; productData: any }) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error("Failed to update product");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setIsDialogOpen(false);
      resetForm();
      setEditingProduct(null);
      toast({
        title: "Producto actualizado",
        description: "El producto se ha actualizado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      puffs: "",
      price: "",
      image: "",
      sabores: "",
      description: "",
      popular: false,
      active: true,
      inventory: "0",
      reservedInventory: "0",
      lowStockThreshold: "10",
    });
    setFormErrors({});
    setSelectedFile(null);
    setImagePreview("");
  };

  // File upload handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const response = await fetch('/api/admin/products/upload-image', {
        method: 'POST',
        headers: {
          Authorization: token || "",
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const result = await response.json();
      return result.data.imagePath;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        puffs: product.puffs.toString(),
        price: product.price,
        image: product.image || "",
        sabores: product.sabores.join(", "),
        description: product.description || "",
        popular: product.popular,
        active: product.active,
        inventory: product.inventory?.toString() || "0",
        reservedInventory: product.reservedInventory?.toString() || "0",
        lowStockThreshold: product.lowStockThreshold?.toString() || "10",
      });
      // Set image preview for existing product
      if (product.image) {
        setImagePreview(`/uploads/${product.image}`);
      } else {
        setImagePreview("");
      }
      setSelectedFile(null);
    } else {
      setEditingProduct(null);
      resetForm();
    }
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    const inventory = parseInt(formData.inventory) || 0;
    const reservedInventory = parseInt(formData.reservedInventory) || 0;
    const lowStockThreshold = parseInt(formData.lowStockThreshold) || 0;
    
    if (inventory < 0) {
      errors.inventory = "El inventario no puede ser negativo";
    }
    
    if (reservedInventory < 0) {
      errors.reservedInventory = "El inventario reservado no puede ser negativo";
    }
    
    if (reservedInventory > inventory) {
      errors.reservedInventory = "El inventario reservado no puede ser mayor al inventario total";
    }
    
    if (lowStockThreshold < 0) {
      errors.lowStockThreshold = "El umbral de stock bajo no puede ser negativo";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Upload image if a new file is selected
    let imagePath = formData.image;
    if (selectedFile) {
      const uploadedPath = await uploadImage();
      if (uploadedPath) {
        imagePath = uploadedPath;
      } else {
        // Upload failed, don't continue
        return;
      }
    }
    
    // Validate and process sabores array
    const saboresArray = formData.sabores
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    const productData = {
      name: formData.name,
      puffs: parseInt(formData.puffs),
      price: parseFloat(formData.price).toFixed(2), // Ensure proper decimal format
      image: imagePath || undefined,
      sabores: saboresArray,
      description: formData.description || undefined,
      popular: formData.popular,
      active: formData.active,
      inventory: parseInt(formData.inventory) || 0,
      reservedInventory: parseInt(formData.reservedInventory) || 0,
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleToggleActive = (product: Product) => {
    updateProductMutation.mutate({
      id: product.id,
      productData: { active: !product.active }
    });
  };

  // Flavor management functions
  const handleOpenFlavorDialog = (product: Product) => {
    setCurrentProductForFlavors(product);
    setFlavorDialogOpen(true);
    resetFlavorForm();
  };

  const resetFlavorForm = () => {
    setFlavorFormData({
      name: "",
      inventory: "0",
      reservedInventory: "0",
      lowStockThreshold: "5",
      active: true
    });
    setFlavorFormErrors({});
    setEditingFlavor(null);
  };

  const handleEditFlavor = (flavor: ProductFlavor) => {
    setEditingFlavor(flavor);
    setFlavorFormData({
      name: flavor.name,
      inventory: flavor.inventory.toString(),
      reservedInventory: flavor.reservedInventory.toString(),
      lowStockThreshold: flavor.lowStockThreshold.toString(),
      active: flavor.active
    });
    setFlavorFormErrors({});
  };

  const validateFlavorForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!flavorFormData.name.trim()) {
      errors.name = "El nombre del sabor es requerido";
    }
    
    const inventory = parseInt(flavorFormData.inventory) || 0;
    const reservedInventory = parseInt(flavorFormData.reservedInventory) || 0;
    const lowStockThreshold = parseInt(flavorFormData.lowStockThreshold) || 0;
    
    if (inventory < 0) {
      errors.inventory = "El inventario no puede ser negativo";
    }
    
    if (reservedInventory < 0) {
      errors.reservedInventory = "El inventario reservado no puede ser negativo";
    }
    
    if (reservedInventory > inventory) {
      errors.reservedInventory = "El inventario reservado no puede ser mayor al inventario total";
    }
    
    if (lowStockThreshold < 0) {
      errors.lowStockThreshold = "El umbral de stock bajo no puede ser negativo";
    }
    
    setFlavorFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFlavorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFlavorForm() || !currentProductForFlavors) {
      return;
    }
    
    const flavorData = {
      name: flavorFormData.name.trim(),
      inventory: parseInt(flavorFormData.inventory) || 0,
      reservedInventory: parseInt(flavorFormData.reservedInventory) || 0,
      lowStockThreshold: parseInt(flavorFormData.lowStockThreshold) || 5,
      active: flavorFormData.active
    };

    if (editingFlavor) {
      updateFlavorMutation.mutate({ flavorId: editingFlavor.id, flavorData });
    } else {
      createFlavorMutation.mutate({ productId: currentProductForFlavors.id, flavorData });
    }
  };

  const handleDeleteFlavor = () => {
    if (deletingFlavor) {
      deleteFlavorMutation.mutate(deletingFlavor.id);
    }
  };

  // Helper function to get stock status badge for backward compatibility
  const getStockStatusBadge = (product: Product) => {
    const status = getStockStatus(product);
    
    switch (status) {
      case 'out_of_stock':
        return (
          <Badge variant="outline" className="border-red-500/50 text-red-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Sin Stock
          </Badge>
        );
      case 'low_stock':
        return (
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
            <TrendingDown className="w-3 h-3 mr-1" />
            Stock Bajo
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            En Stock
          </Badge>
        );
    }
  };

  // Helper function to get flavor stock status badge
  const getFlavorStockStatusBadge = (flavor: ProductFlavor) => {
    const status = getFlavorStockStatus(flavor);
    const available = getFlavorAvailableInventory(flavor);
    
    switch (status) {
      case 'out_of_stock':
        return (
          <Badge variant="outline" className="border-red-500/50 text-red-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Sin Stock
          </Badge>
        );
      case 'low_stock':
        return (
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
            <TrendingDown className="w-3 h-3 mr-1" />
            Stock Bajo
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            En Stock
          </Badge>
        );
    }
  };

  // Helper function to get product stock status badge (based on flavors if available)
  const getProductStockStatusBadge = (product: Product & { flavors?: ProductFlavor[] }) => {
    if (product.flavors && product.flavors.length > 0) {
      // Calculate total available inventory from all active flavors
      const totalAvailable = product.flavors
        .filter(f => f.active)
        .reduce((sum, flavor) => sum + getFlavorAvailableInventory(flavor), 0);
      
      if (totalAvailable === 0) {
        return (
          <Badge variant="outline" className="border-red-500/50 text-red-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Sin Stock
          </Badge>
        );
      }
      
      // Check if any active flavor is low stock
      const hasLowStock = product.flavors
        .filter(f => f.active)
        .some(f => getFlavorStockStatus(f) === 'low_stock');
      
      if (hasLowStock) {
        return (
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
            <TrendingDown className="w-3 h-3 mr-1" />
            Stock Bajo
          </Badge>
        );
      }
      
      return (
        <Badge variant="outline" className="border-green-500/50 text-green-400">
          <CheckCircle className="w-3 h-3 mr-1" />
          En Stock
        </Badge>
      );
    }
    
    // Fallback to product-level inventory for backward compatibility
    const status = getStockStatus(product);
    switch (status) {
      case 'out_of_stock':
        return (
          <Badge variant="outline" className="border-red-500/50 text-red-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Sin Stock
          </Badge>
        );
      case 'low_stock':
        return (
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
            <TrendingDown className="w-3 h-3 mr-1" />
            Stock Bajo
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            En Stock
          </Badge>
        );
    }
  };

  // Helper function to get total available inventory for product
  const getProductTotalAvailable = (product: Product & { flavors?: ProductFlavor[] }) => {
    if (product.flavors && product.flavors.length > 0) {
      return product.flavors
        .filter(f => f.active)
        .reduce((sum, flavor) => sum + getFlavorAvailableInventory(flavor), 0);
    }
    return getAvailableInventory(product);
  };

  // Helper function to sort products
  const sortedProducts = [...(products || [])].sort((a, b) => {
    switch (sortBy) {
      case 'stock':
        return getProductTotalAvailable(a) - getProductTotalAvailable(b);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Flavor Display Section Component
  const FlavorDisplaySection = ({ product }: { product: Product }) => {
    const { data: flavors, isLoading: flavorsLoading } = useQuery({
      queryKey: ["/api/admin/products", product.id, "flavors"],
      enabled: !!product.id,
    });

    if (flavorsLoading) {
      return (
        <div className="mb-3">
          <p className="text-sm text-gray-400 mb-2">Sabores:</p>
          <Skeleton className="h-6 w-32 bg-gray-800" />
        </div>
      );
    }

    // Ensure flavors is an array and has proper typing
    const flavorsList = Array.isArray(flavors) ? flavors as ProductFlavor[] : [];

    if (!flavorsList || flavorsList.length === 0) {
      return (
        <div className="mb-3">
          <p className="text-sm text-gray-400 mb-2">Sabores:</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-gray-500 text-gray-400">
              Sin sabores registrados
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenFlavorDialog(product)}
              className="text-xs text-blue-400 p-1 h-auto"
            >
              Agregar sabores
            </Button>
          </div>
        </div>
      );
    }

    const activeFlavors = flavorsList.filter((f: ProductFlavor) => f.active);
    const visibleFlavors = activeFlavors.slice(0, 3);
    const totalFlavors = activeFlavors.length;

    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-400">Sabores ({totalFlavors}):</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenFlavorDialog(product)}
            className="text-xs text-blue-400 p-1 h-auto"
          >
            Gestionar
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {visibleFlavors.map((flavor: any) => (
            <div key={flavor.id} className="flex items-center">
              {getFlavorStockStatusBadge(flavor)}
            </div>
          ))}
          {totalFlavors > 3 && (
            <Badge variant="outline" className="text-xs border-gray-500 text-gray-400">
              +{totalFlavors - 3} más
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
              <h1 className="text-2xl font-bold text-white">Gestión de Productos</h1>
              <p className="text-gray-400">Administrar catálogo de productos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'stock' | 'created')}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="name">Nombre</SelectItem>
                <SelectItem value="stock">Stock Disponible</SelectItem>
                <SelectItem value="created">Fecha de Creación</SelectItem>
              </SelectContent>
            </Select>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => handleOpenDialog()}
                  className="bg-purple-600 hover:bg-purple-700"
                  data-testid="button-add-product"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Producto
                </Button>
              </DialogTrigger>
            <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre del Producto</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="bg-gray-800 border-gray-700"
                      data-testid="input-product-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="puffs">Número de Puffs</Label>
                    <Input
                      id="puffs"
                      type="number"
                      value={formData.puffs}
                      onChange={(e) => setFormData(prev => ({ ...prev, puffs: e.target.value }))}
                      required
                      className="bg-gray-800 border-gray-700"
                      data-testid="input-product-puffs"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Precio (Q)</Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      required
                      placeholder="25.00"
                      className="bg-gray-800 border-gray-700"
                      data-testid="input-product-price"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Imagen del Producto (opcional)</Label>
                    <div className="space-y-3">
                      {/* File upload input */}
                      <div className="flex items-center gap-3">
                        <Input
                          id="image"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleFileSelect}
                          className="bg-gray-800 border-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                          data-testid="input-product-image"
                        />
                        {isUploading && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Subiendo...
                          </div>
                        )}
                      </div>
                      
                      {/* Image preview */}
                      {imagePreview && (
                        <div className="relative">
                          <Label className="text-sm text-gray-400">Vista previa:</Label>
                          <div className="mt-2 relative w-32 h-32 border-2 border-gray-600 rounded-lg overflow-hidden bg-gray-800">
                            <img
                              src={imagePreview}
                              alt="Vista previa"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 w-6 h-6"
                              onClick={() => {
                                setSelectedFile(null);
                                setImagePreview("");
                                // Clear the file input
                                const fileInput = document.getElementById('image') as HTMLInputElement;
                                if (fileInput) fileInput.value = '';
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Current image indicator for editing */}
                      {editingProduct && formData.image && !selectedFile && !imagePreview && (
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Imagen actual: {formData.image}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Formatos soportados: JPG, PNG, WebP. Tamaño máximo: 5MB
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sabores">Sabores (separados por comas)</Label>
                  <Input
                    id="sabores"
                    value={formData.sabores}
                    onChange={(e) => setFormData(prev => ({ ...prev, sabores: e.target.value }))}
                    placeholder="Fresa, Menta, Uva"
                    className="bg-gray-800 border-gray-700"
                    data-testid="input-product-flavors"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción (opcional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-gray-800 border-gray-700"
                    data-testid="input-product-description"
                  />
                </div>

                {/* Inventory Management Section */}
                <div className="space-y-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-400" />
                    <h3 className="text-lg font-medium text-white">Gestión de Inventario</h3>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Configure el inventario para realizar seguimiento del stock</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="inventory">Inventario Total</Label>
                      <Input
                        id="inventory"
                        type="number"
                        min="0"
                        value={formData.inventory}
                        onChange={(e) => setFormData(prev => ({ ...prev, inventory: e.target.value }))}
                        className={`bg-gray-800 border-gray-700 ${formErrors.inventory ? 'border-red-500' : ''}`}
                        data-testid="input-product-inventory"
                      />
                      {formErrors.inventory && (
                        <p className="text-red-400 text-sm mt-1">{formErrors.inventory}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="reservedInventory">Inventario Reservado</Label>
                      <Input
                        id="reservedInventory"
                        type="number"
                        min="0"
                        value={formData.reservedInventory}
                        onChange={(e) => setFormData(prev => ({ ...prev, reservedInventory: e.target.value }))}
                        className={`bg-gray-800 border-gray-700 ${formErrors.reservedInventory ? 'border-red-500' : ''}`}
                        data-testid="input-product-reserved-inventory"
                      />
                      {formErrors.reservedInventory && (
                        <p className="text-red-400 text-sm mt-1">{formErrors.reservedInventory}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="lowStockThreshold">Umbral Stock Bajo</Label>
                      <Input
                        id="lowStockThreshold"
                        type="number"
                        min="0"
                        value={formData.lowStockThreshold}
                        onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                        className={`bg-gray-800 border-gray-700 ${formErrors.lowStockThreshold ? 'border-red-500' : ''}`}
                        data-testid="input-product-low-stock-threshold"
                      />
                      {formErrors.lowStockThreshold && (
                        <p className="text-red-400 text-sm mt-1">{formErrors.lowStockThreshold}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded">
                    <p><strong>Disponible:</strong> {Math.max(0, parseInt(formData.inventory) - parseInt(formData.reservedInventory))} unidades</p>
                    <p className="text-xs mt-1">Stock disponible = Inventario total - Inventario reservado</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="popular"
                      checked={formData.popular}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, popular: checked }))}
                      data-testid="switch-product-popular"
                    />
                    <Label htmlFor="popular">Producto Popular</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                      data-testid="switch-product-active"
                    />
                    <Label htmlFor="active">Producto Activo</Label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending || isUploading}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-save-product"
                  >
                    {isUploading ? 
                      "Subiendo imagen..." :
                      (createProductMutation.isPending || updateProductMutation.isPending ? 
                        "Guardando..." : 
                        `${editingProduct ? "Actualizar" : "Crear"} Producto`
                      )
                    }
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-gray-700"
                    data-testid="button-cancel-product"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
            
            <AdminProfileDropdown />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Product List and Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-gray-900 border-purple-500/20">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 bg-gray-800" />
                  <Skeleton className="h-4 w-1/2 bg-gray-800" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-40 w-full bg-gray-800 mb-4" />
                  <Skeleton className="h-4 w-full bg-gray-800 mb-2" />
                  <Skeleton className="h-4 w-3/4 bg-gray-800" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <Card key={product.id} className="bg-gray-900 border-purple-500/20 hover-elevate" data-testid={`product-card-${product.id}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white truncate">
                    {product.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {/* Product status and stock badges */}
                    {getStockStatusBadge(product)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                        <DropdownMenuItem
                          onClick={() => handleOpenDialog(product)}
                          className="text-white hover:bg-gray-700 cursor-pointer"
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenFlavorDialog(product)}
                          className="text-white hover:bg-gray-700 cursor-pointer"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Gestionar Sabores
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingProduct(product)}
                          className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Product image */}
                  <div className="aspect-square relative mb-4 bg-gray-800 rounded-md overflow-hidden">
                    {product.image ? (
                      <img
                        src={`/uploads/${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    {!product.active && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <EyeOff className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Product details */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Puffs:</span>
                      <span className="text-white font-medium">{product.puffs.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Precio:</span>
                      <span className="text-white font-medium">Q{parseFloat(product.price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Stock Total:</span>
                      <span className="text-white font-medium">{getAvailableInventory(product)}</span>
                    </div>
                    
                    {/* Flavors summary */}
                    <FlavorDisplaySection product={product} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-900 border-purple-500/20">
            <CardContent className="text-center py-12">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No hay productos</h3>
              <p className="text-gray-400 mb-4">Comienza agregando tu primer producto al catálogo</p>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Producto
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Product Creation/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="bg-gray-800 border-gray-700"
                  data-testid="input-product-name"
                />
              </div>
              <div>
                <Label htmlFor="puffs">Número de Puffs</Label>
                <Input
                  id="puffs"
                  type="number"
                  value={formData.puffs}
                  onChange={(e) => setFormData(prev => ({ ...prev, puffs: e.target.value }))}
                  required
                  className="bg-gray-800 border-gray-700"
                  data-testid="input-product-puffs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Precio (Q)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                  className="bg-gray-800 border-gray-700"
                  data-testid="input-product-price"
                />
              </div>
              <div>
                <Label htmlFor="sabores">Sabores (separados por coma)</Label>
                <Input
                  id="sabores"
                  value={formData.sabores}
                  onChange={(e) => setFormData(prev => ({ ...prev, sabores: e.target.value }))}
                  placeholder="Ej: Fresa, Menta, Uva"
                  className="bg-gray-800 border-gray-700"
                  data-testid="input-product-sabores"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-gray-800 border-gray-700"
                rows={3}
                data-testid="textarea-product-description"
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <Label htmlFor="image">Imagen del Producto</Label>
              <div className="mt-1">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="bg-gray-800 border-gray-700"
                  data-testid="input-product-image"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Vista previa:</p>
                    <div className="relative w-32 h-32 bg-gray-800 rounded-md overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                data-testid="switch-product-active"
              />
              <Label htmlFor="active">Producto Activo</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createProductMutation.isPending || updateProductMutation.isPending || isUploading}
                className="bg-purple-600 hover:bg-purple-700"
                data-testid="button-save-product"
              >
                {isUploading ? 
                  "Subiendo imagen..." :
                  (createProductMutation.isPending || updateProductMutation.isPending ? 
                    "Guardando..." : 
                    `${editingProduct ? "Actualizar" : "Crear"} Producto`
                  )
                }
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-700"
                data-testid="button-cancel-product"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Flavor Management Dialog */}
          <Dialog open={flavorDialogOpen} onOpenChange={setFlavorDialogOpen}>
            <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Gestionar Sabores - {currentProductForFlavors?.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                {/* Left side - Add/Edit flavor form */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">
                    {editingFlavor ? "Editar Sabor" : "Agregar Nuevo Sabor"}
                  </h3>
                  
                  <form onSubmit={handleFlavorSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="flavor-name">Nombre del Sabor</Label>
                      <Input
                        id="flavor-name"
                        value={flavorFormData.name}
                        onChange={(e) => setFlavorFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder="Ej: Fresa, Menta, etc."
                        className={`bg-gray-800 border-gray-700 ${flavorFormErrors.name ? 'border-red-500' : ''}`}
                        data-testid="input-flavor-name"
                      />
                      {flavorFormErrors.name && (
                        <p className="text-red-400 text-sm mt-1">{flavorFormErrors.name}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="flavor-inventory">Inventario</Label>
                        <Input
                          id="flavor-inventory"
                          type="number"
                          min="0"
                          value={flavorFormData.inventory}
                          onChange={(e) => setFlavorFormData(prev => ({ ...prev, inventory: e.target.value }))}
                          className={`bg-gray-800 border-gray-700 ${flavorFormErrors.inventory ? 'border-red-500' : ''}`}
                          data-testid="input-flavor-inventory"
                        />
                        {flavorFormErrors.inventory && (
                          <p className="text-red-400 text-sm mt-1">{flavorFormErrors.inventory}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="flavor-reserved">Reservado</Label>
                        <Input
                          id="flavor-reserved"
                          type="number"
                          min="0"
                          value={flavorFormData.reservedInventory}
                          onChange={(e) => setFlavorFormData(prev => ({ ...prev, reservedInventory: e.target.value }))}
                          className={`bg-gray-800 border-gray-700 ${flavorFormErrors.reservedInventory ? 'border-red-500' : ''}`}
                          data-testid="input-flavor-reserved"
                        />
                        {flavorFormErrors.reservedInventory && (
                          <p className="text-red-400 text-sm mt-1">{flavorFormErrors.reservedInventory}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="flavor-threshold">Umbral</Label>
                        <Input
                          id="flavor-threshold"
                          type="number"
                          min="0"
                          value={flavorFormData.lowStockThreshold}
                          onChange={(e) => setFlavorFormData(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                          className={`bg-gray-800 border-gray-700 ${flavorFormErrors.lowStockThreshold ? 'border-red-500' : ''}`}
                          data-testid="input-flavor-threshold"
                        />
                        {flavorFormErrors.lowStockThreshold && (
                          <p className="text-red-400 text-sm mt-1">{flavorFormErrors.lowStockThreshold}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="flavor-active"
                        checked={flavorFormData.active}
                        onCheckedChange={(checked) => setFlavorFormData(prev => ({ ...prev, active: checked }))}
                        data-testid="switch-flavor-active"
                      />
                      <Label htmlFor="flavor-active">Sabor Activo</Label>
                    </div>

                    <div className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded">
                      <p><strong>Disponible:</strong> {Math.max(0, parseInt(flavorFormData.inventory || "0") - parseInt(flavorFormData.reservedInventory || "0"))} unidades</p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={createFlavorMutation.isPending || updateFlavorMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid="button-save-flavor"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {editingFlavor ? "Actualizar" : "Crear"} Sabor
                      </Button>
                      
                      {editingFlavor && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetFlavorForm}
                          className="border-gray-700"
                          data-testid="button-cancel-edit-flavor"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar Edición
                        </Button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Right side - Flavor list */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Sabores Existentes</h3>
                    {productFlavors && (
                      <Badge variant="outline" className="text-gray-300">
                        {productFlavors.length} sabores
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {flavorsLoading ? (
                      [...Array(3)].map((_, i) => (
                        <Card key={i} className="bg-gray-800 border-gray-700">
                          <CardContent className="p-3">
                            <Skeleton className="h-4 w-24 bg-gray-700 mb-2" />
                            <Skeleton className="h-3 w-16 bg-gray-700" />
                          </CardContent>
                        </Card>
                      ))
                    ) : productFlavors && productFlavors.length > 0 ? (
                      productFlavors.map((flavor) => (
                        <Card key={flavor.id} className="bg-gray-800 border-gray-700">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-white">{flavor.name}</h4>
                                  {getFlavorStockStatusBadge(flavor)}
                                  {!flavor.active && (
                                    <Badge variant="outline" className="text-gray-400 border-gray-500">
                                      Inactivo
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 space-y-1">
                                  <p>Total: {flavor.inventory} | Reservado: {flavor.reservedInventory} | Disponible: {getFlavorAvailableInventory(flavor)}</p>
                                  <p>Umbral: {flavor.lowStockThreshold}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditFlavor(flavor)}
                                  data-testid={`button-edit-flavor-${flavor.id}`}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingFlavor(flavor)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  data-testid={`button-delete-flavor-${flavor.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="text-center py-8">
                          <Package className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-400">No hay sabores registrados</p>
                          <p className="text-xs text-gray-500 mt-1">Agrega sabores para este producto</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFlavorDialogOpen(false);
                    resetFlavorForm();
                    setCurrentProductForFlavors(null);
                  }}
                  className="border-gray-700"
                  data-testid="button-close-flavor-dialog"
                >
                  Cerrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Flavor Confirmation Dialog */}
          <AlertDialog open={!!deletingFlavor} onOpenChange={() => setDeletingFlavor(null)}>
            <AlertDialogContent className="bg-gray-900 border-red-500/20 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-400">¿Eliminar Sabor?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">
                  ¿Estás seguro de que deseas eliminar el sabor "{deletingFlavor?.name}"? 
                  Esta acción no se puede deshacer y se perderán todos los datos de inventario asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  onClick={() => setDeletingFlavor(null)}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  data-testid="button-cancel-delete-flavor"
                >
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteFlavor}
                  disabled={deleteFlavorMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  data-testid="button-confirm-delete-flavor"
                >
                  {deleteFlavorMutation.isPending ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

      <div className="max-w-7xl mx-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-gray-900 border-purple-500/20">
                <CardHeader>
                  <Skeleton className="h-6 w-32 bg-gray-800" />
                  <Skeleton className="h-4 w-20 bg-gray-800" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 bg-gray-800" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {products?.length === 0 ? (
              <Card className="bg-gray-900 border-purple-500/20">
                <CardContent className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No hay productos registrados</h3>
                  <p className="text-gray-400 mb-4">Comienza agregando productos a tu catálogo</p>
                  <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primer Producto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts?.map((product) => (
                  <Card key={product.id} className="bg-gray-900 border-purple-500/20">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2 flex-wrap">
                            {product.name}
                            {product.popular && (
                              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400">
                                Popular
                              </Badge>
                            )}
                            {getProductStockStatusBadge(product)}
                          </CardTitle>
                          <p className="text-sm text-gray-400">{product.puffs} puffs • Q{product.price}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="text-xs text-purple-300">
                                  Disponible: {getAvailableInventory(product)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <p>Total: {product.inventory || 0}</p>
                                  <p>Reservado: {product.reservedInventory || 0}</p>
                                  <p>Disponible: {getAvailableInventory(product)}</p>
                                  <p>Umbral: {product.lowStockThreshold || 10}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(product)}
                            data-testid={`button-toggle-${product.id}`}
                          >
                            {product.active ? (
                              <Eye className="w-4 h-4 text-green-400" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(product)}
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Edit2 className="w-4 h-4 text-purple-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenFlavorDialog(product)}
                            data-testid={`button-manage-flavors-${product.id}`}
                          >
                            <Settings className="w-4 h-4 text-blue-400" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      
                      <FlavorDisplaySection product={product} />

                      {product.description && (
                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Inventory Status Bar */}
                      <div className="mb-3 p-2 bg-gray-800/50 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-400">Gestión de Stock</span>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-3 h-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs max-w-48">
                                <p><strong>Total:</strong> {product.inventory || 0} unidades</p>
                                <p><strong>Reservado:</strong> {product.reservedInventory || 0} unidades</p>
                                <p><strong>Disponible:</strong> {getAvailableInventory(product)} unidades</p>
                                <p><strong>Umbral bajo:</strong> {product.lowStockThreshold || 10} unidades</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              isOutOfStock(product) 
                                ? 'bg-red-500' 
                                : isLowStock(product) 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'
                            }`}
                            style={{ 
                              width: `${Math.min(100, ((product.inventory || 0) > 0 ? (getAvailableInventory(product) / (product.inventory || 1)) * 100 : 0))}%` 
                            }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className={`${
                            isOutOfStock(product) 
                              ? 'text-red-400' 
                              : isLowStock(product) 
                                ? 'text-yellow-400' 
                                : 'text-green-400'
                          }`}>
                            {getAvailableInventory(product)} disponible
                          </span>
                          <span className="text-gray-500">
                            de {product.inventory || 0} total
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Estado: {product.active ? "Activo" : "Inactivo"}</span>
                        <span>Creado: {new Date(product.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Flavor Management Dialog */}
      <Dialog open={flavorDialogOpen} onOpenChange={setFlavorDialogOpen}>
        <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Gestionar Sabores - {currentProductForFlavors?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">
              {editingFlavor ? "Editar Sabor" : "Agregar Nuevo Sabor"}
            </h3>
            
            <form onSubmit={handleFlavorSubmit} className="space-y-4">
              <div>
                <Label htmlFor="flavor-name">Nombre del Sabor</Label>
                <Input
                  id="flavor-name"
                  value={flavorFormData.name}
                  onChange={(e) => setFlavorFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Ej: Fresa, Menta, etc."
                  className={`bg-gray-800 border-gray-700 ${flavorFormErrors.name ? 'border-red-500' : ''}`}
                  data-testid="input-flavor-name"
                />
                {flavorFormErrors.name && (
                  <p className="text-red-400 text-sm mt-1">{flavorFormErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="flavor-inventory">Inventario</Label>
                  <Input
                    id="flavor-inventory"
                    type="number"
                    min="0"
                    value={flavorFormData.inventory}
                    onChange={(e) => setFlavorFormData(prev => ({ ...prev, inventory: e.target.value }))}
                    className={`bg-gray-800 border-gray-700 ${flavorFormErrors.inventory ? 'border-red-500' : ''}`}
                    data-testid="input-flavor-inventory"
                  />
                  {flavorFormErrors.inventory && (
                    <p className="text-red-400 text-sm mt-1">{flavorFormErrors.inventory}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="flavor-reserved">Reservado</Label>
                  <Input
                    id="flavor-reserved"
                    type="number"
                    min="0"
                    value={flavorFormData.reservedInventory}
                    onChange={(e) => setFlavorFormData(prev => ({ ...prev, reservedInventory: e.target.value }))}
                    className={`bg-gray-800 border-gray-700 ${flavorFormErrors.reservedInventory ? 'border-red-500' : ''}`}
                    data-testid="input-flavor-reserved"
                  />
                  {flavorFormErrors.reservedInventory && (
                    <p className="text-red-400 text-sm mt-1">{flavorFormErrors.reservedInventory}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="flavor-threshold">Umbral</Label>
                  <Input
                    id="flavor-threshold"
                    type="number"
                    min="0"
                    value={flavorFormData.lowStockThreshold}
                    onChange={(e) => setFlavorFormData(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                    className={`bg-gray-800 border-gray-700 ${flavorFormErrors.lowStockThreshold ? 'border-red-500' : ''}`}
                    data-testid="input-flavor-threshold"
                  />
                  {flavorFormErrors.lowStockThreshold && (
                    <p className="text-red-400 text-sm mt-1">{flavorFormErrors.lowStockThreshold}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="flavor-active"
                  checked={flavorFormData.active}
                  onCheckedChange={(checked) => setFlavorFormData(prev => ({ ...prev, active: checked }))}
                  data-testid="switch-flavor-active"
                />
                <Label htmlFor="flavor-active">Sabor Activo</Label>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createFlavorMutation.isPending || updateFlavorMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-save-flavor"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingFlavor ? "Actualizar" : "Crear"} Sabor
                </Button>
                
                {editingFlavor && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetFlavorForm}
                    className="border-gray-700"
                    data-testid="button-cancel-edit-flavor"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar Edición
                  </Button>
                )}
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Flavor Confirmation Dialog */}
      <AlertDialog open={!!deletingFlavor} onOpenChange={() => setDeletingFlavor(null)}>
        <AlertDialogContent className="bg-gray-900 border-red-500/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">¿Eliminar Sabor?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              ¿Estás seguro de que deseas eliminar el sabor "{deletingFlavor?.name}"? 
              Esta acción no se puede deshacer y se perderán todos los datos de inventario asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeletingFlavor(null)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              data-testid="button-cancel-delete-flavor"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFlavor}
              disabled={deleteFlavorMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-confirm-delete-flavor"
            >
              {deleteFlavorMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent className="bg-gray-900 border-red-500/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">¿Eliminar Producto?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              ¿Estás seguro de que deseas eliminar el producto "{deletingProduct?.name}"? 
              Esta acción no se puede deshacer y se perderán todos los datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeletingProduct(null)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              data-testid="button-cancel-delete-product"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingProduct) {
                  // TODO: Implement delete product mutation
                  setDeletingProduct(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-confirm-delete-product"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}