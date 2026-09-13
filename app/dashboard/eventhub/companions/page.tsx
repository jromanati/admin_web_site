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
import { GuestCompanionsService } from "@/services/eventhub/guests.service"
import { GuestsService } from "@/services/eventhub/guests.service"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Edit, Trash2, UserCheck, Users, Calendar, Baby, User } from "lucide-react"
import type { GuestCompanion, Relationship, AgeGroup } from "@/types/eventhub/guests"

export default function EventHubCompanionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [companions, setCompanions] = useState<GuestCompanion[]>([])
  const [guests, setGuests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRelationship, setFilterRelationship] = useState<Relationship | "all">("all")
  const [filterAgeGroup, setFilterAgeGroup] = useState<AgeGroup | "all">("all")
  const [filterGuest, setFilterGuest] = useState<string>("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      console.log("Loading companions...")
      const [companionsData, guestsData] = await Promise.all([
        GuestCompanionsService.getCompanions(),
        GuestsService.getGuests()
      ])
      
      console.log("Companions response:", companionsData)
      console.log("Guests response:", guestsData)
      
      setCompanions(companionsData.results || [])
      setGuests(guestsData.results || [])
    } catch (error) {
      console.error("Error loading companions:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información de acompañantes",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (companionId: number) => {
    if (!confirm("¿Estás seguro de eliminar este acompañante?")) return
    
    try {
      await GuestCompanionsService.deleteCompanion(companionId)
      await loadData()
      toast({
        title: "Éxito",
        description: "Acompañante eliminado correctamente"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el acompañante",
        variant: "destructive"
      })
    }
  }

  const filteredCompanions = companions.filter(companion => {
    const matchesSearch = companion.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (companion.nickname && companion.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (companion.seat_number && companion.seat_number.includes(searchTerm))
    
    const matchesRelationship = filterRelationship === "all" || companion.relationship === filterRelationship
    const matchesAgeGroup = filterAgeGroup === "all" || companion.age_group === filterAgeGroup
    const matchesGuest = filterGuest === "all" || companion.guest.toString() === filterGuest
    
    return matchesSearch && matchesRelationship && matchesAgeGroup && matchesGuest
  })

  const getRelationshipIcon = (relationship: Relationship) => {
    switch (relationship) {
      case "spouse": return <UserCheck className="h-4 w-4" />
      case "child": return <Baby className="h-4 w-4" />
      case "parent": return <Users className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getRelationshipText = (relationship: Relationship) => {
    switch (relationship) {
      case "spouse": return "Cónyuge"
      case "child": return "Hijo/a"
      case "parent": return "Padre/Madre"
      case "sibling": return "Hermano/a"
      case "friend": return "Amigo/a"
      case "partner": return "Pareja"
      case "coworker": return "Colega"
      case "other": return "Otro"
      default: return "Desconocido"
    }
  }

  const getAgeGroupText = (ageGroup: AgeGroup) => {
    switch (ageGroup) {
      case "baby": return "Bebé"
      case "child": return "Niño/a"
      case "teen": return "Adolescente"
      case "adult": return "Adulto"
      case "senior": return "Adulto Mayor"
      case "unknown": return "Desconocido"
      default: return "Desconocido"
    }
  }

  const getAgeGroupColor = (ageGroup: AgeGroup) => {
    switch (ageGroup) {
      case "baby": return "bg-pink-100 text-pink-800"
      case "child": return "bg-blue-100 text-blue-800"
      case "teen": return "bg-purple-100 text-purple-800"
      case "adult": return "bg-green-100 text-green-800"
      case "senior": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getGuestName = (guestId: number) => {
    const guest = guests.find(g => g.id === guestId)
    return guest ? guest.full_name : `Invitado #${guestId}`
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
            <h1 className="text-3xl font-bold">Acompañantes</h1>
            <p className="text-gray-600">Gestiona los acompañantes de los invitados</p>
          </div>
          <Button onClick={() => router.push("/dashboard/eventhub/companions/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Acompañante
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nombre, apodo, asiento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="relationship">Relación</Label>
                <Select value={filterRelationship} onValueChange={(value) => setFilterRelationship(value as Relationship | "all")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="spouse">Cónyuge</SelectItem>
                    <SelectItem value="child">Hijo/a</SelectItem>
                    <SelectItem value="parent">Padre/Madre</SelectItem>
                    <SelectItem value="sibling">Hermano/a</SelectItem>
                    <SelectItem value="friend">Amigo/a</SelectItem>
                    <SelectItem value="partner">Pareja</SelectItem>
                    <SelectItem value="coworker">Colega</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="age_group">Grupo Etario</Label>
                <Select value={filterAgeGroup} onValueChange={(value) => setFilterAgeGroup(value as AgeGroup | "all")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="baby">Bebé</SelectItem>
                    <SelectItem value="child">Niño/a</SelectItem>
                    <SelectItem value="teen">Adolescente</SelectItem>
                    <SelectItem value="adult">Adulto</SelectItem>
                    <SelectItem value="senior">Adulto Mayor</SelectItem>
                    <SelectItem value="unknown">Desconocido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="guest">Invitado Principal</Label>
                <Select value={filterGuest} onValueChange={setFilterGuest}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {guests.map((guest) => (
                      <SelectItem key={guest.id} value={guest.id.toString()}>
                        {guest.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companions Grid */}
        <div className="grid gap-6">
          {filteredCompanions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No se encontraron acompañantes</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanions.map((companion) => (
                <Card key={companion.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getRelationshipIcon(companion.relationship)}
                          {companion.full_name}
                        </CardTitle>
                        <CardDescription>
                          Acompañante de {getGuestName(companion.guest)}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        ID: {companion.id}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Companion Info */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">Relación:</span>
                          <span>{getRelationshipText(companion.relationship)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">Edad:</span>
                          <Badge className={getAgeGroupColor(companion.age_group)}>
                            {getAgeGroupText(companion.age_group)}
                          </Badge>
                        </div>
                        {companion.nickname && (
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold">Apodo:</span>
                            <span>{companion.nickname}</span>
                          </div>
                        )}
                        {companion.seat_number && (
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold">Asiento:</span>
                            <span>{companion.seat_number}</span>
                          </div>
                        )}
                        {companion.dietary_notes && (
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold">Notas:</span>
                            <span className="text-xs truncate max-w-[150px]">{companion.dietary_notes}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">Creado:</span>
                          <span>{new Date(companion.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Visual Representation */}
                      <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <UserCheck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <div className="text-sm text-gray-600">
                            Acompañante
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/eventhub/companions/${companion.id}/edit`)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(companion.id)}
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
            <CardTitle>Resumen de Acompañantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{companions.length}</div>
                <div className="text-sm text-gray-600">Total Acompañantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {companions.filter(c => c.relationship === "spouse").length}
                </div>
                <div className="text-sm text-gray-600">Cónyuges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {companions.filter(c => c.relationship === "child").length}
                </div>
                <div className="text-sm text-gray-600">Hijos/as</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {companions.filter(c => ["friend", "partner", "coworker"].includes(c.relationship)).length}
                </div>
                <div className="text-sm text-gray-600">Otros</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
