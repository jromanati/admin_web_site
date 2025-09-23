"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  Package,
  Tag,
  DollarSign,
  Cloud,
  HardDrive,
  Download,
  CreditCard,
  AlertTriangle,
  Edit,
  LayoutDashboard
} from "lucide-react"
import { AdminLayout } from "../admin-layout"
import { EcomerceService } from "@/services/ecomerce/categories/ecomerce.service"
import { AuthService } from "@/services/auth.service"

interface EcommerceDashboardProps {
  siteId: string
}

const mockStats = {
  totalProducts: 145,
  totalCategories: 12,
  totalOrders: 89,
  totalRevenue: 15420,
  monthlyGrowth: 12.5,
  activeCustomers: 234,
}

const recentOrders = [
  { id: "ORD-001", customer: "María García", total: 89.99, status: "completed", date: "2024-01-15" },
  { id: "ORD-002", customer: "Juan Pérez", total: 156.5, status: "pending", date: "2024-01-15" },
  { id: "ORD-003", customer: "Ana López", total: 75.25, status: "processing", date: "2024-01-14" },
  { id: "ORD-004", customer: "Carlos Ruiz", total: 203.8, status: "completed", date: "2024-01-14" },
]

const topProducts = [
  { name: "Camiseta Premium", sales: 45, revenue: 1350 },
  { name: "Jeans Clásicos", sales: 32, revenue: 1920 },
  { name: "Zapatillas Deportivas", sales: 28, revenue: 2240 },
  { name: "Chaqueta de Cuero", sales: 15, revenue: 2250 },
]

const lowStockProducts = [
  {
    id: "PROD-001",
    name: "Camiseta Azul Premium",
    category: "Ropa > Camisetas",
    currentStock: 0,
    minStock: 10,
    status: "out_of_stock",
    image: "/blue-shirt.png",
    lastSale: "2024-01-14",
  },
  {
    id: "PROD-002",
    name: "Jeans Negros Clásicos",
    category: "Ropa > Pantalones",
    currentStock: 3,
    minStock: 15,
    status: "low_stock",
    image: "/black-jeans.png",
    lastSale: "2024-01-15",
  },
  {
    id: "PROD-003",
    name: "Zapatillas Blancas",
    category: "Calzado > Deportivas",
    currentStock: 5,
    minStock: 20,
    status: "low_stock",
    image: "/white-sneakers.png",
    lastSale: "2024-01-15",
  },
  {
    id: "PROD-004",
    name: "Chaqueta de Cuero Marrón",
    category: "Ropa > Chaquetas",
    currentStock: 1,
    minStock: 8,
    status: "critical_stock",
    image: "/brown-leather-jacket.png",
    lastSale: "2024-01-13",
  },
]

export function EcommerceDashboard({ siteId }: EcommerceDashboardProps) {
  const [siteData, setSiteData] = useState<any>(null)

  const [dasboardData, setDasboardData] = useState<any>(null)
  const [isLoading, setisLoading] = useState(true)
  const [stockProducts, setstockProducts] = useState([])
  let isTokenValid = false // AuthService.isTokenValid()
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  useEffect(() => {
    const isValid = AuthService.isTokenValid()
    if (isValid) {
      isTokenValid = true
    }
    const rawClientData = localStorage.getItem("tenant_data")
    console.log(rawClientData, 'rawClientData')
    const tenant_data = rawClientData ? JSON.parse(rawClientData) : null
    if (tenant_data.styles_site){
      setSecondBackgroundColor(tenant_data.styles_site.second_background_color)
      setPrincipalText(tenant_data.styles_site.principal_text)
    }
  }, [])

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!isTokenValid) {
        const isRefreshValid = await AuthService.isRefreshTokenValid()
        if (!isRefreshValid)window.location.href = "/"
      }
      const response = await EcomerceService.getDashboard()
      
      if (response.success && response.data) {
        setDasboardData(response.data)
        const categories = response.data.categories.data
        localStorage.setItem("categories", JSON.stringify(categories))
        setisLoading(false);
        // setstockProducts(lowStockProducts);
      }
    }

    fetchDashboard()
  }, [])  // 👈 ejecuta solo al montar
  useEffect(() => {
    setSiteData({
      name: "Tienda Fashion",
      description: "Tienda de ropa y accesorios online",
    })
  }, [siteId])
  useEffect(() => {
    const rawUserData = localStorage.getItem("user_data")
    const rawClientData = localStorage.getItem("tenant_data")
    const tenant_data = rawUserData ? JSON.parse(rawClientData) : null
    setSiteData({
      name: tenant_data.name,
      description: tenant_data.description
    })
  }, [])

  if (!siteData) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F2CFCE]/30 border-t-[#F2CFCE]" />
          <p className="text-sm text-muted-foreground">Cargando…</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout
      siteType="ecommerce"
      siteId={siteId}
      siteName={siteData.name}
      currentPath={`/dashboard/ecommerce`}
    >
      <div className="p-6">
        {isLoading ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
            <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F2CFCE]/30 border-t-[#F2CFCE]" />
              <p className="text-sm text-muted-foreground">Cargando…</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      <img
                        src={siteData.logo || "/placeholder.svg"}
                        alt={`Logo de ${siteData.name}`}
                        className="h-16 w-16 rounded-lg object-cover border-2 border-white shadow-sm"
                      />
                    </div>

                    {/* Información del ecommerce */}
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold mb-1">{siteData.name}</h1>
                      <p className="text-gray-600 mb-3">{siteData.description}</p>
                      {/* <div className="flex items-center gap-4 text-sm">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Ecommerce Activo
                        </Badge>
                        <span className="text-gray-500">
                          Última actualización: {new Date().toLocaleDateString("es-ES")}
                        </span>
                      </div> */}
                    </div>

                    {/* Mensaje de bienvenida */}
                    <div className="order-last sm:order-none w-full sm:w-auto text-center sm:text-right mt-2 sm:mt-0">
                      <p className="text-lg font-semibold mb-1">¡Bienvenido de vuelta!</p>
                      <p className="text-sm ">Gestiona tu tienda desde aquí</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                  <Package className="h-4 w-4 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dasboardData ? dasboardData.products.total : "Cargando..."}
                  </div>
                  <p className="text-xs ">
                    +{dasboardData ? dasboardData.products.created_this_month : "Cargando..."} este mes
                  </p>
                </CardContent>
              </Card>

              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                  <Tag className="h-4 w-4 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dasboardData ? dasboardData.categories.total : "Cargando..."}
                  </div>
                  <p className="text-xs ">
                    +{dasboardData ? dasboardData.categories.created_this_month : "Cargando..."} este mes
                  </p>
                </CardContent>
              </Card>

              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                  <ShoppingCart className="h-4 w-4 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dasboardData ? dasboardData.orders.total : "Cargando..."}
                  </div>
                  <p className="text-xs ">
                    +{dasboardData ? dasboardData.orders.created_this_month : "Cargando..."} este mes
                  </p>
                </CardContent>
              </Card>

              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                  <DollarSign className="h-4 w-4 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${mockStats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs ">+{mockStats.monthlyGrowth}% este mes</p>
                </CardContent>
              </Card>
            </div>
            {/* Control de Inventario */}
            {stockProducts.length ? (
              <div className="mb-8">
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="h-5 w-5" />
                      Control de Inventario
                    </CardTitle>
                    <CardDescription>
                      Productos sin stock o próximos a agotarse
                      <Badge variant="outline" className="ml-2 border-orange-300 text-orange-700">
                        {lowStockProducts.length} productos requieren atención
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {lowStockProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-orange-100"
                        >
                          {/* Información del producto */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                              <Badge
                                variant={
                                  product.status === "out_of_stock"
                                    ? "destructive"
                                    : product.status === "critical_stock"
                                      ? "destructive"
                                      : "secondary"
                                }
                                className="text-xs"
                              >
                                {product.status === "out_of_stock"
                                  ? "Sin Stock"
                                  : product.status === "critical_stock"
                                    ? "Stock Crítico"
                                    : "Stock Bajo"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{product.category}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>
                                Stock actual:{" "}
                                <strong className={product.currentStock === 0 ? "text-red-600" : "text-orange-600"}>
                                  {product.currentStock}
                                </strong>
                              </span>
                              <span>Stock mínimo: {product.minStock}</span>
                              <span>Última venta: {new Date(product.lastSale).toLocaleDateString("es-ES")}</span>
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex-shrink-0">
                            <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                              <Edit className="h-3 w-3" />
                              Actualizar Stock
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Resumen de stock */}
                    <div className="mt-6 pt-4 border-t border-orange-200">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-red-600">
                            {lowStockProducts.filter((p) => p.status === "out_of_stock").length}
                          </div>
                          <div className="text-xs text-gray-600">Sin Stock</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">
                            {lowStockProducts.filter((p) => p.status === "critical_stock").length}
                          </div>
                          <div className="text-xs text-gray-600">Stock Crítico</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {lowStockProducts.filter((p) => p.status === "low_stock").length}
                          </div>
                          <div className="text-xs text-gray-600">Stock Bajo</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : ( <div></div>
            )}
            
            <div className="mb-8">
              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-blue-500" />
                    Uso de Almacenamiento
                  </CardTitle>
                  <CardDescription className={`${secondBackgroundColor} ${principalText}`}>
                    Estado del almacenamiento y créditos de imágenes
                    <Badge variant={dasboardData.cloudinary_usage.risk === "ok" ? "default" : "destructive"} className="ml-2">
                      {dasboardData.cloudinary_usage.risk === "ok" ? "Estado OK" : "Atención"}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Almacenamiento */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 " />
                        <span className="text-sm font-medium">Almacenamiento</span>
                      </div>
                      <div className="text-2xl font-bold">{dasboardData.cloudinary_usage.storage_used_mb} MB</div>
                      <p className="text-xs ">Espacio utilizado</p>
                    </div>

                    {/* Descargas */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 " />
                        <span className="text-sm font-medium">Descargas</span>
                      </div>
                      <div className="text-2xl font-bold">{dasboardData.cloudinary_usage.downloaded_mb} MB</div>
                      <p className="text-xs ">Este mes</p>
                    </div>

                    {/* Créditos */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 " />
                        <span className="text-sm font-medium">Créditos</span>
                      </div>
                      <div className="text-2xl font-bold">{dasboardData.cloudinary_usage.credits.remaining}</div>
                      <p className="text-xs ">de {dasboardData.cloudinary_usage.credits.limit} disponibles</p>
                    </div>

                    {/* Uso de Créditos con Gráfica */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Uso de Créditos</span>
                        <span className="text-xs ">{dasboardData.cloudinary_usage.credits.percent_used}%</span>
                      </div>
                      <Progress value={dasboardData.cloudinary_usage.credits.percent_used} className={`h-2 ${principalText}`} />
                      <p className="text-xs ">
                        {dasboardData.cloudinary_usage.credits.used} / {dasboardData.cloudinary_usage.credits.limit} créditos
                      </p>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-xs ">
                      <span>Última actualización: {new Date(dasboardData.cloudinary_usage.last_updated).toLocaleDateString("es-ES")}</span>
                      <span>Consultado: {new Date(dasboardData.cloudinary_usage.date_requested).toLocaleString("es-ES")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
