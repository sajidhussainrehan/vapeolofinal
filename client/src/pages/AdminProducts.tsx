import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Plus,
  Package,
  Edit2,
  Eye,
  EyeOff
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  puffs: number;
  price: string;
  image?: string;
  sabores: string[];
  description?: string;
  popular: boolean;
  active: boolean;
  createdAt: string;
}

export default function AdminProducts() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
      return result.data as Product[];
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
    });
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
      });
    } else {
      setEditingProduct(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate and process sabores array
    const saboresArray = formData.sabores
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    const productData = {
      name: formData.name,
      puffs: parseInt(formData.puffs),
      price: parseFloat(formData.price).toFixed(2), // Ensure proper decimal format
      image: formData.image || undefined,
      sabores: saboresArray,
      description: formData.description || undefined,
      popular: formData.popular,
      active: formData.active,
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
                    <Label htmlFor="image">URL de Imagen (opcional)</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://..."
                      className="bg-gray-800 border-gray-700"
                      data-testid="input-product-image"
                    />
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
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-save-product"
                  >
                    {editingProduct ? "Actualizar" : "Crear"} Producto
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
        </div>
      </header>

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
                {products?.map((product) => (
                  <Card key={product.id} className="bg-gray-900 border-purple-500/20">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            {product.name}
                            {product.popular && (
                              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400">
                                Popular
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-gray-400">{product.puffs} puffs • Q{product.price}</p>
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
                      
                      {product.sabores.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-400 mb-2">Sabores:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.sabores.slice(0, 3).map((sabor, index) => (
                              <Badge key={index} variant="outline" className="text-xs border-purple-500/50 text-purple-300">
                                {sabor}
                              </Badge>
                            ))}
                            {product.sabores.length > 3 && (
                              <Badge variant="outline" className="text-xs border-gray-500 text-gray-400">
                                +{product.sabores.length - 3} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {product.description && (
                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}

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
    </div>
  );
}