"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AdminLayout } from "@/components/admin-layout"
import { EventTablesService } from "@/services/eventhub/guests.service"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import type { CreateEventTableRequest, TableShape } from "@/types/eventhub/guests"

export default function CreateTablePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<CreateEventTableRequest>({
    name: "",
    number: undefined,
    capacity: 1,
    location_label: "",
    description: "",
    color: "#3B82F6",
    shape: "round",
    sort_order: 0,
    is_active: true,
    metadata: {}
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la mesa es obligatorio",
        variant: "destructive"
      })
      return
    }

    if (formData.capacity < 1) {
      toast({
        title: "Error", 
        description: "La capacidad debe ser al menos 1 persona",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await EventTablesService.createTable(formData)
      
      if (response.success === false) {
        throw new Error(response.error || "Error al crear mesa")
      }

      toast({
        title: "Éxito",
        description: "Mesa creada correctamente"
      })
      
      router.push("/dashboard/eventhub/tables")
    } catch (error) {
      console.error("Error creating table:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la mesa",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateEventTableRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getShapePreview = (shape: TableShape) => {
    switch (shape) {
      case "round": return "rounded-full"
      case "square": return "rounded-lg"
      case "rectangular": return "rounded-lg"
      default: return "rounded-lg"
    }
  }

  return (
    <AdminLayout siteType="eventhub" siteId="1" siteName="EventHub">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/eventhub/tables")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nueva Mesa</h1>
            <p className="text-gray-600">Agrega una nueva mesa al evento</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Mesa</CardTitle>
            <CardDescription>
              Completa los datos de la nueva mesa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre de la Mesa *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Ej: Mesa Principal"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="number">Número de Mesa</Label>
                    <Input
                      id="number"
                      type="number"
                      value={formData.number || ""}
                      onChange={(e) => handleInputChange("number", e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Ej: 1"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="capacity">Capacidad *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange("capacity", parseInt(e.target.value))}
                      placeholder="Ej: 8"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location_label">Ubicación</Label>
                    <Input
                      id="location_label"
                      value={formData.location_label || ""}
                      onChange={(e) => handleInputChange("location_label", e.target.value)}
                      placeholder="Ej: Salón Principal"
                    />
                  </div>
                </div>
              </div>

              {/* Configuración Visual */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configuración Visual</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="shape">Forma de la Mesa *</Label>
                    <Select
                      value={formData.shape}
                      onValueChange={(value) => handleInputChange("shape", value as TableShape)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round">Redonda</SelectItem>
                        <SelectItem value="square">Cuadrada</SelectItem>
                        <SelectItem value="rectangular">Rectangular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color || "#3B82F6"}
                        onChange={(e) => handleInputChange("color", e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.color || "#3B82F6"}
                        onChange={(e) => handleInputChange("color", e.target.value)}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="sort_order">Orden</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => handleInputChange("sort_order", parseInt(e.target.value))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Vista previa:</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-12 h-12 border-2 flex items-center justify-center ${getShapePreview(formData.shape)}`}
                      style={{ backgroundColor: formData.color + "20", borderColor: formData.color }}
                    >
                      <span className="text-xs font-bold" style={{ color: formData.color }}>
                        {formData.capacity}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{formData.name || "Nombre de la mesa"}</div>
                      <div className="text-sm text-gray-600">
                        {formData.capacity} personas • {formData.shape === "round" ? "Redonda" : formData.shape === "square" ? "Cuadrada" : "Rectangular"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Descripción</h3>
                <div>
                  <Label htmlFor="description">Descripción de la Mesa</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Ej: Mesa principal para los celebrantes y familiares cercanos..."
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
                  <Label htmlFor="is_active">Mesa activa</Label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/eventhub/tables")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Guardando..." : "Guardar Mesa"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
