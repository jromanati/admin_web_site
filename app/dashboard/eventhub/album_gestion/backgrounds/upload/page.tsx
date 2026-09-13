"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AdminLayout } from "@/components/admin-layout"
import { MemoryAlbumBackgroundService } from "@/services/eventhub/memory-album.service"
import { useToast } from "@/hooks/use-toast"
import { Upload, Image as ImageIcon, ArrowLeft, Save, Eye } from "lucide-react"
import type { CreateMemoryAlbumBackgroundRequest } from "@/types/eventhub/memory-album"

export default function AlbumBackgroundUploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<CreateMemoryAlbumBackgroundRequest, 'file'> & { file?: File }>({
    name: "",
    key: "",
    background_type: "tenant_upload",
    category: "other",
    description: "",
    is_system: false,
    is_active: true,
    sort_order: 0,
    metadata: {},
    file: undefined
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "El archivo debe ser una imagen",
          variant: "destructive"
        })
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error", 
          description: "El archivo no debe superar los 10MB",
          variant: "destructive"
        })
        return
      }

      setFormData(prev => ({ ...prev, file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (field: keyof CreateMemoryAlbumBackgroundRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateKeyFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      key: prev.key || generateKeyFromName(name)
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!formData.file) {
      toast({
        title: "Error",
        description: "Debes seleccionar una imagen",
        variant: "destructive"
      })
      return
    }

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive"
      })
      return
    }

    if (!formData.key.trim()) {
      toast({
        title: "Error",
        description: "La clave es requerida",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      console.log("Uploading background...")
      // Ensure we have a file before creating the request
      if (!formData.file) {
        throw new Error("No file selected")
      }
      
      const uploadData: CreateMemoryAlbumBackgroundRequest = {
        ...formData,
        file: formData.file
      }
      
      const response = await MemoryAlbumBackgroundService.createBackground(uploadData)
      console.log("Upload response:", response)

      if (response.success) {
        toast({
          title: "Éxito",
          description: "Fondo subido correctamente"
        })
        router.push("/dashboard/eventhub/album_gestion/backgrounds")
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo subir el fondo",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error uploading background:", error)
      toast({
        title: "Error",
        description: "No se pudo subir el fondo",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = () => {
    if (preview) {
      window.open(preview, '_blank')
    }
  }

  return (
    <AdminLayout siteType="eventhub" siteId="1" siteName="EventHub">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Subir Fondo de Álbum</h1>
            <p className="text-gray-600">Añade una nueva imagen de fondo para los álbumes de memoria</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Imagen del Fondo</CardTitle>
                <CardDescription>
                  Selecciona una imagen para el fondo (JPG, PNG, WebP - Máx. 10MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* File Input */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Seleccionar Imagen
                    </Button>
                  </div>

                  {/* Preview */}
                  {preview && (
                    <div className="space-y-2">
                      <Label>Vista Previa</Label>
                      <div className="relative group">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={preview}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={handlePreview}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      {formData.file && (
                        <p className="text-sm text-gray-600">
                          Archivo: {formData.file.name} ({Math.round(formData.file.size / 1024 / 1024 * 100) / 100} MB)
                        </p>
                      )}
                    </div>
                  )}

                  {!preview && (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No hay imagen seleccionada</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ej: Elegante Dorado"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="key">Clave *</Label>
                    <Input
                      id="key"
                      value={formData.key}
                      onChange={(e) => handleInputChange('key', e.target.value)}
                      placeholder="ej: elegante-dorado"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Identificador único (sin espacios, usa guiones)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe el estilo o uso de este fondo..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="background_type">Tipo de Fondo</Label>
                    <Select
                      value={formData.background_type}
                      onValueChange={(value) => handleInputChange('background_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tenant_upload">Subido por Usuario</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                        <SelectItem value="generated_ai">Generado por IA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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

                  <div>
                    <Label htmlFor="sort_order">Orden</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Orden de aparición (menor número aparece primero)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Estado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_active">Activo</Label>
                      <p className="text-sm text-gray-600">
                        El fondo estará disponible para usar
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_system">Fondo de Sistema</Label>
                      <p className="text-sm text-gray-600">
                        No editable por usuarios regulares
                      </p>
                    </div>
                    <Switch
                      id="is_system"
                      checked={formData.is_system}
                      onCheckedChange={(checked) => handleInputChange('is_system', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.file}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Subiendo..." : "Subir Fondo"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
