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
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin-layout"
import { GuestCompanionsService } from "@/services/eventhub/guests.service"
import { GuestsService } from "@/services/eventhub/guests.service"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import type { GuestCompanion, UpdateGuestCompanionRequest, Relationship, AgeGroup } from "@/types/eventhub/guests"

interface EditCompanionPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditCompanionPage({ params }: EditCompanionPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const resolvedParams = use(params)
  const companionId = parseInt(resolvedParams.id)
  
  const [companion, setCompanion] = useState<GuestCompanion | null>(null)
  const [guests, setGuests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<UpdateGuestCompanionRequest>({
    guest: 0,
    full_name: "",
    nickname: "",
    relationship: "other",
    age_group: "adult",
    seat_number: "",
    dietary_notes: "",
    special_notes: "",
    metadata: {}
  })

  useEffect(() => {
    loadData()
  }, [companionId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [companionData, guestsData] = await Promise.all([
        GuestCompanionsService.getCompanionById(companionId),
        GuestsService.getGuests()
      ])
      
      // Check if the response has success property (error case)
      if (!companionData.success || !companionData.data) {
        throw new Error(companionData.error || "Error al cargar acompañante")
      }
      
      // Extract the actual companion data from the response
      const companion = companionData.data
      setCompanion(companion)
      setGuests(guestsData.results || [])
      
      // Set form data with companion information
      setFormData({
        guest: companion.guest,
        full_name: companion.full_name,
        nickname: companion.nickname,
        relationship: companion.relationship,
        age_group: companion.age_group,
        seat_number: companion.seat_number,
        dietary_notes: companion.dietary_notes,
        special_notes: companion.special_notes,
        metadata: companion.metadata
      })
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información del acompañante",
        variant: "destructive"
      })
      router.push("/dashboard/eventhub/companions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.full_name?.trim()) {
      toast({
        title: "Error",
        description: "El nombre del acompañante es obligatorio",
        variant: "destructive"
      })
      return
    }

    if (!formData.guest) {
      toast({
        title: "Error",
        description: "Debes seleccionar un invitado principal",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await GuestCompanionsService.updateCompanion(companionId, formData)
      
      if (response.success === false) {
        throw new Error(response.error || "Error al actualizar acompañante")
      }

      toast({
        title: "Éxito",
        description: "Acompañante actualizado correctamente"
      })
      
      router.push("/dashboard/eventhub/companions")
    } catch (error) {
      console.error("Error updating companion:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el acompañante",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof UpdateGuestCompanionRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
      default: return "Otro"
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

  if (!companion) {
    return (
      <AdminLayout siteType="eventhub" siteId="1" siteName="EventHub">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Acompañante no encontrado</div>
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
            onClick={() => router.push("/dashboard/eventhub/companions")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Acompañante</h1>
            <p className="text-gray-600">Modifica la información del acompañante</p>
          </div>
        </div>

        {/* Companion Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información Actual</CardTitle>
            <CardDescription>
              ID: {companion.id} • Acompañante de {getGuestName(companion.guest)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold">ID:</span> {companion.id}
              </div>
              <div>
                <span className="font-semibold">Creado:</span> {new Date(companion.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Actualizado:</span> {new Date(companion.updated_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Invitado:</span> {getGuestName(companion.guest)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Editar Información</CardTitle>
            <CardDescription>
              Actualiza los datos del acompañante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="full_name">Nombre Completo *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name || ""}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      placeholder="Ej: María González"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nickname">Apodo</Label>
                    <Input
                      id="nickname"
                      value={formData.nickname || ""}
                      onChange={(e) => handleInputChange("nickname", e.target.value)}
                      placeholder="Ej: Mary"
                    />
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

              {/* Relación y Grupo Etario */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Clasificación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guest">Invitado Principal *</Label>
                    <Select
                      value={formData.guest?.toString() || "none"}
                      onValueChange={(value) => handleInputChange("guest", value === "none" ? 0 : parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar invitado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Seleccionar invitado...</SelectItem>
                        {guests.map((guest) => (
                          <SelectItem key={guest.id} value={guest.id.toString()}>
                            {guest.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="relationship">Relación *</Label>
                    <Select
                      value={formData.relationship}
                      onValueChange={(value) => handleInputChange("relationship", value as Relationship)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                    <Label htmlFor="age_group">Grupo Etario *</Label>
                    <Select
                      value={formData.age_group}
                      onValueChange={(value) => handleInputChange("age_group", value as AgeGroup)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baby">Bebé</SelectItem>
                        <SelectItem value="child">Niño/a</SelectItem>
                        <SelectItem value="teen">Adolescente</SelectItem>
                        <SelectItem value="adult">Adulto</SelectItem>
                        <SelectItem value="senior">Adulto Mayor</SelectItem>
                        <SelectItem value="unknown">Desconocido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notas Adicionales</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dietary_notes">Notas Dietéticas</Label>
                    <Textarea
                      id="dietary_notes"
                      value={formData.dietary_notes || ""}
                      onChange={(e) => handleInputChange("dietary_notes", e.target.value)}
                      placeholder="Ej: Alergia al maní, vegetariano, etc..."
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="special_notes">Notas Especiales</Label>
                    <Textarea
                      id="special_notes"
                      value={formData.special_notes || ""}
                      onChange={(e) => handleInputChange("special_notes", e.target.value)}
                      placeholder="Ej: Necesita silla de ruedas, requiere asistencia especial..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vista Previa</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">
                        {(formData.full_name || "A").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{formData.full_name || "Nombre del acompañante"}</div>
                      <div className="text-sm text-gray-600">
                        {formData.nickname && `"${formData.nickname}"`} • {getRelationshipText(formData.relationship || "other")}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getAgeGroupColor(formData.age_group || "adult")}>
                          {getAgeGroupText(formData.age_group || "adult")}
                        </Badge>
                        {formData.seat_number && (
                          <span className="text-xs text-gray-500">Asiento: {formData.seat_number}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/eventhub/companions")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Actualizando..." : "Actualizar Acompañante"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
