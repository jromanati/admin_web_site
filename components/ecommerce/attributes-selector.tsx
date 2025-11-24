"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Check, Plus } from "lucide-react"
import type {Feature} from "@/types/ecomerces/features"
import { FeaturesService } from "@/services/ecomerce/features/features.service"
import { AuthService } from "@/services/auth.service"
import useSWR, { mutate } from "swr"

const mockAttributes2 = [
  {
    id: "colors",
    name: "Colores",
    feature_detail: [
      { id: "white", name: "Blanco", color: "#FFFFFF" },
      { id: "black", name: "Negro", color: "#000000" },
      { id: "red", name: "Rojo", color: "#EF4444" },
      { id: "green", name: "Verde", color: "#10B981" },
      { id: "blue", name: "Azul", color: "#3B82F6" },
      { id: "yellow", name: "Amarillo", color: "#F59E0B" },
      { id: "purple", name: "Morado", color: "#8B5CF6" },
    ],
  },
  {
    id: "sizes",
    name: "Tallas",
    feature_detail: [
      { id: "xs", name: "XS" },
      { id: "s", name: "S" },
      { id: "m", name: "M" },
      { id: "l", name: "L" },
      { id: "xl", name: "XL" },
      { id: "xxl", name: "XXL" },
    ],
  },
  {
    id: "material",
    name: "Material",
    feature_detail: [
      { id: "cotton", name: "Algodón" },
      { id: "polyester", name: "Poliéster" },
      { id: "wool", name: "Lana" },
      { id: "silk", name: "Seda" },
      { id: "linen", name: "Lino" },
    ],
  },
]

interface AttributesSelectorProps {
  selectedAttributes: { [key: string]: string[] }
  onAttributesChange: (attributes: { [key: string]: string[] }) => void
}

export function AttributesSelector({ selectedAttributes, onAttributesChange }: AttributesSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAttributeForModal, setSelectedAttributeForModal] = useState<string | null>(null)
  const [tempSelectedValues, setTempSelectedValues] = useState<string[]>([])
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
  const [placeholderStyle, setPlaceholderStyle] = useState("")
  const [backgroundColor, setBackgroundColor] = useState("")
  useEffect(() => {
      const rawUserData = localStorage.getItem("user_data")
      const rawClientData = localStorage.getItem("tenant_data")
      const tenant_data = rawUserData ? JSON.parse(rawClientData) : null
      if (tenant_data.styles_site){
        setBackgroundColor(tenant_data.styles_site.background_color)
        setSecondBackgroundColor(tenant_data.styles_site.second_background_color)
        setPrincipalText(tenant_data.styles_site.principal_text)
        setPrincipalHoverBackground(tenant_data.styles_site.principal_hover_background)
        setSecondHoverBackground(tenant_data.styles_site.second_hover_background)
        setPrincipalHoverText(tenant_data.styles_site.principal_hover_text)
        setPlaceholderStyle(tenant_data.styles_site.placeholder)
      }
  }, [])

  // const [mockAttributes, setCachedCategories] = useState<Feature[]>([])
  const fetchedFeatures = async () => {
      const isValid = AuthService.isTokenValid()
      if (!isValid) {
        const isRefreshValid = await AuthService.isRefreshTokenValid()
        if (!isRefreshValid)window.location.href = "/"
      }
      const featuresResponse = await FeaturesService.getFeatures()
      const fetchedFeatures = featuresResponse || []
      return fetchedFeatures.map((feature: any) => ({
        ...feature,
      }))
  }
  const { data: mockAttributes = [] } = useSWR('features', fetchedFeatures)

  const handleAttributeClick = (attributeId: string) => {
    const currentValues = selectedAttributes[attributeId] || []
    setSelectedAttributeForModal(attributeId)
    setTempSelectedValues(currentValues)
    setIsModalOpen(true)
  }

  const handleSelectAll = () => {
    if (!selectedAttributeForModal) return
    const attribute = mockAttributes.find((attr) => attr.id === selectedAttributeForModal)
    if (attribute) {
      setTempSelectedValues(attribute.feature_detail.map((v) => v.id))
    }
  }

  const handleDeselectAll = () => {
    setTempSelectedValues([])
  }

  const toggleValue = (valueId: string) => {
    setTempSelectedValues((prev) => (prev.includes(valueId) ? prev.filter((id) => id !== valueId) : [...prev, valueId]))
  }

  const handleConfirmSelection = () => {
    if (!selectedAttributeForModal) return

    if (tempSelectedValues.length > 0) {
      onAttributesChange({
        ...selectedAttributes,
        [selectedAttributeForModal]: tempSelectedValues,
      })
    } else {
      // Remove attribute if no values selected
      const newSelectedAttributes = { ...selectedAttributes }
      delete newSelectedAttributes[selectedAttributeForModal]
      onAttributesChange(newSelectedAttributes)
    }

    setIsModalOpen(false)
    setSelectedAttributeForModal(null)
    setTempSelectedValues([])
  }

  const handleRemoveAttribute = (attributeId: string) => {
    const newSelectedAttributes = { ...selectedAttributes }
    delete newSelectedAttributes[attributeId]
    onAttributesChange(newSelectedAttributes)
  }

  const getSelectedValuesDisplay = (attributeId: string) => {
    const selectedValues = selectedAttributes[attributeId] || []
    const attribute = mockAttributes.find((attr) => attr.id === attributeId)
    if (!attribute) return []

    return selectedValues
    .map((valueId) =>
      attribute.feature_detail.find((v) => v.id === Number(valueId))
    )
    .filter(Boolean)
  }

  const currentAttribute = selectedAttributeForModal
    ? mockAttributes.find((attr) => attr.id === selectedAttributeForModal)
    : null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Atributos del Producto</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockAttributes.map((attribute) => {
          const isSelected = selectedAttributes[attribute.id]
          const selectedValues = getSelectedValuesDisplay(attribute.id)

          return (
            <Card
              key={attribute.id}
              className={`
                cursor-pointer transition-all hover:shadow-md h-32 ${
                isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50"
              }
                ${secondBackgroundColor} ${principalText} ${principalHoverBackground}`
              }
              onClick={() => handleAttributeClick(attribute.id)}
            >
              <CardContent className="p-4 h-full flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm truncate">{attribute.name}</h4>
                  {isSelected ? (
                    <Check className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <Plus className="h-4 w-4 flex-shrink-0" />
                  )}
                </div>

                {isSelected && selectedValues.length > 0 ? (
                  <div className="flex-1 overflow-hidden">
                    <div className="flex flex-wrap gap-2">
                      {selectedValues.slice(0, 3).map((value) => (
                        <Badge key={value.id} variant="secondary" className="text-xs">
                          {value.name}
                        </Badge>
                      ))}
                      {selectedValues.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{selectedValues.length - 3}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs  mt-1">
                      {selectedValues.length} de {attribute.feature_detail.length} seleccionados
                    </p>
                  </div>
                ) : isSelected ? (
                  <p className="text-xs">Haz clic para seleccionar valores</p>
                ) : (
                  <p className="text-xs ">{attribute.feature_detail.length} valores disponibles</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seleccionar valores para {currentAttribute?.name}</DialogTitle>
          </DialogHeader>

          {currentAttribute && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={tempSelectedValues.length === currentAttribute.feature_detail.length}
                >
                  Seleccionar Todos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={tempSelectedValues.length === 0}
                >
                  Deseleccionar Todos
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {currentAttribute.feature_detail.map((value) => {
                  const isSelected = tempSelectedValues.includes(
                    value.id
                  )

                  return (
                    <div
                      key={value.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => toggleValue(value.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox checked={isSelected} readOnly />
                        {value.color && (
                          <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: value.color }} />
                        )}
                        <span className="text-sm font-medium">{value.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {tempSelectedValues.length} de {currentAttribute.feature_detail.length} seleccionados
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirmSelection}>Confirmar Selección</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
