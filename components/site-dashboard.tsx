"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Building, MapPin, BarChart3, Users, Settings, Plus } from "lucide-react"

interface SiteDashboardProps {
  siteType: string
  siteId: string
}

const siteTypeConfig = {
  ecommerce: {
    icon: ShoppingCart,
    label: "Ecommerce",
    modules: [
      { name: "Productos", icon: ShoppingCart, count: 45, href: "/products" },
      { name: "Categorías", icon: BarChart3, count: 8, href: "/categories" },
      { name: "Pedidos", icon: Users, count: 23, href: "/orders" },
    ],
  },
  properties: {
    icon: Building,
    label: "Propiedades",
    modules: [
      { name: "Propiedades", icon: Building, count: 12, href: "/properties" },
      { name: "Ventas", icon: BarChart3, count: 5, href: "/sales" },
      { name: "Arriendos", icon: Users, count: 8, href: "/rentals" },
    ],
  },
  excursions: {
    icon: MapPin,
    label: "Excursiones",
    modules: [
      { name: "Tours", icon: MapPin, count: 15, href: "/tours" },
      { name: "Reservas", icon: BarChart3, count: 32, href: "/bookings" },
      { name: "Guías", icon: Users, count: 6, href: "/guides" },
    ],
  },
  multimedia: {
    icon: ShoppingCart,
    label: "Multimedia",
    modules: [
      { name: "Productos", icon: ShoppingCart, count: 45, href: "/products" },
      { name: "Categorías", icon: BarChart3, count: 8, href: "/categories" },
      { name: "Pedidos", icon: Users, count: 23, href: "/orders" },
    ],
  },
}

// Mock site data
const mockSiteData = {
  "1": { name: "Tienda Fashion", type: "ecommerce" },
  "2": { name: "Inmobiliaria Central", type: "properties" },
  "3": { name: "Tours Aventura", type: "excursions" },
}

export function SiteDashboard({ siteType, siteId }: SiteDashboardProps) {
  const [siteData, setSiteData] = useState<any>(null)

  useEffect(() => {
    // Simulate loading site data
    const data = mockSiteData[siteId as keyof typeof mockSiteData] || {
      name: "Nuevo Sitio",
      type: siteType,
    }
    setSiteData(data)
  }, [siteId, siteType])

  if (!siteData) {
    return <div>Cargando??...</div>
  }

  const config = siteTypeConfig[siteType as keyof typeof siteTypeConfig]

  if (!config) {
    return <div>Tipo de sitio no válido</div>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Site Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
              <config.icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{siteData.name}</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{config.label}</Badge>
                <Badge variant="outline">ID: {siteId}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
            <Button variant="outline" size="sm" onClick={() => (window.location.href = "/dashboard")}>
              Volver a sitios
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {config.modules.map((module) => (
            <Card key={module.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{module.name}</CardTitle>
                <module.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{module.count}</div>
                <p className="text-xs text-muted-foreground">Total de {module.name.toLowerCase()}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {config.modules.map((module) => (
            <Card key={module.name} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <module.icon className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">Gestionar {module.name}</CardTitle>
                      <CardDescription>Administra todos los {module.name.toLowerCase()}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{module.count} elementos</span>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en {siteData.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-2 w-2 bg-accent rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nuevo elemento agregado</p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-2 w-2 bg-accent rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Configuración actualizada</p>
                  <p className="text-xs text-muted-foreground">Hace 1 día</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
