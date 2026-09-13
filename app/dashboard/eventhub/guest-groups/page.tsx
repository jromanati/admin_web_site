"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin-layout"
import { GuestGroupsService } from "@/services/eventhub/guests.service"
import { GuestsService } from "@/services/eventhub/guests.service"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Edit, Trash2, Users, Calendar } from "lucide-react"
import type { GuestGroup } from "@/types/eventhub/guests"

export default function EventHubGuestGroupsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [guestGroups, setGuestGroups] = useState<GuestGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      console.log("Loading guest groups...")
      const groupsData = await GuestGroupsService.getGuestGroups()
      console.log("Guest groups response:", groupsData)
      setGuestGroups(groupsData.results || [])
    } catch (error) {
      console.error("Error loading guest groups:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información de grupos",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (groupId: number) => {
    if (!confirm("¿Estás seguro de eliminar este grupo?")) return
    
    try {
      await GuestGroupsService.deleteGuestGroup(groupId)
      await loadData()
      toast({
        title: "Éxito",
        description: "Grupo eliminado correctamente"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el grupo",
        variant: "destructive"
      })
    }
  }

  const filteredGroups = guestGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
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
            <h1 className="text-3xl font-bold">Grupos de Invitados</h1>
            <p className="text-gray-600">Gestiona los grupos de invitados del evento</p>
          </div>
          <Button onClick={() => router.push("/dashboard/eventhub/guest-groups/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Grupo
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Groups Grid */}
        <div className="grid gap-6">
          {filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No se encontraron grupos</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          {group.name}
                        </CardTitle>
                        {group.description && (
                          <CardDescription>{group.description}</CardDescription>
                        )}
                      </div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        ID: {group.id}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Group Info */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">Creado:</span>
                          <span>{new Date(group.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">Estado:</span>
                          <Badge variant={group.is_active ? "default" : "secondary"}>
                            {group.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        {group.sort_order !== undefined && (
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold">Orden:</span>
                            <span>{group.sort_order}</span>
                          </div>
                        )}
                      </div>

                      {/* Visual Representation */}
                      <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <div className="text-sm text-gray-600">
                            Grupo de invitados
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/eventhub/guest-groups/${group.id}/edit`)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(group.id)}
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
            <CardTitle>Resumen de Grupos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{guestGroups.length}</div>
                <div className="text-sm text-gray-600">Total Grupos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {guestGroups.filter(g => g.is_active).length}
                </div>
                <div className="text-sm text-gray-600">Grupos Activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {guestGroups.filter(g => !g.is_active).length}
                </div>
                <div className="text-sm text-gray-600">Grupos Inactivos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
