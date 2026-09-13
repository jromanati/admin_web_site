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
import { MemoryAlbumBackgroundService } from "@/services/eventhub/memory-album.service"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Edit, Trash2, Upload, Image as ImageIcon, Eye, EyeOff, ArrowLeft } from "lucide-react"
import type { MemoryAlbumBackground, MemoryAlbumBackgroundFilters } from "@/types/eventhub/memory-album"

export default function AlbumBackgroundsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [backgrounds, setBackgrounds] = useState<MemoryAlbumBackground[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<MemoryAlbumBackgroundFilters>({
    is_active: true,
    is_system: true
  })

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      console.log("Loading backgrounds...")
      const searchFilters = {
        ...filters,
        search: searchTerm || undefined
      }
      const backgroundsData = await MemoryAlbumBackgroundService.getBackgrounds(searchFilters)
      console.log("Backgrounds response:", backgroundsData)
      setBackgrounds(backgroundsData.results || [])
    } catch (error) {
      console.error("Error loading backgrounds:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información de fondos",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (backgroundId: number) => {
    if (!confirm("¿Estás seguro de eliminar este fondo?")) return
    
    try {
      await MemoryAlbumBackgroundService.deleteBackground(backgroundId)
      await loadData()
      toast({
        title: "Éxito",
        description: "Fondo eliminado correctamente"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el fondo",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (background: MemoryAlbumBackground) => {
    try {
      await MemoryAlbumBackgroundService.updateBackground(background.id, {
        is_active: !background.is_active
      })
      await loadData()
      toast({
        title: "Éxito",
        description: `Fondo ${background.is_active ? 'desactivado' : 'activado'} correctamente`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del fondo",
        variant: "destructive"
      })
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'elegant': return 'bg-purple-100 text-purple-800'
      case 'scrapbook': return 'bg-pink-100 text-pink-800'
      case 'neon': return 'bg-green-100 text-green-800'
      case 'vintage': return 'bg-amber-100 text-amber-800'
      case 'graduation': return 'bg-blue-100 text-blue-800'
      case 'wedding': return 'bg-rose-100 text-rose-800'
      case 'birthday': return 'bg-yellow-100 text-yellow-800'
      case 'corporate': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryText = (category?: string) => {
    switch (category) {
      case 'elegant': return 'Elegante'
      case 'scrapbook': return 'Scrapbook'
      case 'neon': return 'Neón'
      case 'vintage': return 'Vintage'
      case 'graduation': return 'Graduación'
      case 'wedding': return 'Boda'
      case 'birthday': return 'Cumpleaños'
      case 'corporate': return 'Corporativo'
      default: return category || 'Otro'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system': return 'bg-blue-100 text-blue-800'
      case 'tenant_upload': return 'bg-green-100 text-green-800'
      case 'generated_ai': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'system': return 'Sistema'
      case 'tenant_upload': return 'Subido'
      case 'generated_ai': return 'IA Generado'
      default: return type
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
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
              <h1 className="text-3xl font-bold">Fondos de Álbum</h1>
              <p className="text-gray-600">Gestiona las imágenes de fondo para los álbumes de memoria</p>
            </div>
          </div>
          <Button onClick={() => router.push("/dashboard/eventhub/album_gestion/backgrounds/upload")}>
            <Upload className="h-4 w-4 mr-2" />
            Subir Fondo
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Activos</SelectItem>
                    <SelectItem value="false">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="is_system">Origen</Label>
                <Select 
                  value={filters.is_system?.toString() || "all"} 
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    is_system: value === "all" ? undefined : value === "true"
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="false">Subidos</SelectItem>
                    <SelectItem value="true">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select 
                  value={filters.category || "all"} 
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    category: value === "all" ? undefined : value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="elegant">Elegante</SelectItem>
                    <SelectItem value="scrapbook">Scrapbook</SelectItem>
                    <SelectItem value="neon">Neón</SelectItem>
                    <SelectItem value="vintage">Vintage</SelectItem>
                    <SelectItem value="graduation">Graduación</SelectItem>
                    <SelectItem value="wedding">Boda</SelectItem>
                    <SelectItem value="birthday">Cumpleaños</SelectItem>
                    <SelectItem value="corporate">Corporativo</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backgrounds Grid */}
        <div className="grid gap-6">
          {backgrounds.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron fondos</p>
                <Button 
                  className="mt-4" 
                  onClick={() => router.push("/dashboard/eventhub/album_gestion/backgrounds/upload")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Primer Fondo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {backgrounds.map((background) => (
                <Card key={background.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-4">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                      {background.image_secure_url ? (
                        <img
                          src={background.image_secure_url}
                          alt={background.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{background.name}</CardTitle>
                      <CardDescription className="text-sm">
                        Clave: <code className="bg-gray-100 px-1 rounded">{background.key}</code>
                      </CardDescription>
                      {background.description && (
                        <CardDescription className="text-sm line-clamp-2">
                          {background.description}
                        </CardDescription>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getCategoryColor(background.category)}>
                        {getCategoryText(background.category)}
                      </Badge>
                      <Badge className={getTypeColor(background.background_type)}>
                        {getTypeText(background.background_type)}
                      </Badge>
                      <Badge variant={background.is_active ? "default" : "secondary"}>
                        {background.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>

                    {/* Info */}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold">Dimensiones:</span>
                        <span>{background.width}×{background.height || '?'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Tamaño:</span>
                        <span>{formatFileSize(background.file_size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Orden:</span>
                        <span>{background.sort_order}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(background)}
                        className="flex-1"
                      >
                        {background.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/eventhub/album_gestion/backgrounds/${background.id}/edit`)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(background.id)}
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
            <CardTitle>Resumen de Fondos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{backgrounds.length}</div>
                <div className="text-sm text-gray-600">Total Fondos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {backgrounds.filter(b => b.is_active).length}
                </div>
                <div className="text-sm text-gray-600">Activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {backgrounds.filter(b => b.background_type === 'tenant_upload').length}
                </div>
                <div className="text-sm text-gray-600">Subidos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {backgrounds.filter(b => b.background_type === 'system').length}
                </div>
                <div className="text-sm text-gray-600">Sistema</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
