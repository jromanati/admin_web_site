"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin-layout"
import { EventHubService } from "@/services/eventhub/eventhub.service"
import type { CreateEventProfileRequest, EventStatus } from "@/types/eventhub/eventhub"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Clock, User } from "lucide-react"
import { AuthService } from "@/services/auth.service"

interface CreateEventProfilePageProps {
  params: {
    id: string
  }
}

export default function CreateEventProfilePage({ params }: CreateEventProfilePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [siteData, setSiteData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")

  const [formData, setFormData] = useState<CreateEventProfileRequest>({
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    location_name: "",
    location_address: "",
    celebrant_name: "",
    status: undefined,
    settings: {},
  })

  useEffect(() => {
    const isValid = AuthService.isTokenValid()
    if (!isValid) {
      const isRefreshValid = AuthService.isRefreshTokenValid()
      if (!isRefreshValid) window.location.href = "/"
    }

    const rawClientData = localStorage.getItem("tenant_data")
    const tenant_data = rawClientData ? JSON.parse(rawClientData) : null
    if (tenant_data?.styles_site) {
      setSecondBackgroundColor(tenant_data.styles_site.second_background_color)
      setPrincipalText(tenant_data.styles_site.principal_text)
    }
  }, [])

  useEffect(() => {
    const rawUserData = localStorage.getItem("user_data")
    const rawClientData = localStorage.getItem("tenant_data")
    const tenant_data = rawClientData ? JSON.parse(rawClientData) : null
    setSiteData({
      name: tenant_data?.name,
      main_image: tenant_data?.main_image,
      description: tenant_data?.description
    })
    setIsLoading(false)
  }, [])

  const handleInputChange = (field: keyof CreateEventProfileRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await EventHubService.createProfile(formData)

      if (response.success) {
        toast({
          title: "Perfil creado",
          description: "El perfil del evento ha sido creado exitosamente.",
        })
        router.push(`/dashboard/eventhub/${params.id}`)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || "No se pudo crear el perfil del evento.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al crear el perfil del evento.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.push(`/dashboard/eventhub/${params.id}`)
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F2CFCE]/30 border-t-[#F2CFCE]" />
          <p className="text-sm text-muted-foreground">Cargando…</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout
      siteType="eventhub"
      siteId={params.id}
      siteName={siteData?.name || ""}
      currentPath={`/dashboard/eventhub/${params.id}/profiles/create`}
    >
      <div className="p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
        </div>

        <Card className={`${secondBackgroundColor} ${principalText} max-w-4xl mx-auto`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Crear Perfil de Evento
            </CardTitle>
            <CardDescription>
              Completa la información para crear un nuevo perfil de evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Evento *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ej: Cumpleaños de María"
                    required
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Descripción del evento"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="celebrant_name">Nombre del Celebrante</Label>
                  <Input
                    id="celebrant_name"
                    value={formData.celebrant_name}
                    onChange={(e) => handleInputChange("celebrant_name", e.target.value)}
                    placeholder="Ej: María González"
                    maxLength={255}
                  />
                </div>
              </div>

              {/* Fecha y hora */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Fecha y Hora
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="date">Fecha del Evento *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Hora de Inicio *</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => handleInputChange("start_time", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time">Hora de Fin *</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => handleInputChange("end_time", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="location_name">Nombre del Lugar</Label>
                  <Input
                    id="location_name"
                    value={formData.location_name}
                    onChange={(e) => handleInputChange("location_name", e.target.value)}
                    placeholder="Ej: Salón Los Pinos"
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_address">Dirección</Label>
                  <Input
                    id="location_address"
                    value={formData.location_address}
                    onChange={(e) => handleInputChange("location_address", e.target.value)}
                    placeholder="Ej: Av. Principal 123"
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Estado del Evento</h3>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value as EventStatus)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="archived">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : "Crear Perfil"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
