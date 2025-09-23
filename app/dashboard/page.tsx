"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShoppingCart, Building, MapPin } from "lucide-react"

export default function DashboardPage() {
  const [userType, setUserType] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in and redirect to their specific dashboard
    const storedUserType = localStorage.getItem("userType")
    const storedUserEmail = localStorage.getItem("userEmail")

    if (storedUserType && storedUserEmail) {
      setUserType(storedUserType)
      setUserEmail(storedUserEmail)

      // Auto-redirect to specific dashboard
      setTimeout(() => {
        const redirectMap = {
          ecommerce: "/dashboard/ecommerce/1",
          properties: "/dashboard/properties/1",
          excursions: "/dashboard/excursions/1",
        }
        window.location.href = redirectMap[storedUserType as keyof typeof redirectMap]
      }, 2000)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("userEmail")
    window.location.href = "/"
  }

  const getModuleInfo = (type: string) => {
    const modules = {
      ecommerce: {
        title: "Ecommerce",
        description: "Gestión de productos, categorías y pedidos",
        icon: ShoppingCart,
        color: "text-blue-600",
      },
      properties: {
        title: "Propiedades",
        description: "Administración de inmuebles y ventas",
        icon: Building,
        color: "text-green-600",
      },
      excursions: {
        title: "Excursiones",
        description: "Gestión de tours y reservas",
        icon: MapPin,
        color: "text-purple-600",
      },
    }
    return modules[type as keyof typeof modules]
  }

  if (!userType || !userEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Acceso Requerido</CardTitle>
            <CardDescription>Debes iniciar sesión para acceder al panel de administración</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => (window.location.href = "/")}>Ir al Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const moduleInfo = getModuleInfo(userType)
  const IconComponent = moduleInfo.icon

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className={`mx-auto h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4`}>
            <IconComponent className={`h-6 w-6 ${moduleInfo.color}`} />
          </div>
          <CardTitle>Bienvenido</CardTitle>
          <CardDescription>Redirigiendo a tu panel de {moduleInfo.title}...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Usuario: {userEmail}</p>
            <p>Módulo: {moduleInfo.description}</p>
          </div>

          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleLogout} size="sm">
              Cerrar Sesión
            </Button>
            <Button
              onClick={() => {
                const redirectMap = {
                  ecommerce: "/dashboard/ecommerce/1",
                  properties: "/dashboard/properties/1",
                  excursions: "/dashboard/excursions/1",
                }
                window.location.href = redirectMap[userType as keyof typeof redirectMap]
              }}
              size="sm"
            >
              Ir al Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
