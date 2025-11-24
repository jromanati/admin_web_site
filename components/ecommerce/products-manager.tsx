// components/ecommerce/products-manager.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  LayoutGrid,
  List,
  Eye,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import type { Product, ProductResponse } from "@/types/ecomerces/products"
import { ProductsService } from "@/services/ecomerce/products/products.service"
import { AuthService } from "@/services/auth.service"
import useSWR, { mutate } from "swr"
import { useRouter } from "next/navigation"

interface ProductsManagerProps {
  siteId: string
}

export function ProductsManager({ siteId }: ProductsManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [userToDelete, setUserToDelete] = useState<Product | null>(null)
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
  const [isLoading, setisLoading] = useState(true)

  // 👇 NUEVO: modo de vista (grid / list)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const rawUserData = localStorage.getItem("user_data")
    const rawClientData = localStorage.getItem("tenant_data")
    const tenant_data = rawUserData ? JSON.parse(rawClientData) : null
    if (tenant_data.styles_site) {
      setSecondBackgroundColor(tenant_data.styles_site.second_background_color)
      setPrincipalText(tenant_data.styles_site.principal_text)
      setPrincipalHoverBackground(tenant_data.styles_site.principal_hover_background)
      setSecondHoverBackground(tenant_data.styles_site.second_hover_background)
      setPrincipalHoverText(tenant_data.styles_site.principal_hover_text)
    }
  }, [])

  const fetchedProducts = async () => {
    const isValid = AuthService.isTokenValid()
    if (!isValid) {
      const isRefreshValid = await AuthService.isRefreshTokenValid()
      if (!isRefreshValid) window.location.href = "/"
    }
    const featuresResponse = await ProductsService.getProducts()
    const fetchedFeatures = featuresResponse || []
    setisLoading(false)
    return fetchedFeatures.map((feature: any) => ({
      ...feature,
    }))
  }

  const { data: products = [] } = useSWR("products", fetchedProducts)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || product.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleToggleStatus = async (id: number) => {
    const response = await ProductsService.activeProduct(id)
    if (response.success) {
      mutate(
        "products",
        (current: User[] = []) => {
          const updated = current.map((cat) => (cat.id === id ? response.data : cat))
          localStorage.setItem("products", JSON.stringify(updated))
          return updated
        },
        false
      )
    }
  }

  const getStatusBadge = (is_active: boolean) => {
    if (is_active) {
      return <Badge variant="default">Activo</Badge>
    }
    return <Badge variant="secondary">Inactivo</Badge>
    switch (status) {
      case true:
        return <Badge variant="default">Activo</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactivo</Badge>
      case "out_of_stock":
        return <Badge variant="destructive">Sin Stock</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const handleDeleteProduct = (product: Product) => {
    setUserToDelete(product)
  }

  const deleteUser = async (userId: number) => {
    const response = await ProductsService.deleteProduct(userId)

    if (response.success) {
      mutate(
        "products",
        (current: Product[] = []) => {
          const updated = current.filter((cat) => cat.id !== Number(userId))
          localStorage.setItem("products", JSON.stringify(updated))
          return updated
        },
        false
      )
    }
  }

  const confirmDeleteUser = () => {
    if (userToDelete) {
      setUserToDelete(null)
      deleteUser(userToDelete.id)
    }
  }

  const router = useRouter()
  const handleClick = (route: string) => {
    setisLoading(true)
    router.push(route)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Loader */}
      {isLoading ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F2CFCE]/30 border-t-[#F2CFCE]" />
            <p className="text-sm text-muted-foreground">Cargando…</p>
          </div>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className={`border-b border-border ${secondBackgroundColor} ${principalText}`}>
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:h-16 sm:items-center sm:justify-between py-3 sm:py-0">
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-xl font-semibold">Gestión de Productos</h1>
                    <p className="text-sm">Administra tu catálogo de productos</p>
                  </div>
                </div>
                <Button onClick={() => handleClick("/dashboard/ecommerce/products/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </Button>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Filtros + toggle de vista */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto md:items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="p-2 border border-border rounded-md bg-background"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                  <option value="out_of_stock">Sin Stock</option>
                </select>
              </div>

              {/* 👇 NUEVO: botones para cambiar vista */}
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Info de resultados */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredProducts.length === 0 ? 0 : startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, filteredProducts.length)} de {filteredProducts.length} productos
              </p>
            </div>

            {/* Lista vacía */}
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? "No se encontraron productos" : "No hay productos"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando tu primer producto"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => (window.location.href = `/dashboard/ecommerce/products/create`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Producto
                  </Button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              // 👇 Vista GRID (igual que antes)
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paginatedProducts.map((product) => (
                  <Card key={product.id} className={`${secondBackgroundColor} ${principalText}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{product.name}</CardTitle>
                            <p className="text-sm ">SKU: {product.sku}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClick(`/dashboard/ecommerce/products/edit/${product.id}`)}
                            className={`${principalHoverBackground} `}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(product.id)}
                            className={`${principalHoverBackground} `}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                            className={`${principalHoverBackground}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className={`mb-3 ${principalText}`} style={{ whiteSpace: "pre-line" }}>
                        {product.description}
                      </CardDescription>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm ">Precio:</span>
                          <span className="font-semibold">${product.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm ">Stock:</span>
                          <span>{product.stock} unidades</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm ">Categoría:</span>
                          <Badge variant="outline" className={`${principalText}`}>
                            {product.category_path}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm ">Estado:</span>
                          {getStatusBadge(product.is_active)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // 👇 Vista LISTA (similar al PropertiesManager)
              <div className="space-y-4">
                {paginatedProducts.map((product) => (
                  <Card key={product.id} className={`${secondBackgroundColor} ${principalText}`}>
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="h-14 w-14 sm:h-16 sm:w-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-base sm:text-lg font-semibold">{product.name}</h3>
                              {getStatusBadge(product.is_active)}
                            </div>
                            <p className="text-sm opacity-80 mb-1">SKU: {product.sku}</p>
                            <p className={`mb-3 ${principalText}`}>
                              {product.description}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
                              <div>
                                <span className="text-sm">Precio:</span>
                                <div className="font-semibold">${product.price}</div>
                              </div>
                              <div>
                                <span className="text-sm">Stock:</span>
                                <div>{product.stock} unidades</div>
                              </div>
                              <div>
                                <span className="text-sm">Categoría:</span>
                                <div>
                                  <Badge variant="outline" className={`${principalText}`}>
                                    {product.category_path}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex space-x-1 sm:ml-4 order-first sm:order-last justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClick(`/dashboard/ecommerce/products/edit/${product.id}`)}
                            className={`${principalHoverBackground}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(product.id)}
                            className={`${principalHoverBackground}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                            className={`${principalHoverBackground}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* 👇 Paginación con el mismo componente que propiedades */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent className="flex flex-wrap gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>

          {/* Dialog de confirmación para eliminar */}
          <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Confirmar Eliminación
                </DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar el producto: "{userToDelete?.name}"?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Advertencia:</strong> Esta acción eliminará permanentemente
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setUserToDelete(null)}
                  className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteUser}
                  className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                >
                  Eliminar Producto
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}
