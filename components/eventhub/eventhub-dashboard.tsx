"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, User, Edit, Calendar as CalendarIcon, Plus } from "lucide-react"
import { AdminLayout } from "../admin-layout"
import { EventHubService } from "@/services/eventhub/eventhub.service"
import type { EventProfile } from "@/types/eventhub/eventhub"
import { AuthService } from "@/services/auth.service"

interface EventHubDashboardProps {
  siteId: string
}

export function EventHubDashboard({ siteId }: EventHubDashboardProps) {
  const router = useRouter()
  const [siteData, setSiteData] = useState<any>(null)
  const [eventProfile, setEventProfile] = useState<EventProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")

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
  }, [])

  useEffect(() => {
    const fetchEventProfiles = async () => {
      const response = await EventHubService.getProfiles()
      
      if (response.success && response.data) {
        console.log("response.data", response.data)
        
        // El backend siempre devuelve un array, tomamos el primer elemento
        if (Array.isArray(response.data) && response.data.length > 0) {
          const profile = response.data[0]
          localStorage.setItem("event_profiles", JSON.stringify([profile]))
          setEventProfile(profile)
        } else if (response.data.results && Array.isArray(response.data.results) && response.data.results.length > 0) {
          // Por si acaso viene con la estructura paginada
          const profile = response.data.results[0]
          localStorage.setItem("event_profiles", JSON.stringify([profile]))
          setEventProfile(profile)
        } else {
          // No hay perfiles, redirigir a crear
          router.push(`/dashboard/eventhub/profiles/create`)
        }
      } else {
        // Error o no hay perfiles, redirigir a crear
        router.push(`/dashboard/eventhub/profiles/create`)
      }
      
      setIsLoading(false)
    }

    fetchEventProfiles()
  }, [siteId, router])

  const handleEditProfile = () => {
    if (eventProfile?.id) {
      router.push(`/dashboard/eventhub/profiles/edit/${eventProfile.id}`)
    }
  }

  if (!siteData) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F2CFCE]/30 border-t-[#F2CFCE]" />
          <p className="text-sm text-muted-foreground">Cargando…</p>
        </div>
      </div>
    )
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

  if (!eventProfile) {
    return null // Ya debería haber redirigido
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    return `${hours}:${minutes}`
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "published":
        return "Publicado"
      case "draft":
        return "Borrador"
      case "archived":
        return "Archivado"
      default:
        return status || "Desconocido"
    }
  }

  return (
    <AdminLayout
      siteType="eventhub"
      siteId={siteId}
      siteName={siteData.name}
      currentPath={`/dashboard/eventhub`}
    >
      <div className="p-6">
        <div className="mb-8">
          <Card className={`${secondBackgroundColor} ${principalText}`}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={siteData.main_image || "/placeholder.svg"}
                    alt={`Logo de ${siteData.name}`}
                    className="h-32 w-32 rounded-lg object-cover border-2 border-white shadow-sm"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-1">{siteData.name}</h1>
                  <p className="text-gray-600 mb-3">{siteData.description}</p>
                </div>
                <div className="order-last sm:order-none w-full sm:w-auto text-center sm:text-right mt-2 sm:mt-0">
                  <p className="text-lg font-semibold mb-1">¡Bienvenido de vuelta!</p>
                  <p className="text-sm">Gestiona tu evento desde aquí</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Card className={`${secondBackgroundColor} ${principalText}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Perfil del Evento
                  </CardTitle>
                  <CardDescription>
                    Información del perfil de evento actual
                  </CardDescription>
                </div>
                <Button onClick={handleEditProfile} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Editar Perfil
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Título y Estado */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 className="text-2xl font-bold">{eventProfile.title}</h2>
                  <Badge className={getStatusColor(eventProfile.status)}>
                    {getStatusLabel(eventProfile.status)}
                  </Badge>
                </div>

                {/* Descripción */}
                {eventProfile.description && (
                  <p className="text-gray-600">{eventProfile.description}</p>
                )}

                {/* Detalles del evento */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Fecha</p>
                      <p className="text-sm text-gray-600">{formatDate(eventProfile.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Horario</p>
                      <p className="text-sm text-gray-600">
                        {formatTime(eventProfile.start_time)} - {formatTime(eventProfile.end_time)}
                      </p>
                    </div>
                  </div>

                  {eventProfile.location_name && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Lugar</p>
                        <p className="text-sm text-gray-600">{eventProfile.location_name}</p>
                        {eventProfile.location_address && (
                          <p className="text-xs text-gray-500">{eventProfile.location_address}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {eventProfile.celebrant_name && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Celebrante</p>
                        <p className="text-sm text-gray-600">{eventProfile.celebrant_name}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Token público */}
                {eventProfile.public_token && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Token Público</p>
                    <p className="text-sm font-mono text-gray-600">{eventProfile.public_token}</p>
                  </div>
                )}

                {/* Fechas de creación/actualización */}
                <div className="flex items-center gap-6 text-xs text-gray-500">
                  {eventProfile.created_at && (
                    <span>Creado: {new Date(eventProfile.created_at).toLocaleString("es-ES")}</span>
                  )}
                  {eventProfile.updated_at && (
                    <span>Actualizado: {new Date(eventProfile.updated_at).toLocaleString("es-ES")}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
