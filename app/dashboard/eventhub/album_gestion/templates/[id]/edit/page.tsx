"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AdminLayout } from "@/components/admin-layout"
import { MemoryAlbumTemplateService } from "@/services/eventhub/memory-album.service"
import { MemoryAlbumBackgroundService } from "@/services/eventhub/memory-album.service"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Layout, Plus, FileText } from "lucide-react"
import type { UpdateMemoryAlbumTemplateRequest, MemoryAlbumBackground, MemoryAlbumTemplate, AvailableTemplate } from "@/types/eventhub/memory-album"

export default function AlbumTemplateEditPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const templateId = parseInt(params.id as string)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [backgrounds, setBackgrounds] = useState<MemoryAlbumBackground[]>([])
  const [availableTemplates, setAvailableTemplates] = useState<AvailableTemplate[]>([])
  const [showAvailableTemplates, setShowAvailableTemplates] = useState(false)
  const [template, setTemplate] = useState<MemoryAlbumTemplate | null>(null)
  const [formData, setFormData] = useState<UpdateMemoryAlbumTemplateRequest>({
    name: "",
    key: "",
    page_type: "cover",
    html_template_name: "",
    description: "",
    required_slots: {},
    settings: {},
    is_active: true,
    sort_order: 0,
    metadata: {}
  })

  useEffect(() => {
    if (templateId) {
      loadTemplate()
      loadBackgrounds()
      loadAvailableTemplates()
    }
  }, [templateId])

  const loadTemplate = async () => {
    try {
      setIsLoading(true)
      const templateData = await MemoryAlbumTemplateService.getTemplateById(templateId)
      if (templateData.success && templateData.data) {
        setTemplate(templateData.data)
        setFormData({
          name: templateData.data.name,
          key: templateData.data.key,
          page_type: templateData.data.page_type,
          html_template_name: templateData.data.html_template_name,
          description: templateData.data.description || "",
          required_slots: templateData.data.required_slots || {},
          settings: templateData.data.settings || {},
          is_active: templateData.data.is_active,
          sort_order: templateData.data.sort_order,
          metadata: templateData.data.metadata || {}
        })
      } else {
        toast({
          title: "Error",
          description: templateData.error || "No se pudo cargar la plantilla",
          variant: "destructive"
        })
        router.push("/dashboard/eventhub/album_gestion/templates")
      }
    } catch (error) {
      console.error("Error loading template:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la plantilla",
        variant: "destructive"
      })
      router.push("/dashboard/eventhub/album_gestion/templates")
    } finally {
      setIsLoading(false)
    }
  }

  const loadBackgrounds = async () => {
    try {
      const backgroundsData = await MemoryAlbumBackgroundService.getBackgrounds({
        is_active: true
      })
      setBackgrounds(backgroundsData.results || [])
    } catch (error) {
      console.error("Error loading backgrounds:", error)
    }
  }

  const loadAvailableTemplates = async () => {
    try {
      const templatesData = await MemoryAlbumTemplateService.getAvailableTemplates()
      setAvailableTemplates(templatesData)
    } catch (error) {
      console.error("Error loading available templates:", error)
    }
  }

  const handleInputChange = (field: keyof UpdateMemoryAlbumTemplateRequest, value: any) => {
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

  const handleSelectAvailableTemplate = (availableTemplate: AvailableTemplate) => {
    // Convert available template to form data
    const convertedSlots: Record<string, any> = {}
    
    // Convert text slots
    availableTemplate.required_slots.text_slots.forEach(slot => {
      convertedSlots[slot.key] = {
        type: 'text',
        required: slot.required,
        label: slot.label,
        default: slot.default
      }
    })
    
    // Convert photo slots
    availableTemplate.required_slots.photo_slots.forEach(slot => {
      convertedSlots[slot.key] = {
        type: 'image',
        required: slot.required,
        label: slot.label
      }
    })
    
    // Convert message slots
    availableTemplate.required_slots.message_slots.forEach(slot => {
      convertedSlots[slot.key] = {
        type: 'message',
        required: slot.required,
        label: slot.label
      }
    })

    setFormData(prev => ({
      ...prev,
      name: availableTemplate.name,
      key: generateKeyFromName(availableTemplate.name),
      page_type: availableTemplate.page_type as any,
      html_template_name: availableTemplate.filename,
      description: availableTemplate.description,
      required_slots: convertedSlots
    }))
    
    setShowAvailableTemplates(false)
    
    toast({
      title: "Plantilla seleccionada",
      description: `Se ha cargado la plantilla "${availableTemplate.name}"`
    })
  }

  const handleRequiredSlotsChange = (action: 'add' | 'remove', slotName?: string) => {
    if (action === 'add' && slotName) {
      setFormData(prev => ({
        ...prev,
        required_slots: {
          ...(prev.required_slots || {}),
          [slotName]: {
            type: 'text',
            required: true,
            label: slotName.charAt(0).toUpperCase() + slotName.slice(1)
          }
        }
      }))
    } else if (action === 'remove' && slotName) {
      const newSlots = { ...(formData.required_slots || {}) }
      delete newSlots[slotName]
      setFormData(prev => ({
        ...prev,
        required_slots: newSlots
      }))
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
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

    if (!formData.html_template_name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del template HTML es requerido",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)

    try {
      console.log("Updating template...")
      const response = await MemoryAlbumTemplateService.updateTemplate(templateId, formData)
      console.log("Update template response:", response)

      if (response.success) {
        toast({
          title: "Éxito",
          description: "Plantilla actualizada correctamente"
        })
        router.push("/dashboard/eventhub/album_gestion/templates")
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo actualizar la plantilla",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating template:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la plantilla",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addNewSlot = () => {
    const slotName = prompt("Nombre del nuevo slot (ej: title, image, text):")
    if (slotName && slotName.trim()) {
      handleRequiredSlotsChange('add', slotName.trim().toLowerCase())
    }
  }

  const updateSlotConfig = (slotName: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      required_slots: {
        ...(prev.required_slots || {}),
        [slotName]: {
          ...(prev.required_slots?.[slotName] || {
            type: 'text',
            required: true,
            label: slotName.charAt(0).toUpperCase() + slotName.slice(1)
          }),
          [field]: value
        }
      }
    }))
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

  if (isLoading) {
    return (
      <AdminLayout siteType="eventhub" siteId="1" siteName="EventHub">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando plantilla...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!template) {
    return (
      <AdminLayout siteType="eventhub" siteId="1" siteName="EventHub">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Plantilla no encontrada</div>
        </div>
      </AdminLayout>
    )
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
            <h1 className="text-3xl font-bold">Editar Plantilla de Página</h1>
            <p className="text-gray-600">Modifica la configuración de la plantilla: {template.name}</p>
          </div>
          <div className="flex gap-2">
            <span className={`text-xs px-2 py-1 rounded ${getPageTypeColor(template.page_type)}`}>
              {getPageTypeText(template.page_type)}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {template.is_active ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Templates */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Plantillas Disponibles</CardTitle>
                    <CardDescription>
                      Reemplazar configuración con una plantilla del sistema
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAvailableTemplates(!showAvailableTemplates)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {showAvailableTemplates ? "Ocultar" : "Mostrar"} Plantillas
                  </Button>
                </div>
              </CardHeader>
              {showAvailableTemplates && (
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {availableTemplates.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No hay plantillas disponibles
                      </div>
                    ) : (
                      availableTemplates.map((availableTemplate) => (
                        <div
                          key={availableTemplate.filename}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleSelectAvailableTemplate(availableTemplate)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium">{availableTemplate.name}</div>
                              <div className="text-sm text-gray-600">{availableTemplate.description}</div>
                              <div className="flex gap-2 mt-2">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {availableTemplate.category}
                                </span>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {availableTemplate.page_type}
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                  {availableTemplate.filename}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {availableTemplate.required_slots.text_slots.length} textos,
                              {availableTemplate.required_slots.photo_slots.length} fotos,
                              {availableTemplate.required_slots.message_slots.length} mensajes
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Basic Info */}
            <div className="space-y-6">
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
                      placeholder="Ej: Portada Elegante"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="key">Clave *</Label>
                    <Input
                      id="key"
                      value={formData.key}
                      onChange={(e) => handleInputChange('key', e.target.value)}
                      placeholder="ej: portada-elegante"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Identificador único (sin espacios, usa guiones)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="page_type">Tipo de Página *</Label>
                    <Select
                      value={formData.page_type}
                      onValueChange={(value) => handleInputChange('page_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe el estilo o uso de esta plantilla..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Template Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="html_template_name">Template HTML *</Label>
                    <Input
                      id="html_template_name"
                      value={formData.html_template_name}
                      onChange={(e) => handleInputChange('html_template_name', e.target.value)}
                      placeholder="ej: cover_elegant.html"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Nombre del archivo HTML en el sistema de templates
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="default_background">Fondo por Defecto</Label>
                    <Select
                      value={formData.default_background?.toString() || "none"}
                      onValueChange={(value) => handleInputChange('default_background', value === "none" ? undefined : parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar fondo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin fondo por defecto</SelectItem>
                        {backgrounds.map((background) => (
                          <SelectItem key={background.id} value={background.id.toString()}>
                            {background.name}
                          </SelectItem>
                        ))}
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
            </div>

            {/* Advanced Configuration */}
            <div className="space-y-6">
              {/* Required Slots */}
              <Card>
                <CardHeader>
                  <CardTitle>Slots Requeridos</CardTitle>
                  <CardDescription>
                    Define los campos que esta plantilla necesita para funcionar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {Object.entries(formData.required_slots || {}).map(([slotName, slotConfig]) => (
                      <div key={slotName} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-medium text-lg">{slotName}</div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequiredSlotsChange('remove', slotName)}
                          >
                            Eliminar
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`${slotName}-label`}>Label</Label>
                            <Input
                              id={`${slotName}-label`}
                              value={slotConfig.label || ''}
                              onChange={(e) => updateSlotConfig(slotName, 'label', e.target.value)}
                              placeholder="Etiqueta descriptiva"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`${slotName}-type`}>Tipo</Label>
                            <Select
                              value={slotConfig.type || 'text'}
                              onValueChange={(value) => updateSlotConfig(slotName, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Texto</SelectItem>
                                <SelectItem value="image">Imagen</SelectItem>
                                <SelectItem value="message">Mensaje</SelectItem>
                                <SelectItem value="number">Número</SelectItem>
                                <SelectItem value="date">Fecha</SelectItem>
                                <SelectItem value="boolean">Booleano</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor={`${slotName}-default`}>Valor por Defecto</Label>
                            <Input
                              id={`${slotName}-default`}
                              value={slotConfig.default || ''}
                              onChange={(e) => updateSlotConfig(slotName, 'default', e.target.value)}
                              placeholder="Valor por defecto (opcional)"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-6">
                            <Switch
                              id={`${slotName}-required`}
                              checked={slotConfig.required || false}
                              onCheckedChange={(checked) => updateSlotConfig(slotName, 'required', checked)}
                            />
                            <Label htmlFor={`${slotName}-required`}>Requerido</Label>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-sm text-gray-600">
                          <strong>Configuración actual:</strong> {JSON.stringify(slotConfig, null, 2)}
                        </div>
                      </div>
                    ))}
                    
                    {Object.keys(formData.required_slots || {}).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No hay slots configurados
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addNewSlot}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Slot
                  </Button>
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
                      <Label htmlFor="is_active">Activa</Label>
                      <p className="text-sm text-gray-600">
                        La plantilla estará disponible para usar
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Settings Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Vista Previa de Configuración</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify({
                        name: formData.name,
                        key: formData.key,
                        page_type: formData.page_type,
                        html_template_name: formData.html_template_name,
                        required_slots: formData.required_slots,
                        settings: formData.settings,
                        is_active: formData.is_active,
                        sort_order: formData.sort_order
                      }, null, 2)}
                    </pre>
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
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Actualizando..." : "Actualizar Plantilla"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
