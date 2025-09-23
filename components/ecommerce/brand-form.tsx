"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin-layout"
import { Plus, Trash2, Upload, Globe, Mail, Save, X } from "lucide-react"
import { useRouter } from "next/navigation"

// Plataformas de redes sociales basadas en el modelo Django
const SOCIAL_PLATFORMS = [
  { value: "website", label: "Website" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "x", label: "X (Twitter)" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "other", label: "Otro" },
]

interface BrandFormProps {
  siteId: string
  brandId?: string
  initialData?: any
}
import type { Brand } from "@/types/ecomerces/brands"
import { BrandsService } from "@/services/ecomerce/brands/brands.service"
import useSWR, { mutate } from "swr"

export function BrandForm({ siteId, brandId, initialData }: BrandFormProps) {
  const isEditing = !!brandId
  const [mainImage, setMainImage] = useState<File>()
  const [mainImageExist, setMainImageExist] = useState<string>("")
  const [deletedLogoImage, setDeletedLogoImage] = useState<boolean>(false)

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    country: initialData?.country || "",
    website: initialData?.website || "",
    email: initialData?.email || "",
    logo_url: initialData?.logo_url || "",
    cover_url: initialData?.cover_url || "",
    is_active: initialData?.is_active ?? true,
    social_links: initialData?.social_links || [],
  })
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
  const [placeholderStyle, setPlaceholderStyle] = useState("")
  const [isLoading, setisLoading] = useState(true)
  useEffect(() => {
        const rawUserData = localStorage.getItem("user_data")
        const rawClientData = localStorage.getItem("tenant_data")
        const tenant_data = rawUserData ? JSON.parse(rawClientData) : null
        setSecondBackgroundColor(tenant_data.styles_site.second_background_color)
        setPrincipalText(tenant_data.styles_site.principal_text)
        setPrincipalHoverBackground(tenant_data.styles_site.principal_hover_background)
        setSecondHoverBackground(tenant_data.styles_site.second_hover_background)
        setPrincipalHoverText(tenant_data.styles_site.principal_hover_text)
        setPlaceholderStyle(tenant_data.styles_site.placeholder)
        setisLoading(false);
    }, [])

  useEffect(() => {
    // Check if user is logged in and redirect to their specific dashboard
    const storedBrands = localStorage.getItem("brands")
    const parsedBrands: Brand[] = JSON.parse(storedBrands || "[]")
    const brand = parsedBrands.filter(brand => brand.id == Number(brandId))
    if (brand && isEditing){
      if (brand[0].logo_url) {
        setMainImageExist(brand[0].logo_url)
      }
      setFormData({
        name: brand[0]?.name || "",
        slug: brand[0]?.slug || "",
        description: brand[0]?.description || "",
        country: brand[0]?.country || "",
        website: brand[0]?.website || "",
        email: brand[0]?.email || "",
        logo_url: brand[0]?.logo_url || "",
        cover_url: brand[0]?.cover_url || "",
        is_active: brand[0]?.is_active ?? true,
        social_links: brand[0]?.social_links || [],
      })

    }
  }, [])

  const [newSocialLink, setNewSocialLink] = useState({
    platform: "instagram",
    url: "",
    is_primary: false,
  })

  const [showSocialForm, setShowSocialForm] = useState(false)

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: isEditing
        ? prev.slug
        : value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
    }))
  }

  const handleAddSocialLink = () => {
    if (newSocialLink.url.trim()) {
      setFormData((prev) => ({
        ...prev,
        social_links: [...prev.social_links, { ...newSocialLink }],
      }))
      setNewSocialLink({
        platform: "instagram",
        url: "",
        is_primary: false,
      })
      setShowSocialForm(false)
    }
  }

  const handleRemoveSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index),
    }))
  }

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setMainImage(file)
      }
      reader.readAsDataURL(file)
    }
  }
  const removeMainImage = () => {
    setMainImage(undefined)
    setDeletedLogoImage(true)
    setMainImageExist("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert("El nombre de la marca es requerido")
      return
    }
    const brand: Brand = {
      name: formData.name,
      description: formData.description,
      country: formData.country,
      website: formData.website,
      email: formData.email,
      // logo_url: formData.logo_url,
      logo_image: mainImage || undefined,
      // cover_url: formData.cover_url,
      is_active: formData.is_active,
      social_links: formData.social_links,
      deleted_logo_image: deletedLogoImage
    }
    const stored = localStorage.getItem("brands")
    if (!isEditing){
      const res = await BrandsService.createBrand(brand)
      if (res.success && res.data) {
        // 🔄 Actualizar localStorage "brands"
        let updated: any[] = []
        try {
          updated = stored ? JSON.parse(stored) : []
        } catch (e) {
          console.error("Error parsing brands from localStorage", e)
        }

        updated.push(res.data)
        localStorage.setItem("brands", JSON.stringify(updated))

        // ✅ Actualizar caché local de SWR
        mutate('brands', updated, false)

        // Redireccionar
      } else {
        alert("Error al crear marca")
      }
    }
    else {
      const res = await BrandsService.updateBrand(brand, brandId)
      if (res.success && res.data) {
        let updated: Brand[] = []
        try {
          updated = stored ? JSON.parse(stored) : []
        } catch (e) {
          console.error("Error parsing localStorage brands", e)
        }
  
        const newList = updated.map((p) => (p.id === brandId ? res.data : p))
        localStorage.setItem("brands", JSON.stringify(newList))
        mutate("brands", newList, false)
      } else {
        console.error("Error updating product:", res.error)
      }
    }
    window.location.href = "/dashboard/ecommerce/brands"
  }
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">{isEditing ? "Editar Marca" : "Nueva Marca"}</h1>
              <p className="text-muted-foreground">
                {isEditing ? "Actualiza la información de la marca" : "Crea una nueva marca para tu tienda"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <Card className={`${secondBackgroundColor} ${principalText}`}>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                  <CardDescription className={`${principalText}`}>Datos principales de la marca</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre de la Marca *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Ej: Nike, Adidas, Apple..."
                        className={`${placeholderStyle}`}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="nike, adidas, apple..."
                        className={`${placeholderStyle}`}
                      />
                      <p className="text-xs">Se genera automáticamente desde el nombre</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe la marca, su misión, valores..."
                      rows={3}
                      className={`${placeholderStyle}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                      placeholder="Ej: Estados Unidos, España, Alemania..."
                      className={`${placeholderStyle}`}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Marca activa</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Información de Contacto */}
              <Card className={`border-b border-border ${secondBackgroundColor} ${principalText}`}>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                  <CardDescription className={`${principalText}`}>Datos de contacto y presencia web</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio Web</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 " />
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                        placeholder="https://www.marca.com"
                        className={`pl-10 ${placeholderStyle}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email de Contacto</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 " />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="contacto@marca.com"
                        className={`pl-10 ${placeholderStyle}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Imágenes */}
              <Card className={`border-b border-border ${secondBackgroundColor} ${principalText}`}>
                <CardHeader>
                  <CardTitle>Imágenes</CardTitle>
                  <CardDescription className={`${principalText}`}>Logo y imagen de portada de la marca</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div>
                      <div className="mt-2">
                        <input
                          id="main-image"
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageUpload}
                          className="hidden"
                        />
                        {!mainImage && !mainImageExist ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("main-image")?.click()}
                            // className="w-full h-40 border-dashed"
                            className={`w-full h-40 border-dashed ${secondHoverBackground}`}
                          >
                            <div className="text-center">
                              <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Haz clic para subir la imagen principal</p>
                            </div>
                          </Button>
                        ) : (
                          <div className="relative w-full h-40">
                            <img
                              src={mainImageExist ? mainImageExist : URL.createObjectURL(mainImage)}
                              alt="Imagen principal"
                              className="w-full h-full object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0"
                              onClick={removeMainImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* {formData.logo_url && (
                      <div className="mt-2">
                        <img
                          src={formData.logo_url || "/placeholder.svg"}
                          alt="Preview logo"
                          className="h-16 w-16 object-cover rounded-lg border"
                        />
                      </div>
                    )} */}
                  </div>
                  
                </CardContent>
              </Card>

              {/* Redes Sociales */}
              <Card className={`border-b border-border ${secondBackgroundColor} ${principalText}`}>
                <CardHeader>
                  <CardTitle>Redes Sociales</CardTitle>
                  <CardDescription
                  className={`${principalText}`}
                  >Enlaces a redes sociales y plataformas digitales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Enlaces existentes */}
                  {formData.social_links.length > 0 && (
                    <div className="space-y-2">
                      {formData.social_links.map((link, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <Badge variant="outline" className={`${principalText}`}>
                            {SOCIAL_PLATFORMS.find((p) => p.value === link.platform)?.label || link.platform}
                          </Badge>
                          <div className="flex-1 text-sm truncate"
                          >
                            {link.url}
                          </div>
                          {link.is_primary && (
                            <Badge variant="default" className="text-xs">
                              Principal
                            </Badge>
                          )}
                          <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveSocialLink(index)}
                          className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulario para agregar nuevo enlace */}
                  {showSocialForm ? (
                    <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Plataforma</Label>
                          <select
                            value={newSocialLink.platform}
                            onChange={(e) => setNewSocialLink((prev) => ({ ...prev, platform: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            {SOCIAL_PLATFORMS.map((platform) => (
                              <option key={platform.value} value={platform.value}>
                                {platform.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>URL</Label>
                          <Input
                            type="url"
                            value={newSocialLink.url}
                            onChange={(e) => setNewSocialLink((prev) => ({ ...prev, url: e.target.value }))}
                            placeholder="https://..."
                            className={` ${placeholderStyle}`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newSocialLink.is_primary}
                          onCheckedChange={(checked) => setNewSocialLink((prev) => ({ ...prev, is_primary: checked }))}
                        />
                        <Label>Enlace principal</Label>
                      </div>
                      <div className="flex space-x-2">
                        <Button type="button" size="sm" onClick={handleAddSocialLink}
                        className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowSocialForm(false)}
                        className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" onClick={() => setShowSocialForm(true)}
                    className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Red Social
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (handleClick("/dashboard/ecommerce/brands"))}
                  className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                >
                  Cancelar
                </Button>
                <Button type="submit" className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Actualizar Marca" : "Crear Marca"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
