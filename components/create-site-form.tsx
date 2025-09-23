"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, ShoppingCart, Building, MapPin } from "lucide-react"

const siteTypeConfig = {
  ecommerce: {
    icon: ShoppingCart,
    label: "Ecommerce",
    description: "Tienda online con productos y categorías",
    fields: ["Nombre de la tienda", "Descripción", "Categorías principales", "Moneda"],
  },
  properties: {
    icon: Building,
    label: "Propiedades",
    description: "Gestión de propiedades inmobiliarias",
    fields: ["Nombre de la inmobiliaria", "Descripción", "Tipos de propiedad", "Ubicaciones"],
  },
  excursions: {
    icon: MapPin,
    label: "Excursiones",
    description: "Tours y actividades turísticas",
    fields: ["Nombre de la empresa", "Descripción", "Tipos de excursión", "Destinos"],
  },
}

export function CreateSiteForm() {
  const searchParams = useSearchParams()
  const [siteType, setSiteType] = useState<string>(searchParams.get("type") || "")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: null as File | null,
    primaryColor: "#646cff",
    secondaryColor: "#f1f5f9",
  })
  const [isLoading, setIsLoading] = useState(false)

  const config = siteType ? siteTypeConfig[siteType as keyof typeof siteTypeConfig] : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate site creation
    setTimeout(() => {
      // Redirect to the new site dashboard
      const siteId = Math.random().toString(36).substr(2, 9)
      window.location.href = `/dashboard/${siteType}/${siteId}`
    }, 2000)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, logo: file })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Button variant="ghost" onClick={() => (window.location.href = "/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-foreground">Crear Nuevo Sitio</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          {!siteType ? (
            /* Site Type Selection */
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Selecciona el tipo de sitio</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(siteTypeConfig).map(([type, config]) => (
                  <Card
                    key={type}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSiteType(type)}
                  >
                    <CardHeader className="text-center">
                      <config.icon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <CardTitle>{config.label}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            /* Site Configuration Form */
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {config && <config.icon className="h-6 w-6 text-muted-foreground" />}
                  <div>
                    <CardTitle>Configurar {config?.label}</CardTitle>
                    <CardDescription>{config?.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nombre del sitio</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={`Mi ${config?.label}`}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe tu negocio..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Branding */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground">Personalización</h3>

                    <div>
                      <Label htmlFor="logo">Logo (opcional)</Label>
                      <div className="mt-2">
                        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50">
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              {formData.logo ? formData.logo.name : "Subir logo"}
                            </p>
                          </div>
                          <input
                            id="logo"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryColor">Color principal</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <input
                            id="primaryColor"
                            type="color"
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="w-12 h-10 rounded border border-border"
                          />
                          <Input
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            placeholder="#646cff"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="secondaryColor">Color secundario</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <input
                            id="secondaryColor"
                            type="color"
                            value={formData.secondaryColor}
                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                            className="w-12 h-10 rounded border border-border"
                          />
                          <Input
                            value={formData.secondaryColor}
                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                            placeholder="#f1f5f9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setSiteType("")}>
                      Atrás
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creando sitio..." : "Crear Sitio"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
