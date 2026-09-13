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
import { GuestsService } from "@/services/eventhub/guests.service"
import { GuestGroupsService } from "@/services/eventhub/guests.service"
import { EventTablesService } from "@/services/eventhub/guests.service"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Edit, Trash2, UserCheck, Mail, Phone } from "lucide-react"
import type { Guest, GuestGroup, EventTable, GuestType, RsvpStatus } from "@/types/eventhub/guests"

export default function EventHubGuestsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [guests, setGuests] = useState<Guest[]>([])
  const [guestGroups, setGuestGroups] = useState<GuestGroup[]>([])
  const [tables, setTables] = useState<EventTable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<GuestType | "all">("all")
  const [filterRsvp, setFilterRsvp] = useState<RsvpStatus | "all">("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [guestsData, groupsData, tablesData] = await Promise.all([
        GuestsService.getGuests(),
        GuestGroupsService.getGuestGroups(),
        EventTablesService.getTables()
      ])
      
      setGuests(guestsData.results || [])
      setGuestGroups(groupsData.results || [])
      setTables(tablesData.results || [])
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckIn = async (guestId: number) => {
    try {
      await GuestsService.checkInGuest(guestId)
      await loadData()
      toast({
        title: "Éxito",
        description: "Invitado registrado correctamente"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el invitado",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (guestId: number) => {
    if (!confirm("¿Estás seguro de eliminar este invitado?")) return
    
    try {
      await GuestsService.deleteGuest(guestId)
      await loadData()
      toast({
        title: "Éxito",
        description: "Invitado eliminado correctamente"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el invitado",
        variant: "destructive"
      })
    }
  }

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.phone?.includes(searchTerm)
    const matchesType = filterType === "all" || guest.guest_type === filterType
    const matchesRsvp = filterRsvp === "all" || guest.rsvp_status === filterRsvp
    
    return matchesSearch && matchesType && matchesRsvp
  })

  const getGroupName = (groupId?: number) => {
    if (!groupId) return "Sin grupo"
    const group = guestGroups.find(g => g.id === groupId)
    return group?.name || "Sin grupo"
  }

  const getTableName = (tableId?: number) => {
    if (!tableId) return "Sin mesa"
    const table = tables.find(t => t.id === tableId)
    return table?.name || "Sin mesa"
  }

  const getRsvpColor = (status: RsvpStatus) => {
    switch (status) {
      case "confirmed": return "bg-green-500"
      case "declined": return "bg-red-500"
      case "maybe": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const getRsvpText = (status: RsvpStatus) => {
    switch (status) {
      case "confirmed": return "Confirmado"
      case "declined": return "Rechazado"
      case "maybe": return "Tal vez"
      default: return "Pendiente"
    }
  }

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
            <h1 className="text-3xl font-bold">Invitados</h1>
            <p className="text-gray-600">Gestiona los invitados del evento</p>
          </div>
          <Button onClick={() => router.push("/dashboard/eventhub/guests/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Invitado
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nombre, email o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="type">Tipo de Invitado</Label>
                <Select value={filterType} onValueChange={(value) => setFilterType(value as GuestType | "all")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="celebrant">Celebrante</SelectItem>
                    <SelectItem value="family">Familia</SelectItem>
                    <SelectItem value="friend">Amigo</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="rsvp">Estado RSVP</Label>
                <Select value={filterRsvp} onValueChange={(value) => setFilterRsvp(value as RsvpStatus | "all")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="declined">Rechazado</SelectItem>
                    <SelectItem value="maybe">Tal vez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guests List */}
        <div className="grid gap-4">
          {filteredGuests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No se encontraron invitados</p>
              </CardContent>
            </Card>
          ) : (
            filteredGuests.map((guest) => (
              <Card key={guest.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{guest.full_name}</h3>
                        {guest.nickname && <span className="text-gray-500">({guest.nickname})</span>}
                        <Badge className={getRsvpColor(guest.rsvp_status)}>
                          {getRsvpText(guest.rsvp_status)}
                        </Badge>
                        {guest.checked_in_at && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Registrado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {guest.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {guest.email}
                          </div>
                        )}
                        {guest.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {guest.phone}
                          </div>
                        )}
                        <div>Grupo: {getGroupName(guest.group)}</div>
                        <div>Mesa: {getTableName(guest.table)}</div>
                        {guest.seat_number && <div>Asiento: {guest.seat_number}</div>}
                      </div>
                      
                      {guest.dietary_notes && (
                        <p className="text-sm text-gray-600">Notas dietéticas: {guest.dietary_notes}</p>
                      )}
                      
                      {guest.companions && guest.companions.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Acompañantes: {guest.companions.length}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCheckIn(guest.id)}
                        disabled={!!guest.checked_in_at}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        {guest.checked_in_at ? "Registrado" : "Check-in"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/eventhub/guests/${guest.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(guest.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
