import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Building, MapPin, Users } from "lucide-react"

const stats = [
  {
    name: "Total Ecommerces",
    value: "12",
    change: "+2.1%",
    changeType: "positive",
    icon: ShoppingCart,
  },
  {
    name: "Propiedades Activas",
    value: "48",
    change: "+5.4%",
    changeType: "positive",
    icon: Building,
  },
  {
    name: "Excursiones Disponibles",
    value: "23",
    change: "+1.2%",
    changeType: "positive",
    icon: MapPin,
  },
  {
    name: "Usuarios Registrados",
    value: "156",
    change: "+12.5%",
    changeType: "positive",
    icon: Users,
  },
]

const recentActivity = [
  {
    id: 1,
    type: "ecommerce",
    title: 'Nueva categoría creada en "Tienda Fashion"',
    time: "Hace 2 horas",
  },
  {
    id: 2,
    type: "property",
    title: 'Propiedad actualizada en "Inmobiliaria Central"',
    time: "Hace 4 horas",
  },
  {
    id: 3,
    type: "excursion",
    title: 'Nueva excursión agregada en "Tours Aventura"',
    time: "Hace 6 horas",
  },
  {
    id: 4,
    type: "user",
    title: "Nuevo usuario registrado",
    time: "Hace 8 horas",
  },
]

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Bienvenido al Dashboard</h2>
        <p className="text-muted-foreground">Aquí tienes un resumen de todas tus plataformas administrativas.</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> desde el mes pasado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity and quick actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones realizadas en tus plataformas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-accent rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Accesos directos a funciones principales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <a
                href="/dashboard/ecommerce"
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm">Gestionar Ecommerce</span>
              </a>
              <a
                href="/dashboard/properties"
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition-colors"
              >
                <Building className="h-4 w-4" />
                <span className="text-sm">Administrar Propiedades</span>
              </a>
              <a
                href="/dashboard/excursions"
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition-colors"
              >
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Configurar Excursiones</span>
              </a>
              <a
                href="/dashboard/users"
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition-colors"
              >
                <Users className="h-4 w-4" />
                <span className="text-sm">Gestionar Usuarios</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
