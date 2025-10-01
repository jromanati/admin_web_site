"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, Plus, Edit, Trash2, Building, Search, MapPin, LayoutGrid, List, 
  Eye, EyeClosed, EyeOff
} from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import type { Property } from "@/types/properties/properties"
import { PropertiesService } from "@/services/properties/properties.service"
import { AuthService } from "@/services/auth.service"
import useSWR, { mutate } from "swr"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


const mockProperties: Property[] = [
  {
    id: "1",
    address: "Av. Principal 123, Zona Norte",
    type: "casa",
    price: 350000,
    area: 180,
    bedrooms: 3,
    bathrooms: 2,
    status: "available",
    description: "Hermosa casa en zona residencial con jardín",
    features: ["Jardín", "Garaje", "Piscina"],
    listingType: "sale",
  },
  {
    id: "2",
    address: "Centro Comercial 456, Centro",
    type: "local",
    price: 2500,
    area: 85,
    status: "rented",
    description: "Local comercial en zona de alto tráfico",
    features: ["Vitrina", "Baño", "Depósito"],
    listingType: "rent",
  },
  {
    id: "3",
    address: "Residencial Norte 789, Zona Norte",
    type: "apartamento",
    price: 180000,
    area: 95,
    bedrooms: 2,
    bathrooms: 1,
    status: "sold",
    description: "Apartamento moderno con vista panorámica",
    features: ["Balcón", "Ascensor", "Seguridad"],
    listingType: "sale",
  },
  {
    id: "4",
    address: "Plaza Central 321, Centro",
    type: "oficina",
    price: 1800,
    area: 120,
    bathrooms: 2,
    status: "available",
    description: "Oficina ejecutiva en edificio corporativo",
    features: ["Aire acondicionado", "Internet", "Recepción"],
    listingType: "rent",
  },
]

interface PropertiesManagerProps {
  siteId: string
}

export function PropertiesManager({ siteId }: PropertiesManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
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
  const fetchedProperties = async () => {
      const isValid = AuthService.isTokenValid()
      if (!isValid) {
        const isRefreshValid = await AuthService.isRefreshTokenValid()
        if (!isRefreshValid)window.location.href = "/"
      }
      const propertiesResponse = await PropertiesService.getProperties()
      const fetchedProperties = propertiesResponse || []
      return fetchedProperties.map((feature: any) => ({
        ...feature,
      }))
  }
  const { data: properties = [], isLoading } = useSWR('properties', fetchedProperties)
  // const [properties, setProperties] = useState<Property[]>(mockProperties)
  const router = useRouter()
  const handleClick = () => {
    // ... lógica previa si la necesitas
    router.push("/dashboard/properties/properties/create")
  }
  

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || property.property_type === filterType
    const matchesStatus = filterStatus === "all" || property.property_state === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage)

  const handleFilterChange = (filterFn: () => void) => {
    filterFn()
    setCurrentPage(1)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Disponible":
        return <Badge variant="default">Disponible</Badge>
      case "Vendida":
        return <Badge variant="secondary">Vendida</Badge>
      case "Arrendada":
        return <Badge variant="outline">Arrendada</Badge>
      case "Reservada":
        return <Badge variant="destructive">Reservada</Badge>
      case "NO_DISPONIBLE":
        return <Badge variant="destructive">No disponible</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    const types = {
      casa: "Casa",
      apartamento: "Apartamento",
      local: "Local",
      oficina: "Oficina",
      terreno: "Terreno",
    }
    return types[type as keyof typeof types] || type
  }

  const handleDeleteProperty = (property: Property) => {
    setPropertyToDelete(property)
  }
  
  const deleteProperty = async (propertyId: number) => {
    const response = await PropertiesService.deleteProperty(propertyId)

    if (response.success) {
      mutate('properties', (current: Property[] = []) => {
        const updated = current.filter(property => property.id !== Number(propertyId))
        localStorage.setItem("properties", JSON.stringify(updated))
        return updated
      }, false)
    }
  }

  const changePublishedProperty = async (propertyId: number) => {
    const response = await PropertiesService.changePublishedProperty(propertyId)

    if (response?.success && response.data) {
      const updatedProperty: Property = response.data

      mutate(
        "properties",
        (current: Property[] | undefined) => {
          // Toma el listado actual de SWR o, si no existe, desde localStorage
          const list: Property[] =
            current ??
            (JSON.parse(localStorage.getItem("properties") || "[]") as Property[])

          const idx = list.findIndex((p) => p.id === Number(updatedProperty.id))

          let updated: Property[]
          if (idx >= 0) {
            // Reemplaza manteniendo el orden (merge por seguridad)
            updated = [...list]
            updated[idx] = { ...list[idx], ...updatedProperty }
          } else {
            // Si no estaba, lo insertamos al inicio (o al final según tu UX)
            updated = [updatedProperty, ...list]
          }

          localStorage.setItem("properties", JSON.stringify(updated))
          return updated
        },
        false // sin revalidar ahora
      )

      // (Opcional) si tienes un cache por propiedad, sincronízalo también:
      // mutate(["property", propertyId], updatedProperty, false)
    }
  }

  const confirmDeleteUser = () => {
    if (propertyToDelete) {
      setPropertyToDelete(null)
      deleteProperty(propertyToDelete.id)
    }
  }

  type Currency = "CLP" | "USD" | "UF"

  /** Convierte a número detectando correctamente el separador decimal:
   * - "2000000.00"  -> 2000000   (punto decimal)
   * - "1.234,56"    -> 1234.56   (formato chileno)
   * - "15,5" / "15.5" -> 15.5
   */
  const toNumberSmart = (v: number | string, currency: Currency) => {
    if (typeof v === "number") return v
    const s = String(v || "").trim()
    if (!s) return 0

    // Caso: solo punto y actúa como decimal (p. ej. "2000000.00", "15.5")
    const isDotDecimal = !s.includes(",") && /^\d+\.\d{1,6}$/.test(s)
    if (isDotDecimal) return Number(s)

    // Regla chilena: "." miles, "," decimal
    const normalized = s.replace(/\./g, "").replace(",", ".")
    const n = Number(normalized)
    return Number.isFinite(n) ? n : 0
  }

  /** Cuenta los decimales del valor de entrada para respetarlos en la salida (máx 2) */
  const countInputDecimals = (v: number | string) => {
    if (typeof v === "number") {
      const s = String(v)
      const i = s.indexOf(".")
      return i === -1 ? 0 : Math.min(2, s.length - i - 1)
    }
    const s = String(v)
    // "2000000.00" → 2 ; "15.5" → 1
    if (!s.includes(",") && /^\d+\.\d{1,6}$/.test(s)) return Math.min(s.split(".")[1].length, 2)
    // "1.234,56" → 2 ; "15,5" → 1
    return Math.min((s.split(",")[1]?.length ?? 0), 2)
  }
  const formatPrice = (
    value: number | string,
    currency: Currency = "CLP",
    opts: {
      decimals?: number | "auto"
      showCode?: boolean
      codePosition?: "prefix" | "suffix"
      inputMinorUnitFactor?: number
    } = {}
  ) => {
    const {
      decimals = "auto",
      showCode = true,
      codePosition = "prefix",
      inputMinorUnitFactor,
    } = opts

    let nRaw = toNumberSmart(value, currency)

    // 🔎 Corrección automática común: CLP en centavos (x100)
    // Si no especificaste inputMinorUnitFactor, intentamos detectar el caso típico:
    // entero grande, divisible por 100, sin separadores en el string de origen,
    // y en un rango razonable (>= 100.000.000).
    if (currency === "CLP") {
      const s = typeof value === "string" ? value.trim() : ""
      const looksPlainIntegerString = s && /^[0-9]+$/.test(s)
      const autoLooksLikeCents =
        inputMinorUnitFactor == null &&
        Number.isInteger(nRaw) &&
        nRaw % 100 === 0 &&
        nRaw >= 100_000_000 && // 100 millones
        (looksPlainIntegerString || typeof value === "number")

      const factor = inputMinorUnitFactor ?? (autoLooksLikeCents ? 100 : 1)
      if (factor !== 1) nRaw = nRaw / factor
    }

    const decs = decimals === "auto" ? countInputDecimals(value) : decimals

    if (currency === "UF") {
      const nf = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLF",
        currencyDisplay: "code",
        minimumFractionDigits: decs,
        maximumFractionDigits: decs,
      })
      const parts = nf.formatToParts(nRaw)
      const numberOnly = parts
        .filter((p) => p.type !== "currency")
        .map((p) => p.value)
        .join("")
        .trim()

      if (!showCode) return numberOnly
      return codePosition === "suffix" ? `${numberOnly} UF` : `UF ${numberOnly}`
    }

    // CLP / USD
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency,
      minimumFractionDigits: decs,
      maximumFractionDigits: decs,
    }).format(nRaw)
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
          {/* Header */}
          <div className={`border-b border-border ${secondBackgroundColor} ${principalText}`}>
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:h-16 sm:items-center sm:justify-between py-3 sm:py-0">
                <div className="flex items-start sm:items-center gap-1">
                  <div>
                    <h1 className="text-lg sm:text-xl font-semibold">Gestión de Propiedades</h1>
                    <p className="text-xs sm:text-sm opacity-90">Administra tu portafolio inmobiliario</p>
                  </div>
                </div>

                <Button
                  className="w-full sm:w-auto"
                  onClick={handleClick}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Propiedad
                </Button>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Filters and View Toggle */}
            <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-center sm:justify-between mb-6">
              {/* Filtros */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-4">
                <div className="relative w-full sm:w-64 lg:w-80">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar propiedades..."
                    value={searchTerm}
                    onChange={(e) => handleFilterChange(() => setSearchTerm(e.target.value))}
                    className="pl-10 w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full sm:w-auto">
                  <select
                    value={filterType}
                    onChange={(e) => handleFilterChange(() => setFilterType(e.target.value))}
                    className="p-2 border border-border rounded-md bg-background min-w-[160px]"
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="Casa">Casa</option>
                    <option value="Departamento">Departamento</option>
                    <option value="Parcela">Parcela</option>
                    <option value="Comercial">Local</option>
                    <option value="Oficina">Oficina</option>
                    <option value="Terreno">Terreno</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange(() => setFilterStatus(e.target.value))}
                    className="p-2 border border-border rounded-md bg-background min-w-[160px]"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="Disponible">Disponible</option>
                    <option value="Vendida">Vendida</option>
                    <option value="Arrendada">Arrendada</option>
                    <option value="Reservada">Reservada</option>
                    <option value="NO_DISPONIBLE">No disponible</option>
                  </select>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="flex-1 sm:flex-none"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex-1 sm:flex-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results Info */}
            <div className="mb-4 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProperties.length)} de{" "}
              {filteredProperties.length} propiedades
            </div>

            {/* Properties Display */}
            {viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedProperties.map((property) => (
                  <Card className="bg-white" key={property.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                            <Building className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {getTypeLabel(property.property_type)}
                            </CardTitle>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {property.address}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              (window.location.href = `/dashboard/properties/properties/edit/${property.id}`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" size="sm"
                            onClick={() => changePublishedProperty(property.id)}
                            title="Activar/Desactivar" aria-label="Activar/Desactivar"
                          >
                            {property.published ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" size="sm" onClick={() => handleDeleteProperty(property)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription 
                      // className="mb-3"
                      className="text-gray-600 mb-3 text-sm leading-relaxed min-h-[2.5rem] line-clamp-2 flex-grow"
                      >
                        {property.description}
                      </CardDescription>
                      <div className="space-y-2">
                        {property.price && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Precio:</span>
                            <span className="font-semibold">
                              {formatPrice(property.price ?? 0, (property.currency as Currency) || "CLP")}
                              {property.listingType === "rent" && "/mes"}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Área:</span>
                          <span>{property.built_area} m²</span>
                        </div>
                        {property.bedrooms && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Dormitorios:</span>
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Baños:</span>
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Estado:</span>
                          {getStatusBadge(property.property_state)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedProperties.map((property) => (
                  <Card key={property.id}>
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="h-14 w-14 sm:h-16 sm:w-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-base sm:text-lg font-semibold">
                                {getTypeLabel(property.property_type)}
                              </h3>
                              {getStatusBadge(property.property_state)}
                            </div>
                            <div className="flex items-center text-muted-foreground mb-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="truncate">{property.address}</span>
                            </div>
                            <p className="text-gray-600 mb-3 text-sm leading-relaxed min-h-[2.5rem] line-clamp-2 flex-grow">
                              {property.description}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
                              {property.price && (
                              <div>
                                <span className="text-muted-foreground">Precio:</span>
                                <div className="font-semibold">
                                  {formatPrice(property.price ?? 0, (property.currency as Currency) || "CLP")}
                                  {property.listingType === "rent" && "/mes"}
                                </div>
                              </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Área:</span>
                                <div>{property.area} m²</div>
                              </div>
                              {property.bedrooms && (
                                <div>
                                  <span className="text-muted-foreground">Dormitorios:</span>
                                  <div>{property.bedrooms}</div>
                                </div>
                              )}
                              {property.bathrooms && (
                                <div>
                                  <span className="text-muted-foreground">Baños:</span>
                                  <div>{property.bathrooms}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Acciones (caen abajo en mobile) */}
                        <div className="flex space-x-1 sm:ml-4 order-first sm:order-last justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              (window.location.href = `/dashboard/properties/properties/edit/${property.id}`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteProperty(property.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent className="flex flex-wrap gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
          {/* Dialog de confirmación para eliminar */}
          <Dialog open={!!propertyToDelete} onOpenChange={() => setPropertyToDelete(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Confirmar Eliminación
                </DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar la propiedad: "{propertyToDelete?.title}"?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Advertencia:</strong> Esta acción eliminará permanentemente
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPropertyToDelete(null)}
                className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                >
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={confirmDeleteUser}
                className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                >
                  Eliminar Propiedad
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}
