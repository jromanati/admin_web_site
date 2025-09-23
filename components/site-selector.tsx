"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Building, MapPin, Plus, Settings } from "lucide-react"

interface Site {
  id: string
  name: string
  type: "ecommerce" | "properties" | "excursions"
  logo?: string
  status: "active" | "inactive"
  description: string
  lastActivity: string
}

const mockSites: Site[] = [
  {
    id: "1",
    name: "Tienda Fashion",
    type: "ecommerce",
    status: "active",
    description: "Tienda de ropa y accesorios online",
    lastActivity: "Hace 2 horas",
  },
  {
    id: "2",
    name: "Inmobiliaria Central",
    type: "properties",
    status: "active",
    description: "Gestión de propiedades en venta y arriendo",
    lastActivity: "Hace 4 horas",
  },
  {
    id: "3",
    name: "Tours Aventura",
    type: "excursions",
    status: "active",
    description: "Excursiones y tours turísticos",
    lastActivity: "Hace 1 día",
  },
  {
    id: "4",
    name: "Boutique Elegance",
    type: "ecommerce",
    status: "inactive",
    description: "Tienda de productos de lujo",
    lastActivity: "Hace 1 semana",
  },
]

const siteTypeConfig = {
  ecommerce: {
    icon: ShoppingCart,
    label: "Ecommerce",
    color: "bg-blue-100 text-blue-800",
    description: "Gestiona productos, categorías y ventas",
  },
  properties: {
    icon: Building,
    label: "Propiedades",
    color: "bg-green-100 text-green-800",
    description: "Administra propiedades, ventas y arriendos",
  },
  excursions: {
    icon: MapPin,
    label: "Excursiones",
    color: "bg-purple-100 text-purple-800",
    description: "Organiza tours y actividades turísticas",
  },
}

export function SiteSelector() {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)

  const handleSiteSelect = (site: Site) => {
    // Redirect to specific site dashboard
    window.location.href = `/dashboard/${site.type}/${site.id}`
  }

  const handleCreateSite = (type: string) => {
    window.location.href = `/dashboard/create-site?type=${type}`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Websites</h1>
              <p className="text-sm text-muted-foreground">Selecciona un sitio para administrar</p>
            </div>
            <Button variant="ghost" onClick={() => (window.location.href = "/")}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Site Type Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Crear Nuevo Sitio</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(siteTypeConfig).map(([type, config]) => (
              <Card key={type} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <config.icon className="h-8 w-8 text-muted-foreground" />
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{config.label}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => handleCreateSite(type)}>
                    Crear {config.label}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Existing Sites */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Sitios Existentes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockSites.map((site) => {
              const config = siteTypeConfig[site.type]
              return (
                <Card key={site.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                          <config.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{site.name}</CardTitle>
                          <Badge variant="secondary" className={config.color}>
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={site.status === "active" ? "default" : "secondary"}>
                          {site.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">{site.description}</CardDescription>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{site.lastActivity}</span>
                      <Button size="sm" onClick={() => handleSiteSelect(site)}>
                        Administrar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
