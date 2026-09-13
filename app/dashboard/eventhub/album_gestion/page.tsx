"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin-layout"
import { 
  Image, 
  Layout, 
  BookOpen, 
  Settings, 
  Plus, 
  Upload,
  Palette,
  FileText,
  Layers
} from "lucide-react"

export default function AlbumGestionPage() {
  const router = useRouter()

  const managementCards = [
    {
      title: "Fondos de Álbum",
      description: "Gestiona las imágenes de fondo para los álbumes de memoria",
      icon: <Image className="h-8 w-8" />,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      actions: [
        {
          label: "Ver Fondos",
          href: "/dashboard/eventhub/album_gestion/backgrounds",
          variant: "outline" as const,
          icon: <Layers className="h-4 w-4" />
        },
        {
          label: "Subir Fondo",
          href: "/dashboard/eventhub/album_gestion/backgrounds/upload",
          variant: "default" as const,
          icon: <Upload className="h-4 w-4" />
        }
      ]
    },
    {
      title: "Plantillas de Página",
      description: "Administra las plantillas de diseño para las páginas de álbum",
      icon: <Layout className="h-8 w-8" />,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      actions: [
        {
          label: "Ver Plantillas",
          href: "/dashboard/eventhub/album_gestion/templates",
          variant: "outline" as const,
          icon: <FileText className="h-4 w-4" />
        },
        {
          label: "Crear Plantilla",
          href: "/dashboard/eventhub/album_gestion/templates/create",
          variant: "default" as const,
          icon: <Plus className="h-4 w-4" />
        }
      ]
    },
    {
      title: "Álbumes de Memoria",
      description: "Gestiona los álbumes creados por los usuarios",
      icon: <BookOpen className="h-8 w-8" />,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      actions: [
        {
          label: "Ver Álbumes",
          href: "/dashboard/eventhub/album_gestion/albums",
          variant: "outline" as const,
          icon: <Layers className="h-4 w-4" />
        },
        {
          label: "Crear Álbum",
          href: "/dashboard/eventhub/album_gestion/albums/create",
          variant: "default" as const,
          icon: <Plus className="h-4 w-4" />
        }
      ]
    },
    {
      title: "Páginas de Álbum",
      description: "Administra las páginas individuales de los álbumes",
      icon: <FileText className="h-8 w-8" />,
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      actions: [
        {
          label: "Ver Páginas",
          href: "/dashboard/eventhub/album_gestion/pages",
          variant: "outline" as const,
          icon: <Layers className="h-4 w-4" />
        },
        {
          label: "Crear Página",
          href: "/dashboard/eventhub/album_gestion/pages/create",
          variant: "default" as const,
          icon: <Plus className="h-4 w-4" />
        }
      ]
    }
  ]

  const quickActions = [
    {
      title: "Subir Nuevo Fondo",
      description: "Añade una nueva imagen de fondo",
      icon: <Upload className="h-5 w-5" />,
      href: "/dashboard/eventhub/album_gestion/backgrounds/upload",
      color: "bg-blue-100 text-blue-700 hover:bg-blue-200"
    },
    {
      title: "Crear Álbum Rápido",
      description: "Genera un álbum con páginas",
      icon: <Plus className="h-5 w-5" />,
      href: "/dashboard/eventhub/album_gestion/albums/create-with-pages",
      color: "bg-green-100 text-green-700 hover:bg-green-200"
    },
    {
      title: "Configurar Plantillas",
      description: "Administra plantillas del sistema",
      icon: <Settings className="h-5 w-5" />,
      href: "/dashboard/eventhub/album_gestion/templates/settings",
      color: "bg-purple-100 text-purple-700 hover:bg-purple-200"
    }
  ]

  return (
    <AdminLayout siteType="eventhub" siteId="1" siteName="EventHub">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Gestión de Álbumes</h1>
          <p className="text-gray-600">
            Administra los fondos, plantillas, álbumes y páginas del sistema de Memory Album
          </p>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Tareas comunes que puedes realizar rápidamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-start space-y-2 ${action.color}`}
                  onClick={() => router.push(action.href)}
                >
                  <div className="flex items-center space-x-2">
                    {action.icon}
                    <span className="font-semibold">{action.title}</span>
                  </div>
                  <span className="text-sm text-left opacity-80">
                    {action.description}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {managementCards.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg text-white ${card.color} ${card.hoverColor} transition-colors`}>
                    {card.icon}
                  </div>
                  <div>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {card.actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant={action.variant}
                      className="w-full justify-start"
                      onClick={() => router.push(action.href)}
                    >
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas del Sistema</CardTitle>
            <CardDescription>
              Resumen general del estado de los álbumes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Fondos Activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Plantillas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Álbumes Creados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">0</div>
                <div className="text-sm text-gray-600">Páginas Totales</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
