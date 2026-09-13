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
import { MemoryAlbumTemplateService } from "@/services/eventhub/memory-album.service"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Edit, Trash2, Upload, Layout, ArrowLeft, Eye, EyeOff, Image as ImageIcon } from "lucide-react"
import type { MemoryAlbumTemplate, MemoryAlbumTemplateFilters } from "@/types/eventhub/memory-album"

export default function AlbumTemplatesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<MemoryAlbumTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<MemoryAlbumTemplateFilters>({
    is_active: true
  })

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      console.log("Loading templates...")
      const searchFilters = {
        ...filters,
        search: searchTerm || undefined
      }
      const templatesData = await MemoryAlbumTemplateService.getTemplates(searchFilters)
      console.log("Templates response:", templatesData)
      setTemplates(templatesData.results || [])
    } catch (error) {
      console.error("Error loading templates:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información de plantillas",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (templateId: number) => {
    if (!confirm("¿Estás seguro de eliminar esta plantilla?")) return
    
    try {
      await MemoryAlbumTemplateService.deleteTemplate(templateId)
      await loadData()
      toast({
        title: "Éxito",
        description: "Plantilla eliminada correctamente"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la plantilla",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (template: MemoryAlbumTemplate) => {
    try {
      await MemoryAlbumTemplateService.updateTemplate(template.id, {
        is_active: !template.is_active
      })
      await loadData()
      toast({
        title: "Éxito",
        description: `Plantilla ${template.is_active ? 'desactivada' : 'activada'} correctamente`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la plantilla",
        variant: "destructive"
      })
    }
  }

  const handleUploadPreview = async (templateId: number) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const response = await MemoryAlbumTemplateService.uploadPreview(templateId, file)
          if (response.success) {
            toast({
              title: "Éxito",
              description: "Preview subido correctamente"
            })
            await loadData()
          } else {
            toast({
              title: "Error",
              description: response.error || "No se pudo subir el preview",
              variant: "destructive"
            })
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "No se pudo subir el preview",
            variant: "destructive"
          })
        }
      }
    }
    input.click()
  }

  const getPageTypeColor = (pageType: string) => {
    switch (pageType) {
      case 'cover': return 'bg-blue-100 text-blue-800'
      case 'welcome': return 'bg-green-100 text-green-800'
      case 'arrival': return 'bg-purple-100 text-purple-800'
      case 'party': return 'bg-pink-100 text-pink-800'
      case 'student': return 'bg-yellow-100 text-yellow-800'
      case 'dedications': return 'bg-red-100 text-red-800'
      case 'highlights': return 'bg-orange-100 text-orange-800'
      case 'closing': return 'bg-gray-100 text-gray-800'
      case 'back_cover': return 'bg-indigo-100 text-indigo-800'
      case 'custom': return 'bg-teal-100 text-teal-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPageTypeText = (pageType: string) => {
    switch (pageType) {
      case 'cover': return 'Portada'
      case 'welcome': return 'Bienvenida'
      case 'arrival': return 'Llegada'
      case 'party': return 'Fiesta'
      case 'student': return 'Estudiante'
      case 'dedications': return 'Dedicatorias'
      case 'highlights': return 'Destacados'
      case 'closing': return 'Cierre'
      case 'back_cover': return 'Contraportada'
      case 'custom': return 'Personalizada'
      default: return pageType
    }
  }

  const getRequiredSlotsText = (requiredSlots: Record<string, any>) => {
    if (!requiredSlots || typeof requiredSlots !== 'object') return 'N/A'
    const slots = Object.keys(requiredSlots)
    return slots.length > 0 ? slots.join(', ') : 'Ninguno'
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
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/eventhub/album_gestion")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Plantillas de Página</h1>
              <p className="text-gray-600">Administra las plantillas de diseño para las páginas de álbum</p>
            </div>
          </div>
          <Button onClick={() => router.push("/dashboard/eventhub/album_gestion/templates/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Plantilla
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
                    placeholder="Nombre, clave o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="is_active">Estado</Label>
                <Select 
                  value={filters.is_active?.toString() || "all"} 
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    is_active: value === "all" ? undefined : value === "true"
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="true">Activas</SelectItem>
                    <SelectItem value="false">Inactivas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="page_type">Tipo de Página</Label>
                <Select 
                  value={filters.page_type || "all"} 
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    page_type: value === "all" ? undefined : value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="cover">Portada</SelectItem>
                    <SelectItem value="welcome">Bienvenida</SelectItem>
                    <SelectItem value="arrival">Llegada</SelectItem>
                    <SelectItem value="party">Fiesta</SelectItem>
                    <SelectItem value="student">Estudiante</SelectItem>
                    <SelectItem value="dedications">Dedicatorias</SelectItem>
                    <SelectItem value="highlights">Destacados</SelectItem>
                    <SelectItem value="closing">Cierre</SelectItem>
                    <SelectItem value="back_cover">Contraportada</SelectItem>
                    <SelectItem value="custom">Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid gap-6">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron plantillas</p>
                <Button 
                  className="mt-4" 
                  onClick={() => router.push("/dashboard/eventhub/album_gestion/templates/create")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Plantilla
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-4">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                      {template.preview_image_url ? (
                        <img
                          src={template.preview_image_url}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Layout className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-sm">
                        Clave: <code className="bg-gray-100 px-1 rounded">{template.key}</code>
                      </CardDescription>
                      {template.description && (
                        <CardDescription className="text-sm line-clamp-2">
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getPageTypeColor(template.page_type)}>
                        {getPageTypeText(template.page_type)}
                      </Badge>
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>

                    {/* Info */}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold">Template HTML:</span>
                        <span className="text-xs bg-gray-100 px-1 rounded">
                          {template.html_template_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Slots Requeridos:</span>
                        <span>{getRequiredSlotsText(template.required_slots)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Orden:</span>
                        <span>{template.sort_order}</span>
                      </div>
                      {template.default_background && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Fondo Default:</span>
                          <span className="text-xs bg-blue-100 px-1 rounded">
                            {template.default_background.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUploadPreview(template.id)}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(template)}
                        className="flex-1"
                      >
                        {template.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/eventhub/album_gestion/templates/${template.id}/edit`)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <CardTitle>Resumen de Plantillas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
                <div className="text-sm text-gray-600">Total Plantillas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {templates.filter(t => t.is_active).length}
                </div>
                <div className="text-sm text-gray-600">Activas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {templates.filter(t => t.preview_image_url).length}
                </div>
                <div className="text-sm text-gray-600">Con Preview</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {templates.filter(t => t.default_background).length}
                </div>
                <div className="text-sm text-gray-600">Con Fondo Default</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
