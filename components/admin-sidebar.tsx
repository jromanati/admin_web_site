"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Package,
  Tag,
  ShoppingCart,
  Users,
  TrendingUp,
  LogOut,
  Building,
  DollarSign,
  Key,
  MapPin,
  Calendar,
  UserCheck,
  Menu,
  X,
  Sliders,
  Home,
  LayoutDashboard,
  Palette,
  Star,
  Video,
  HelpCircle
} from "lucide-react"

interface AdminSidebarProps {
  siteType: "ecommerce" | "properties" | "excursions"
  siteId: string | undefined
  siteName: string
  currentPath?: string
}
import { AuthService } from "@/services/auth.service"
import InstallPWA from "@/components/pwa/InstallPWA";
export function AdminSidebar({ siteType, siteId, siteName, currentPath }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [tenant_data, setTenantData] = useState(false)
  const [user_data, setUserData] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState("")
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [isLoading, setisLoading] = useState(true)
  useEffect(() => {
    const rawUserData = localStorage.getItem("user_data")
    const user_data = rawUserData ? JSON.parse(rawUserData) : null
    setUserData(user_data)
    const rawClientData = localStorage.getItem("tenant_data")
    const tenant_data = rawUserData ? JSON.parse(rawClientData) : null
    setTenantData(tenant_data)
    if (tenant_data.styles_site){
      setBackgroundColor(tenant_data.styles_site.background_color)
      setSecondBackgroundColor(tenant_data.styles_site.second_background_color)
      setPrincipalHoverBackground(tenant_data.styles_site.principal_hover_background)
    }
    setisLoading(false);
  }, [])
  // const backgroundColor = "bd-card"
  const router = useRouter()
  const handleClick = (route) => {
    // ... lógica previa si la necesitas
    router.push(route)
  }
  

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("isLoggedIn")
    AuthService.clearToken()
    window.location.href = "/"
  }

  const getMenuItems = () => {
    const baseItems = [
      {
        icon: Users,
        label: "Gestionar Usuarios",
        href: `/dashboard/ecommerce/users`,
      },
      // {
      //   icon: TrendingUp,
      //   label: "Reportes",
      //   href: `/dashboard/${siteType}/${siteId}/reports`,
      // },
    ]

    switch (siteType) {
      case "ecommerce":
        return [
          {
            icon: LayoutDashboard,
            label: "Inicio",
            href: `/dashboard/ecommerce`,
          },
          {
            icon: Tag,
            label: "Gestionar Categorías",
            href: `/dashboard/ecommerce/categories`,
          },
          {
            icon: Sliders,
            label: "Gestionar Atributos",
            href: `/dashboard/ecommerce/features`,
          },
          {
            icon: Palette,
            label: "Gestionar Marcas",
            href: `/dashboard/ecommerce/brands`,
          },
          {
            icon: Package,
            label: "Gestionar Productos",
            href: `/dashboard/ecommerce/products`,
          },
          {
            icon: Star,
            label: "Gestionar Reseñas",
            href: `/dashboard/ecommerce/reviews`,
          },
          {
            icon: Video,
            label: "Gestionar Streaming",
            href: `/dashboard/ecommerce/streaming`,
          },
          // {
          //   icon: ShoppingCart,
          //   label: "Ver Pedidos",
          //   href: `/dashboard/ecommerce/orders`,
          // },
          {
            icon: Users,
            label: "Gestionar Usuarios",
            href: `/dashboard/ecommerce/users`,
          }
        ]

      case "properties":
        return [
          {
            icon: LayoutDashboard,
            label: "Inicio",
            href: `/dashboard/properties`,
          },
          {
            icon: Building,
            label: "Gestionar Propiedades",
            href: `/dashboard/properties/properties`,
          },
          // {
          //   icon: Tag,
          //   label: "Gestionar Categorías",
          //   href: `/dashboard/properties/${siteId}/categories`,
          // },
          // {
          //   icon: DollarSign,
          //   label: "Ver Ventas",
          //   href: `/dashboard/properties/${siteId}/sales`,
          // },
          // {
          //   icon: Key,
          //   label: "Ver Arriendos",
          //   href: `/dashboard/properties/${siteId}/rentals`,
          // },
          {
            icon: Users,
            label: "Gestionar Usuarios",
            href: `/dashboard/properties/users`,
          }
        ]

      case "excursions":
        return [
          {
            icon: MapPin,
            label: "Gestionar Tours",
            href: `/dashboard/excursions/${siteId}/tours`,
          },
          {
            icon: Tag,
            label: "Gestionar Categorías",
            href: `/dashboard/excursions/${siteId}/categories`,
          },
          {
            icon: Calendar,
            label: "Ver Reservas",
            href: `/dashboard/excursions/${siteId}/bookings`,
          },
          {
            icon: UserCheck,
            label: "Gestionar Guías",
            href: `/dashboard/excursions/${siteId}/guides`,
          },
          ...baseItems,
        ]

      default:
        return baseItems
    }
  }

  const menuItems = getMenuItems()

  const getSiteIcon = () => {
    switch (siteType) {
      case "ecommerce":
        return <Package className="h-5 w-5" />
      case "properties":
        return <Building className="h-5 w-5" />
      case "excursions":
        return <MapPin className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const getSiteTypeLabel = () => {
    switch (siteType) {
      case "ecommerce":
        return "Ecommerce"
      case "properties":
        return "Propiedades"
      case "excursions":
        return "Excursiones"
      default:
        return "Dashboard"
    }
  }
  const [siteData, setSiteData] = useState<any>(null)
  useEffect(() => {
    setSiteData({
      name: "Tienda Fashion",
    })
  }, [])
  
  if (isLoading) {
    return <div></div>
  }

  return (
    <>
      <InstallPWA />
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50 right-[max(1rem,env(safe-area-inset-right))]">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Abrir/Cerrar menú"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        // className={cn(
        //   "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        //   isCollapsed ? "-translate-x-full" : "translate-x-0",
        // )}
        // className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${backgroundColor}`}
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isCollapsed ? "-translate-x-full" : "translate-x-0",
          backgroundColor ?? "bg-card" // fallback opcional
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{tenant_data.name}</h2>
                <h2 className="text-lg font-semibold text-foreground">{user_data.first_name} {user_data.last_name}</h2>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPath === item.href

                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn("w-full justify-start h-11", isActive && secondBackgroundColor, principalHoverBackground)}
                    onClick={() => handleClick(item.href)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                )
              })}

              {/* Botón de ayuda solo si client_type == "properties" */}
              {tenant_data && tenant_data.client_type === "properties" && (
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start h-11", principalHoverBackground)}
                  onClick={() => window.open("http://base.localhost:3001/propiedades", "_blank")}
                >
                  {/* Puedes elegir otro icono de lucide si quieres (ej: HelpCircle, Info, BookOpen) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </svg>
                  Ayuda
                </Button>
              )}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start h-11 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsCollapsed(true)} />
      )}
    </>
  )
}
