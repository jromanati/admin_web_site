"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { use } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AdminLayout } from "@/components/admin-layout"
import { GuestsService } from "@/services/eventhub/guests.service"
import { GuestGroupsService } from "@/services/eventhub/guests.service"
import { EventTablesService } from "@/services/eventhub/guests.service"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import type { Guest, GuestGroup, EventTable, UpdateGuestRequest, GuestType, RsvpStatus } from "@/types/eventhub/guests"

interface EditGuestPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditGuestPage({ params }: EditGuestPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const resolvedParams = use(params)
  const guestId = parseInt(resolvedParams.id)
  
  const [guest, setGuest] = useState<Guest | null>(null)
  const [guestGroups, setGuestGroups] = useState<GuestGroup[]>([])
  const [tables, setTables] = useState<EventTable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<UpdateGuestRequest>({
    full_name: "",
    nickname: "",
    email: "",
    phone: "",
    group: undefined,
    table: undefined,
    seat_number: "",
    guest_type: "family",
    rsvp_status: "pending",
    dietary_notes: "",
    special_notes: "",
    is_active: true,
    metadata: {}
  })

  useEffect(() => {
    loadData()
  }, [guestId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [guestData, groupsData, tablesData] = await Promise.all([
        GuestsService.getGuestById(guestId),
        GuestGroupsService.getGuestGroups(),
        EventTablesService.getTables()
      ])
      
      // Check if the response has success property (error case)
      if (!guestData.success || !guestData.data) {
        throw new Error(guestData.error || "Error al cargar invitado")
      }
      
      // Extract the actual guest data from the response
      const guest = guestData.data
      setGuest(guest)
      setGuestGroups(groupsData.results || [])
      setTables(tablesData.results || [])
      
      // Set form data with guest information
      setFormData({
        full_name: guest.full_name,
        nickname: guest.nickname || "",
        email: guest.email || "",
        phone: guest.phone || "",
        group: guest.group || undefined,
        table: guest.table || undefined,
        seat_number: guest.seat_number || "",
        guest_type: guest.guest_type,
        rsvp_status: guest.rsvp_status,
        dietary_notes: guest.dietary_notes || "",
        special_notes: guest.special_notes || "",
        is_active: guest.is_active,
        metadata: guest.metadata
      })
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información del invitado",
        variant: "destructive"
      })
      router.push("/dashboard/eventhub/guests")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.full_name?.trim()) {
      toast({
        title: "Error",
        description: "El nombre completo es obligatorio",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await GuestsService.updateGuest(guestId, formData)
      
      if (response.success === false) {
        throw new Error(response.error || "Error al actualizar invitado")
      }

      toast({
        title: "Éxito",
        description: "Invitado actualizado correctamente"
      })
      
      router.push("/dashboard/eventhub/guests")
    } catch (error) {
      console.error("Error updating guest:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el invitado",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof UpdateGuestRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

  if (!guest) {
    return (
      <AdminLayout siteType="eventhub" siteId="1" siteName="EventHub">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Invitado no encontrado</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout siteType="eventhub" siteId="1" siteName="EventHub">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/eventhub/guests")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Invitado</h1>
            <p className="text-gray-600">Modifica la información del invitado</p>
          </div>
        </div>

        {/* Guest Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información Actual</CardTitle>
            <CardDescription>
              Código de invitación: <code className="bg-gray-100 px-2 py-1 rounded">{guest.invitation_code}</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold">ID:</span> {guest.id}
              </div>
              <div>
                <span className="font-semibold">Creado:</span> {new Date(guest.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Actualizado:</span> {new Date(guest.updated_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Estado:</span> {guest.is_active ? "Activo" : "Inactivo"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Editar Información</CardTitle>
            <CardDescription>
              Actualiza los datos del invitado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Nombre Completo *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name || ""}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nickname">Apodo</Label>
                    <Input
                      id="nickname"
                      value={formData.nickname || ""}
                      onChange={(e) => handleInputChange("nickname", e.target.value)}
                      placeholder="Ej: Juancho"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="juan@example.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+56912345678"
                    />
                  </div>
                </div>
              </div>

              {/* Asignación */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Asignación</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="group">Grupo</Label>
                    <Select
                      value={formData.group?.toString() || "none"}
                      onValueChange={(value) => handleInputChange("group", value === "none" ? undefined : parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin grupo</SelectItem>
                        {guestGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="table">Mesa</Label>
                    <Select
                      value={formData.table?.toString() || "none"}
                      onValueChange={(value) => handleInputChange("table", value === "none" ? undefined : parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar mesa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin mesa</SelectItem>
                        {tables.map((table) => (
                          <SelectItem key={table.id} value={table.id.toString()}>
                            {table.name} (Cap: {table.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="seat_number">Número de Asiento</Label>
                    <Input
                      id="seat_number"
                      value={formData.seat_number || ""}
                      onChange={(e) => handleInputChange("seat_number", e.target.value)}
                      placeholder="Ej: A1"
                    />
                  </div>
                </div>
              </div>

              {/* Tipo y Estado */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tipo y Estado</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guest_type">Tipo de Invitado</Label>
                    <Select
                      value={formData.guest_type}
                      onValueChange={(value) => handleInputChange("guest_type", value as GuestType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="celebrant">Celebrante</SelectItem>
                        <SelectItem value="family">Familia</SelectItem>
                        <SelectItem value="friend">Amigo</SelectItem>
                        <SelectItem value="student">Estudiante</SelectItem>
                        <SelectItem value="teacher">Profesor</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="staff">Personal</SelectItem>
                        <SelectItem value="photographer">Fotógrafo</SelectItem>
                        <SelectItem value="dj">DJ</SelectItem>
                        <SelectItem value="supplier">Proveedor</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="rsvp_status">Estado RSVP</Label>
                    <Select
                      value={formData.rsvp_status}
                      onValueChange={(value) => handleInputChange("rsvp_status", value as RsvpStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="declined">Rechazado</SelectItem>
                        <SelectItem value="maybe">Tal vez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notas</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dietary_notes">Notas Dietéticas</Label>
                    <Textarea
                      id="dietary_notes"
                      value={formData.dietary_notes || ""}
                      onChange={(e) => handleInputChange("dietary_notes", e.target.value)}
                      placeholder="Ej: Sin gluten, vegetariano, alergias..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="special_notes">Notas Especiales</Label>
                    <Textarea
                      id="special_notes"
                      value={formData.special_notes || ""}
                      onChange={(e) => handleInputChange("special_notes", e.target.value)}
                      placeholder="Cualquier información adicional relevante..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/eventhub/guests")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Actualizando..." : "Actualizar Invitado"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
