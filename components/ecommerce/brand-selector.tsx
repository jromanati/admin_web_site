"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import type { Brand } from "@/types/ecomerces/brands"
import { BrandsService } from "@/services/ecomerce/brands/brands.service"
import { AuthService } from "@/services/auth.service"
import useSWR, { mutate } from "swr"

interface BrandSelectorProps {
  selectedBrand?: Brand
  onBrandSelect: (brand: Brand | undefined) => void
}

// Mock brands data - en una app real, esto vendría de la API
const mockBrands: Brand[] = [
  {
    id: "1",
    name: "Nike",
    logo_url: "/nike-swoosh.png",
    is_active: true,
  },
  {
    id: "2",
    name: "Adidas",
    logo_url: "/adidas-logo.png",
    is_active: true,
  },
  {
    id: "3",
    name: "Puma",
    logo_url: "/leaping-cat-logo.png",
    is_active: true,
  },
  {
    id: "4",
    name: "Under Armour",
    logo_url: "/under-armour-logo.png",
    is_active: true,
  },
  {
    id: "5",
    name: "Reebok",
    logo_url: "/reebok-logo.jpg",
    is_active: true,
  },
]

export function BrandSelector({ selectedBrand, onBrandSelect }: BrandSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
  const [placeholderStyle, setPlaceholderStyle] = useState("")
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
        setPlaceholderStyle(tenant_data.styles_site.placeholder)
      }
  }, [])

  const fetchedBrands = async () => {
      const isValid = AuthService.isTokenValid()
      if (!isValid) {
        const isRefreshValid = await AuthService.isRefreshTokenValid()
        if (!isRefreshValid)window.location.href = "/"
      }
      const featuresResponse = await BrandsService.getBrands()
      const fetchedFeatures = featuresResponse || []
      // setisLoading(false);
      return fetchedFeatures.map((feature: any) => ({
        ...feature,
      }))
  }
  const { data: mockBrands = [] } = useSWR('brands', fetchedBrands)

  const filteredBrands = mockBrands.filter(
    (brand) => brand.is_active && brand.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleBrandSelect = (brand: Brand) => {
    onBrandSelect(brand)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleClearSelection = () => {
    onBrandSelect(undefined)
  }

  return (
    <div className="space-y-4">
      {/* Selected Brand Display */}
      {selectedBrand ? (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center space-x-3">
            {selectedBrand.logo_url && (
              <img
                src={selectedBrand.logo_url || "/placeholder.svg"}
                alt={selectedBrand.name}
                className="h-8 w-8 object-contain rounded"
              />
            )}
            <div>
              <p className="font-medium">{selectedBrand.name}</p>
              <p className="text-sm ">Marca seleccionada</p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleClearSelection}
          className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
          >
            <X className="h-4 w-4 mr-2" />
            Quitar
          </Button>
        </div>
      ) : (
        <div className="text-center py-4 ">
          <p>No hay marca seleccionada</p>
          <p className="text-sm">Busca y selecciona una marca para el producto</p>
        </div>
      )}

      {/* Brand Search and Selection */}
      <Card className={`${secondBackgroundColor} ${principalText} `}>
        <CardHeader>
          <CardTitle className="text-base">Seleccionar Marca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar marcas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 ${placeholderStyle}`}
            />
          </div>

          {/* Brands Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {filteredBrands.length > 0 ? (
              filteredBrands.map((brand) => (
                <Button
                  key={brand.id}
                  type="button"
                  variant="outline"
                  // className={`h-auto p-3 justify-start ${selectedBrand?.id === brand.id ? "ring-2 ring-primary" : ""}`}
                  onClick={() => handleBrandSelect(brand)}
                  className={`
                    h-auto p-3 justify-start ${selectedBrand?.id === brand.id ? "ring-2 ring-primary" : ""}
                    ${secondBackgroundColor} ${principalText} ${principalHoverBackground}`
                  }
                >
                  <div className="flex items-center space-x-3 w-full">
                    {brand.logo_url && (
                      <img
                        src={brand.logo_url || "/placeholder.svg"}
                        alt={brand.name}
                        className="h-8 w-8 object-contain rounded flex-shrink-0"
                      />
                    )}
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium truncate">{brand.name}</p>
                      {selectedBrand?.id === brand.id && (
                        <Badge variant="default" className="text-xs mt-1">
                          Seleccionada
                        </Badge>
                      )}
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <div className="col-span-full text-center py-8 ">
                <p>No se encontraron marcas</p>
                {searchTerm && <p className="text-sm">Intenta con un término de búsqueda diferente</p>}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex justify-between items-center pt-2 border-t">
            <p className="text-sm ">
              {filteredBrands.length} marca{filteredBrands.length !== 1 ? "s" : ""} disponible
              {filteredBrands.length !== 1 ? "s" : ""}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => setSearchTerm("")}
            className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
            >
              Limpiar búsqueda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
