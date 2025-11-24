"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tag,
  DollarSign,
  Cloud,
  HardDrive,
  Download,
  CreditCard,
  Building,
  Home,
  Key,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { AdminLayout } from "../admin-layout"
import { PropertiesService } from "@/services/properties/properties.service"
import { AuthService } from "@/services/auth.service"

interface PropertiesDashboardProps {
  siteId: string
}

const mockStats = {
  totalProperties: 48,
  availableProperties: 32,
  soldProperties: 12,
  rentedProperties: 16,
  totalRevenue: 2450000,
  monthlyGrowth: 8.3,
  activeClients: 89,
}

const recentActivity = [
  { id: "1", type: "sale", title: "Casa en Zona Norte vendida", amount: 250000, date: "2024-01-15" },
  { id: "2", type: "rental", title: "Apartamento Centro arrendado", amount: 1200, date: "2024-01-15" },
  { id: "3", type: "listing", title: "Nueva propiedad listada", amount: 0, date: "2024-01-14" },
  { id: "4", type: "inquiry", title: "Consulta sobre Villa Premium", amount: 0, date: "2024-01-14" },
]

const topProperties = [
  { address: "Av. Principal 123", type: "Casa", price: 350000, status: "available" },
  { address: "Centro Comercial 456", type: "Local", price: 2500, status: "rented" },
  { address: "Residencial Norte 789", type: "Apartamento", price: 180000, status: "sold" },
  { address: "Plaza Central 321", type: "Oficina", price: 1800, status: "available" },
]

export function PropertiesDashboard({ siteId }: PropertiesDashboardProps) {
  const [siteData, setSiteData] = useState<any>(null)
  const [dasboardData, setDasboardData] = useState<any>(null)
  let isTokenValid = false // AuthService.isTokenValid()
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [isLoading, setisLoading] = useState(true)
  useEffect(() => {
    const isValid = AuthService.isTokenValid()
    if (isValid) {
      isTokenValid = true
    }
    const rawClientData = localStorage.getItem("tenant_data")
    const tenant_data = rawClientData ? JSON.parse(rawClientData) : null    
    if (tenant_data.styles_site){
      setSecondBackgroundColor("bg-red-900")
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
      const response = await PropertiesService.getDashboard()
      if (response.success && response.data) {
        setDasboardData(response.data)
        setisLoading(false);
      }
    }

    fetchDashboard()
  }, [])  // 👈 ejecuta solo al montar

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
      siteType="properties"
      siteId={siteId}
      siteName={siteData.name}
      currentPath={`/dashboard/properties`}
    >
      <div className="p-6">
        {/* Stats Grid */}
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
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    {/* Logo */}
                    <div className="flex-shrink-0 self-center sm:self-auto">
                      <img
                        src={siteData.logo || "/placeholder.svg"}
                        alt={`Logo de ${siteData?.name || "sitio"}`}
                        className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg object-cover border border-white/70 shadow-sm bg-white"
                        loading="lazy"
                      />
                    </div>

                    {/* Información */}
                    <div className="flex-1 text-center sm:text-left">
                      <h1 className="text-xl sm:text-2xl font-bold mb-1 break-words">
                        {/* {siteData?.name} */}
                        Propiedades
                      </h1>
                      <p className="text-sm sm:text-base opacity-90">
                        {/* {siteData?.description} */}
                        Administra y gestiona todas tus propiedades en un solo lugar
                      </p>
                    </div>

                    {/* Mensaje de bienvenida */}
                    <div className="order-last sm:order-none w-full sm:w-auto text-center sm:text-right mt-2 sm:mt-0">
                      <p className="text-base sm:text-lg font-semibold mb-0.5">
                        ¡Bienvenido de vuelta!
                      </p>
                      <p className="text-xs sm:text-sm opacity-90">
                        Gestiona tus propiedades desde aquí
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Propiedades</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dasboardData.properties.total}</div>
                  <p className="text-xs text-muted-foreground">
                    +{dasboardData ? dasboardData.properties.new_properties_this_month : "Cargando..."} este mes
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dasboardData.properties.available_properties}
                  </div>
                  <p className="text-xs text-muted-foreground">Listas para mostrar</p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ventas</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dasboardData.properties.properties_for_sale}</div>
                  <p className="text-xs text-muted-foreground">
                    +{dasboardData.properties.properties_for_sale_this_month} este mes
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Arriendos</CardTitle>
                  <Key className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dasboardData.properties.properties_for_rent}</div>
                  <p className="text-xs text-muted-foreground">
                    +{dasboardData.properties.properties_for_rent_this_month} este mes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity and Top Properties */}
            <div className="grid gap-1 md:grid-cols-1">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Propiedades Destacadas</CardTitle>
                  <CardDescription>Propiedades con mayor interés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProperties.map((property, index) => (
                      <div key={property.address} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                            <span className="text-xs font-medium">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{property.address}</p>
                            <p className="text-xs text-muted-foreground">{property.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ${property.price.toLocaleString()}
                            {property.status === "rented" && "/mes"}
                          </p>
                          <Badge
                            variant={
                              property.status === "available"
                                ? "default"
                                : property.status === "sold"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {property.status === "available"
                              ? "Disponible"
                              : property.status === "sold"
                                ? "Vendida"
                                : "Arrendada"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-8 py-4">
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
