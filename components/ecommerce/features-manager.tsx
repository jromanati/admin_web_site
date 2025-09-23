"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Plus, Edit, Trash2, Tag, X, Search, ChevronLeft, ChevronRight } from "lucide-react"
import type { Feature, FeatureDetail, FeatureResponse } from "@/types/ecomerces/features"
import { FeaturesService } from "@/services/ecomerce/features/features.service"
import { AuthService } from "@/services/auth.service"
import useSWR, { mutate } from "swr"


interface CategoriesManagerProps {
  siteId: string
}

export function FeaturesManager({ siteId }: CategoriesManagerProps) {
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
  useEffect(() => {
      const rawUserData = localStorage.getItem("user_data")
      const rawClientData = localStorage.getItem("tenant_data")
      const tenant_data = rawUserData ? JSON.parse(rawClientData) : null
      if (tenant_data.styles_site){
        setSecondBackgroundColor(tenant_data.styles_site.second_background_color)
        setPrincipalText(tenant_data.styles_site.principal_text)
        setPrincipalHoverBackground(tenant_data.styles_site.principal_hover_background)
        setSecondHoverBackground(tenant_data.styles_site.second_hover_background)
        setPrincipalHoverText(tenant_data.styles_site.principal_hover_text)
      }
  }, [])
  const fetchedFeatures = async () => {
      const isValid = AuthService.isTokenValid()
      if (!isValid) {
        const isRefreshValid = await AuthService.isRefreshTokenValid()
        if (!isRefreshValid)window.location.href = "/"
      }
      const featuresResponse = await FeaturesService.getFeatures()
      const fetchedFeatures = featuresResponse || []
      setisLoading(false);
      return fetchedFeatures.map((feature: any) => ({
        ...feature,
      }))
  }
  const { data: features = [] } = useSWR('features', fetchedFeatures)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null)
  const [isAddingValue, setIsAddingValue] = useState<string | null>(null)
  const [featureToDelete, setFeatureToDelete] = useState<FeatureResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [newValue, setNewValue] = useState({ value: "", hexColor: "" })
  const [isLoading, setisLoading] = useState(true)

  const filteredFeatures = useMemo(() => {
    return features.filter(
      (feature) =>
        feature.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [features, searchTerm])

  const paginatedFeatures = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredFeatures.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredFeatures, currentPage])

  const totalPages = Math.ceil(filteredFeatures.length / itemsPerPage)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleCreateFeature = async () => {
    const newFeature: Feature = {
      id: 0,
      name: formData.name,
      description: formData.description,
    }

    const response = await FeaturesService.createFeature(newFeature)

    if (response.success) {
      mutate('features', (current: Feature[] = []) => {
        const updated = [...current, response.data] // ejemplo crear
        localStorage.setItem("features", JSON.stringify(updated))
        return updated
      }, false)
    }
    setFormData({ name: "", description: ""})
    setIsCreateDialogOpen(false)
  }

  const handleAddValue = async (featureId: number) => {
    const newFeature: FeatureDetail = {
      id: featureId,
      name: newValue.value,
      feature: featureId,
    }

    const response = await FeaturesService.createFeatureDetail(newFeature)
    if (response.success) {
      const newDetail = response.data

      mutate('features', (current: FeatureResponse[] = []) => {
        const updated = current.map((feature) => {
          if (feature.id === featureId) {
            return {
              ...feature,
              feature_detail: [...feature.feature_detail, newDetail],
            }
          }
          return feature
        })

        localStorage.setItem("features", JSON.stringify(updated))
        return updated
      }, false)
    }

    setNewValue({ value: "", hexColor: "" })
    setIsAddingValue(null)
  }

  const handleRemoveValue = async (featureId: number, featureDetailId: number) => {
    const response = await FeaturesService.deleteFeatureDetail(featureDetailId)

    if (response.success) {
      mutate('features', (current: FeatureResponse[] = []) => {
        const updated = current.map((feature) => {
          if (feature.id === featureId) {
            return {
              ...feature,
              feature_detail: feature.feature_detail.filter((val) => val.id !== featureDetailId),
            }
          }
          return feature
        })

        localStorage.setItem("features", JSON.stringify(updated))
        return updated
      }, false)
    }
  }

  const handleEditFeature = (feature: Feature) => {
    setEditingFeature(feature)
    setFormData({
      name: feature.name,
      description: feature.description
    })
    setIsAddingValue(null)
  }

  const handleUpdateFeature = async () => {
    if (!editingFeature) return

    const updatedFeature: Feature = {
      ...editingFeature,
      name: formData.name,
      description: formData.description,
    }

    const response = await FeaturesService.updateFeature(updatedFeature, editingFeature.id)

    if (response.success) {
      mutate('features', (current: FeatureResponse[] = []) => {
        const updated = current.map(cat =>
          cat.id === editingFeature.id ? response.data : cat
        )
        localStorage.setItem("features", JSON.stringify(updated))
        return updated
      }, false)
    }
    

    setEditingFeature(null)
    setFormData({ name: "", description: ""})
  }

  const handleDeleteFeature = (feature: FeatureResponse) => {
    setFeatureToDelete(feature)
  }

  const deleteFeature = async (featureId: number) => {
    const response = await FeaturesService.deleteFeature(featureId)
    if (response.success) {
      mutate('features', (current: FeatureResponse[] = []) => {
        const updated = current.filter(cat => cat.id !== featureId)
        localStorage.setItem("features", JSON.stringify(updated))
        return updated
      }, false)
    }
  }

  const confirmdeleteFeature = () => {
    if (featureToDelete) {
      setFeatureToDelete(null)
      deleteFeature(featureToDelete.id)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {isLoading ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F2CFCE]/30 border-t-[#F2CFCE]" />
            <p className="text-sm text-muted-foreground">Cargando…</p>
          </div>
        </div>
      ) : (
        <div>
          <div className={`border-b border-border ${secondBackgroundColor} ${principalText}`}>
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:h-16 sm:items-center sm:justify-between py-3 sm:py-0">
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-xl font-semibold ">Gestión de Atributos</h1>
                    <p className="text-sm ">Gestiona colores, tallas y características de productos</p>
                  </div>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Atributo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Atributo</DialogTitle>
                      <DialogDescription>Agrega un nuevo atributo como colores, tallas, materiales, etc.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="name">Nombre del atributo</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Colores, Tallas, Material..."
                          />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descripción *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe este atributo..."
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}
                        className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                        >
                          Cancelar
                        </Button>
                        <Button 
                        onClick={handleCreateFeature} disabled={(!formData.name.trim() || !formData.description.trim())}
                        className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                        >
                          Crear Atributo
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 " />
                <Input
                  placeholder="Buscar atributos..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm ">
                  Mostrando {paginatedFeatures.length} de {filteredFeatures.length} atributos
                  {searchTerm && ` (filtrado de ${features.length} total)`}
                </p>
                {filteredFeatures.length > itemsPerPage && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <span className="text-sm ">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {paginatedFeatures.length === 0 ? (
                <Card className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}>
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center py-12">
                      {isLoading ? (
                        <div className="text-center">
                          <Tag className="h-12 w-12  mx-auto mb-4" />
                          <h3 className="text-lg font-medium  mb-2">
                            Cargando atributos...
                          </h3>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Tag className="h-12 w-12  mx-auto mb-4" />
                          <h3 className="text-lg font-medium  mb-2">
                            {searchTerm ? "No se encontraron atributos" : "No hay atributos creados"}
                          </h3>
                          <p className=" mb-4">
                            {searchTerm
                              ? `No hay atributos que coincidan con "${searchTerm}"`
                              : "Comienza creando tu primer atributo de producto"}
                          </p>
                          {searchTerm ? (
                            <Button variant="outline" onClick={() => handleSearchChange("")}>
                              Limpiar búsqueda
                            </Button>
                          ) : (
                            <Button onClick={() => setIsCreateDialogOpen(true)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Crear primer atributo
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                paginatedFeatures.map((feature) => (
                  <Card 
                  key={feature.id}
                  className={`${secondBackgroundColor} ${principalText}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                            <Tag className={`h-5 w-5 text-black`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{feature.name}</CardTitle>
                            <CardDescription
                            className={`${principalText}`}
                            >{feature.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={feature.status === "active" ? "default" : "secondary"}
                          className={`${principalText}`}
                          >
                            {feature.status === "active" ? "Activo" : "Inactivo"}
                          </Badge>
                          <Badge variant="outline" className={`${principalText}`}>{feature.feature_detail.length} valores</Badge>
                          <Button variant="ghost" size="sm" onClick={() => handleEditFeature(feature)}
                          className={`${principalHoverBackground}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteFeature(feature)}
                          className={`${principalHoverBackground}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Valores disponibles:</h4>
                          <Button variant="outline" size="sm" onClick={() => setIsAddingValue(feature.id)}
                          className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground} `}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar valor
                          </Button>
                        </div>

                        {/* Add new value form */}
                        {isAddingValue === feature.id && (
                          <div className="p-4 border border-border rounded-lg bg-muted/50">
                            <div className="flex items-end space-x-2">
                              <div className="flex-1">
                                <Label htmlFor="new-value" className="py-2">Nuevo valor</Label>
                                <Input
                                  id="new-value"
                                  value={newValue.value}
                                  onChange={(e) => setNewValue({ ...newValue, value: e.target.value })}
                                  placeholder="Nuevo valor"
                                />
                              </div>
                              <Button onClick={() => handleAddValue(feature.id)}>Agregar</Button>
                              <Button variant="outline" onClick={() => setIsAddingValue(null)}
                              className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Values grid */}
                        <div className="grid gap-2 md:grid-cols-4 lg:grid-cols-6"
                        >
                          {feature.feature_detail.map((value) => (
                            <div
                              key={value.id}
                              className={`
                                flex items-center justify-between p-2 border border-border rounded-lg
                                ${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{value.name}</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveValue(feature.id, value.id)} className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {feature.feature_detail.length === 0 && (
                          <p className="text-sm  text-center py-4">
                            No hay valores agregados. Haz clic en "Agregar valor" para comenzar.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingFeature} onOpenChange={() => setEditingFeature(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Atributo</DialogTitle>
                  <DialogDescription>Modifica los datos del atributo</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nombre del atributo</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Colores, Tallas, Material..."
                    />
                  </div>
                  <div className="space-y-2">
                        <Label htmlFor="description">Descripción *</Label>
                        <Textarea
                          id="edit-description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe este atributo..."
                          rows={3}
                        />
                      </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditingFeature(null)}
                    className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateFeature} disabled={(!formData.name.trim() || !formData.description.trim())}
                    className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                    >
                      Guardar Cambios
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!featureToDelete} onOpenChange={() => setFeatureToDelete(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar eliminación</DialogTitle>
                  <DialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente el atributo y todos sus valores.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm  mb-2">¿Estás seguro de que deseas eliminar el atributo:</p>
                  <p className="text-lg font-semibold ">"{featureToDelete?.name}"</p>
                  {featureToDelete && featureToDelete.feature_detail.length > 0 && (
                    <p className="text-sm  mt-2">
                      Este atributo tiene {featureToDelete.feature_detail.length} valores que también se eliminarán.
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setFeatureToDelete(null)}
                  className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                  >
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={confirmdeleteFeature}
                  className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                  >
                    Eliminar atributo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  )
}
