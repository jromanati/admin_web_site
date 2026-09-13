"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { use } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AdminLayout } from "@/components/admin-layout"
import { GuestGroupsService } from "@/services/eventhub/guests.service"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import type { GuestGroup, UpdateGuestGroupRequest } from "@/types/eventhub/guests"

interface EditGuestGroupPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditGuestGroupPage({ params }: EditGuestGroupPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const resolvedParams = use(params)
  const groupId = parseInt(resolvedParams.id)
  
  const [group, setGroup] = useState<GuestGroup | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<UpdateGuestGroupRequest>({
    name: "",
    description: "",
    sort_order: 0,
    is_active: true,
    metadata: {}
  })

  useEffect(() => {
    loadData()
  }, [groupId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const groupData = await GuestGroupsService.getGuestGroupById(groupId)
      
      // Check if the response has success property (error case)
      if (!groupData.success || !groupData.data) {
        throw new Error(groupData.error || "Error al cargar grupo")
      }
      
      // Extract the actual group data from the response
      const group = groupData.data
      setGroup(group)
      
      // Set form data with group information
      setFormData({
        name: group.name,
        description: group.description,
        sort_order: group.sort_order,
        is_active: group.is_active,
        metadata: group.metadata
      })
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información del grupo",
        variant: "destructive"
      })
      router.push("/dashboard/eventhub/guest-groups")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name?.trim()) {
      toast({
        title: "Error",
        description: "El nombre del grupo es obligatorio",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await GuestGroupsService.updateGuestGroup(groupId, formData)
      
      if (response.success === false) {
        throw new Error(response.error || "Error al actualizar grupo")
      }

      toast({
        title: "Éxito",
        description: "Grupo actualizado correctamente"
      })
      
      router.push("/dashboard/eventhub/guest-groups")
    } catch (error) {
      console.error("Error updating group:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el grupo",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof UpdateGuestGroupRequest, value: any) => {
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

  if (!group) {
    return (
      <AdminLayout siteType="eventhub" siteId="1" siteName="EventHub">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Grupo no encontrado</div>
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
            onClick={() => router.push("/dashboard/eventhub/guest-groups")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Grupo de Invitados</h1>
            <p className="text-gray-600">Modifica la información del grupo</p>
          </div>
        </div>

        {/* Group Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información Actual</CardTitle>
            <CardDescription>
              ID: {group.id} • Creado: {new Date(group.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold">ID:</span> {group.id}
              </div>
              <div>
                <span className="font-semibold">Creado:</span> {new Date(group.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Actualizado:</span> {new Date(group.updated_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Estado:</span> {group.is_active ? "Activo" : "Inactivo"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Editar Información</CardTitle>
            <CardDescription>
              Actualiza los datos del grupo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Nombre del Grupo *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Ej: Familia Cercana"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sort_order">Orden</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order || ""}
                      onChange={(e) => handleInputChange("sort_order", parseInt(e.target.value))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Descripción</h3>
                <div>
                  <Label htmlFor="description">Descripción del Grupo</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Ej: Grupo familiar de los celebrantes incluyendo padres, hermanos y abuelos..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Estado</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange("is_active", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_active">Grupo activo</Label>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vista Previa</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">
                        {(formData.name || "G").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{formData.name || "Nombre del grupo"}</div>
                      <div className="text-sm text-gray-600">
                        {formData.description || "Descripción del grupo"}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={formData.is_active ? "default" : "secondary"}>
                          {formData.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                        {formData.sort_order !== undefined && (
                          <span className="text-xs text-gray-500">Orden: {formData.sort_order}</span>
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
                  onClick={() => router.push("/dashboard/eventhub/guest-groups")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Actualizando..." : "Actualizar Grupo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
