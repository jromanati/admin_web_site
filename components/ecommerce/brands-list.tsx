"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin-layout"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Globe,
  Mail,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Filter,
} from "lucide-react"
import type { Brand } from "@/types/ecomerces/brands"
import { BrandsService } from "@/services/ecomerce/brands/brands.service"
import { AuthService } from "@/services/auth.service"
import useSWR, { mutate } from "swr"
import { useRouter } from "next/navigation"

interface BrandsListProps {
  siteId: string
}

// Mock data for brands
const mockBrands2 = [
  {
    id: "1",
    name: "Nike",
    slug: "nike",
    description: "Just Do It - Marca líder en ropa deportiva y calzado",
    country: "Estados Unidos",
    website: "https://nike.com",
    email: "contact@nike.com",
    logo_url: "/nike-swoosh.png",
    cover_url: "/nike-cover.png",
    is_active: true,
    created_at: "2024-01-15",
    social_links: [
      { platform: "facebook", url: "https://facebook.com/nike" },
      { platform: "instagram", url: "https://instagram.com/nike" },
      { platform: "twitter", url: "https://twitter.com/nike" },
    ],
  },
  {
    id: "2",
    name: "Adidas",
    slug: "adidas",
    description: "Impossible is Nothing - Innovación en deportes",
    country: "Alemania",
    website: "https://adidas.com",
    email: "info@adidas.com",
    logo_url: "/adidas-logo.png",
    cover_url: "/adidas-cover.png",
    is_active: true,
    created_at: "2024-01-10",
    social_links: [
      { platform: "facebook", url: "https://facebook.com/adidas" },
      { platform: "instagram", url: "https://instagram.com/adidas" },
      { platform: "youtube", url: "https://youtube.com/adidas" },
    ],
  },
]

const getSocialIcon = (platform: string) => {
  switch (platform) {
    case "facebook":
      return <Facebook className="h-4 w-4" />
    case "twitter":
      return <Twitter className="h-4 w-4" />
    case "instagram":
      return <Instagram className="h-4 w-4" />
    case "linkedin":
      return <Linkedin className="h-4 w-4" />
    case "youtube":
      return <Youtube className="h-4 w-4" />
    default:
      return <ExternalLink className="h-4 w-4" />
  }
}

export function BrandsList({ siteId }: BrandsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
  const [isLoading, setisLoading] = useState(true)
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

  const fetchedBrands = async () => {
      const isValid = AuthService.isTokenValid()
      if (!isValid) {
        const isRefreshValid = await AuthService.isRefreshTokenValid()
        if (!isRefreshValid)window.location.href = "/"
      }
      const featuresResponse = await BrandsService.getBrands()
      const fetchedFeatures = featuresResponse || []
      setisLoading(false);
      return fetchedFeatures.map((feature: any) => ({
        ...feature,
      }))
  }
  const { data: mockBrands = [] } = useSWR('brands', fetchedBrands)

  const filteredBrands = mockBrands.filter((brand) => {
    const matchesSearch =
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && brand.is_active) ||
      (statusFilter === "inactive" && !brand.is_active)
    const matchesCountry = countryFilter === "all" || brand.country === countryFilter

    return matchesSearch && matchesStatus && matchesCountry
  })

  const countries = Array.from(new Set(mockBrands.map((brand) => brand.country)))
  const router = useRouter()
  const handleClick = (route) => {
    setisLoading(true);
    router.push(route)
  }
  

  return (
    <AdminLayout
      siteType="ecommerce"
      siteId={siteId}
      siteName="Tienda Fashion"
      currentPath={`/dashboard/ecommerce/brands`}
    >
      {isLoading ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F2CFCE]/30 border-t-[#F2CFCE]" />
            <p className="text-sm text-muted-foreground">Cargando…</p>
          </div>
        </div>
      ) : (
      <div>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:h-16 sm:items-center sm:justify-between py-3 sm:py-0">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestión de Marcas</h1>
                <p className="text-muted-foreground">Administra las marcas de productos en tu tienda</p>
              </div>
              <Button 
                onClick={() => (handleClick("/dashboard/ecommerce/brands/create"))}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Marca
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar marcas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="inactive">Inactivas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los países</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card className={`border-b border-border ${secondBackgroundColor} ${principalText}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Marcas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockBrands.length}</div>
              </CardContent>
            </Card>
            <Card className={`border-b border-border ${secondBackgroundColor} ${principalText}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium ">Marcas Activas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{mockBrands.filter((b) => b.is_active).length}</div>
              </CardContent>
            </Card>
            <Card className={`border-b border-border ${secondBackgroundColor} ${principalText}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium ">Países</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{countries.length}</div>
              </CardContent>
            </Card>
            <Card className={`border-b border-border ${secondBackgroundColor} ${principalText}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium ">Con Redes Sociales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockBrands.filter((b) => b.social_links.length > 0).length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Brands Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBrands.map((brand) => (
              <Card key={brand.id} className={`overflow-hidden ${secondBackgroundColor} ${principalText}`}>
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  {brand.logo_url && (
                    <img
                      src={brand.logo_url || "/placeholder.svg"}
                      alt={`${brand.name} cover`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={brand.is_active ? "default" : "secondary"}>
                      {brand.is_active ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {/* Logo */}
                    <div className="h-12 w-12 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url || "/placeholder.svg"}
                          alt={`${brand.name} logo`}
                          className="h-8 w-8 object-contain"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gray-200 rounded" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{brand.name}</CardTitle>
                      <p className="text-sm ">{brand.country}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription 
                    className={`mb-4 line-clamp-2 ${secondBackgroundColor} ${principalText}`}
                  >
                    {brand.description}
                  </CardDescription>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {brand.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4" />
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary truncate"
                        >
                          {brand.website.replace("https://", "")}
                        </a>
                      </div>
                    )}
                    {brand.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{brand.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  {brand.social_links.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs">Redes Sociales:</p>
                      <div className="flex gap-2">
                        {brand.social_links.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-lg transition-colors ${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                          >
                            {getSocialIcon(link.platform)}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => (handleClick( `/dashboard/ecommerce/brands/${brand.id}`))}
                      className={`flex-1 ${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm"
                    className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-3 pt-3 border-t text-xs">
                    Creada: {new Date(brand.created_at).toLocaleDateString("es-ES")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBrands.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">No se encontraron marcas que coincidan con los filtros</div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setCountryFilter("all")
                }}
                className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    )}
    </AdminLayout>
  )
}
