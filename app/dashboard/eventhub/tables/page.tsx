"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin-layout"
import { EventTablesService } from "@/services/eventhub/guests.service"
import { GuestsService } from "@/services/eventhub/guests.service"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Edit, Trash2, Users, Square, Circle } from "lucide-react"
import type { EventTable, TableShape, CreateEventTableRequest } from "@/types/eventhub/guests"

export default function EventHubTablesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tables, setTables] = useState<EventTable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterShape, setFilterShape] = useState<TableShape | "all">("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      console.log("Loading tables...")
      const tablesData = await EventTablesService.getTables()
      console.log("Tables response:", tablesData)
      setTables(tablesData.results || [])
    } catch (error) {
      console.error("Error loading tables:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información de mesas",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (tableId: number) => {
    if (!confirm("¿Estás seguro de eliminar esta mesa?")) return
    
    try {
      await EventTablesService.deleteTable(tableId)
      await loadData()
      toast({
        title: "Éxito",
        description: "Mesa eliminada correctamente"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la mesa",
        variant: "destructive"
      })
    }
  }

  const getShapeIcon = (shape: TableShape) => {
    switch (shape) {
      case "round": return <Circle className="h-4 w-4" />
      case "square": return <Square className="h-4 w-4" />
      case "rectangular": return <Square className="h-4 w-4" />
      default: return <Square className="h-4 w-4" />
    }
  }

  const getShapeText = (shape: TableShape) => {
    switch (shape) {
      case "round": return "Redonda"
      case "square": return "Cuadrada"
      case "rectangular": return "Rectangular"
      default: return "Desconocida"
    }
  }

  const getOccupancyColor = (capacity: number, assignedGuests: number) => {
    const percentage = (assignedGuests / capacity) * 100
    if (percentage >= 100) return "bg-red-500"
    if (percentage >= 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getOccupancyText = (capacity: number, assignedGuests: number) => {
    const percentage = (assignedGuests / capacity) * 100
    return `${assignedGuests}/${capacity} (${Math.round(percentage)}%)`
  }

  // Calculate assigned guests for each table
  const tablesWithGuests = tables.map(table => ({
    ...table,
    assigned_guests: 0 // This would come from guests service, but for now using 0
  }))

  const filteredTables = tablesWithGuests.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesShape = filterShape === "all" || table.shape === filterShape
    
    return matchesSearch && matchesShape
  })

  if (isLoading) {
    return (
      <AdminLayout siteType="eventhub" siteId="1" siteName="EventHub">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout siteType="eventhub" siteId="1" siteName="EventHub">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Mesas del Evento</h1>
            <p className="text-gray-600">Gestiona las mesas y su distribución</p>
          </div>
          <Button onClick={() => router.push("/dashboard/eventhub/tables/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Mesa
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nombre o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="shape">Forma de Mesa</Label>
                <Select value={filterShape} onValueChange={(value) => setFilterShape(value as TableShape | "all")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="round">Redondas</SelectItem>
                    <SelectItem value="square">Cuadradas</SelectItem>
                    <SelectItem value="rectangle">Rectangulares</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tables Grid */}
        <div className="grid gap-6">
          {filteredTables.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No se encontraron mesas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTables.map((table) => (
                <Card key={table.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getShapeIcon(table.shape)}
                          {table.name}
                        </CardTitle>
                        <CardDescription>{table.description}</CardDescription>
                      </div>
                      <Badge className={getOccupancyColor(table.capacity, table.assigned_guests)}>
                        {getOccupancyText(table.capacity, table.assigned_guests)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Table Info */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">Forma:</span>
                          <span>{getShapeText(table.shape)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">Capacidad:</span>
                          <span>{table.capacity} personas</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">Asignados:</span>
                          <span>{table.assigned_guests} personas</span>
                        </div>
                        {table.location_label && (
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold">Ubicación:</span>
                            <span>{table.location_label}</span>
                          </div>
                        )}
                        {table.number && (
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold">Número:</span>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              #{table.number}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Visual Representation */}
                      <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                        <div className={`w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center ${
                          table.shape === "round" ? "rounded-full" : "rounded-lg"
                        }`}>
                          <Users className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/eventhub/tables/${table.id}/edit`)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(table.id)}
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
        </div>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Mesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{tables.length}</div>
                <div className="text-sm text-gray-600">Total Mesas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {tables.reduce((sum, table) => sum + table.capacity, 0)}
                </div>
                <div className="text-sm text-gray-600">Capacidad Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {tablesWithGuests.reduce((sum, table) => sum + table.assigned_guests, 0)}
                </div>
                <div className="text-sm text-gray-600">Invitados Asignados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {tables.length > 0 
                    ? Math.round((tablesWithGuests.reduce((sum, table) => sum + table.assigned_guests, 0) / 
                                tables.reduce((sum, table) => sum + table.capacity, 0)) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Ocupación</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
