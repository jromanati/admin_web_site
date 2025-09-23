"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react"
import { CategorySelector } from "@/components/ecommerce/category-selector"
import { AttributesSelector } from "@/components/ecommerce/attributes-selector"
import { AdminSidebar } from "@/components/admin-sidebar"
import type { Product, ProductSpecificationsGroup } from "@/types/ecomerces/products"
import { ProductsService } from "@/services/ecomerce/products/products.service"
import { AuthService } from "@/services/auth.service"
import useSWR, { mutate } from "swr"
import { BrandSelector } from "@/components/ecommerce/brand-selector"
import { useRouter } from "next/navigation"

interface CreateProductPageProps {
  params: {
    id: string
  }
}
interface Specification {
  id: string
  name: string
  value: string
}

interface Brand {
  id: string
  name: string
  logo_url?: string
  is_active: boolean
}

export default function CreateProductPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    sku: "",
  })
  const [images, setImages] = useState<File[]>([])
  const [selectedCategory, setSelectedCategory] = useState<any>(undefined)
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string[] }>({})
  const [mainImage, setMainImage] = useState<File>()
  const [specifications, setSpecifications] = useState<ProductSpecificationsGroup[]>([])
  const [errors, setErrors] = useState<string>("")
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>(undefined)
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [scondHoverText, setSecondlHoverText] = useState("")
  const [placeholderStyle, setPlaceholderStyle] = useState("")
  const [thirdBackgroundColor, setThirdBackgroundColor] = useState("")
  const [isLoading, setisLoading] = useState(true)

  useEffect(() => {
      const rawUserData = localStorage.getItem("user_data")
      const rawClientData = localStorage.getItem("tenant_data")
      const tenant_data = rawUserData ? JSON.parse(rawClientData) : null
      if (tenant_data.styles_site){
        setThirdBackgroundColor(tenant_data.styles_site.third_background_color)
        setSecondBackgroundColor(tenant_data.styles_site.second_background_color)
        setPrincipalText(tenant_data.styles_site.principal_text)
        setPrincipalHoverBackground(tenant_data.styles_site.principal_hover_background)
        setSecondHoverBackground(tenant_data.styles_site.second_hover_background)
        setSecondlHoverText(tenant_data.styles_site.second_hover_text)
        setPlaceholderStyle(tenant_data.styles_site.placeholder)
      }
      setisLoading(false);
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        setImages((prev) => [...prev, file])
      })
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
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
  }

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category)
  }

  const handleAttributesChange = (attributes: { [key: string]: string[] }) => {
    setSelectedAttributes(attributes)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const featuresDetailIds: number[] = []
    Object.values(selectedAttributes).forEach((arr) => {
      arr.forEach((id) => featuresDetailIds.push(Number(id)))
    })

    const product: Product = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      original_price: 0,
      rating: 5,
      stock: parseInt(formData.stock),
      sku: formData.sku,
      category: selectedCategory?.id,
      is_new: true,
      is_active: true,
      images: images,
      features: featuresDetailIds,
      main_image: mainImage || null,
      specifications: specifications
    }
    if (!product.category){
      setErrors("* Debe asignar una categoría")
      return
    }

    const res = await ProductsService.createProduct(product)

    if (res.success && res.data) {
      // 🔄 Actualizar localStorage "products"
      const stored = localStorage.getItem("products")
      let updated: any[] = []

      try {
        updated = stored ? JSON.parse(stored) : []
      } catch (e) {
        console.error("Error parsing products from localStorage", e)
      }

      updated.push(res.data)
      localStorage.setItem("products", JSON.stringify(updated))

      // ✅ Actualizar caché local de SWR
      mutate('products', updated, false)

      // Redireccionar
      window.location.href = "/dashboard/ecommerce/products"
    } else {
      alert("Error al crear producto")
    }
  }

  const addSpecification = () => {
    const newSpec: Specification = {
      id: Date.now().toString(),
      name: "",
      value: "",
    }
    setSpecifications([...specifications, newSpec])
  }

  const updateSpecification = (id: string, field: "name" | "value", value: string) => {
    setSpecifications(specifications.map((spec) => (spec.id === id ? { ...spec, [field]: value } : spec)))
  }

  const removeSpecification = (id: string) => {
    setSpecifications(specifications.filter((spec) => spec.id !== id))
  }

  const handleBrandSelect = (brand: Brand | undefined) => {
    setSelectedBrand(brand)
  }
  const router = useRouter()
  const handleClick = (route) => {
    setisLoading(true);
    router.push(route)
  }


  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar siteType="ecommerce" siteId="" siteName="" currentPath={`/dashboard/ecommerce/products`} />
      {isLoading ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F2CFCE]/30 border-t-[#F2CFCE]" />
            <p className="text-sm text-muted-foreground">Cargando…</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="lg:pl-64">
            <div className={`border-b border-border ${secondBackgroundColor} ${principalText}`}>
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h1 className="text-xl font-semibold">Crear Nuevo Producto</h1>
                      <p className="text-sm ">Agrega un nuevo producto a tu catálogo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-8">
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <p className="text-red-400 text-sm">{errors}</p>
                  <Card className={`${secondBackgroundColor} ${principalText} `}>
                    <CardHeader>
                      <CardTitle>Información Básica</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nombre del producto *</Label>
                          <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Camiseta Premium"
                            className={`${placeholderStyle}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor="sku">SKU *</Label>
                          <Input
                            id="sku"
                            required
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="Ej: CAM-001"
                            className={`${placeholderStyle}`}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe el producto en detalle..."
                          rows={4}
                          className={`${placeholderStyle}`}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price">Precio *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="29.99"
                            className={`${placeholderStyle}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor="stock">Stock inicial *</Label>
                          <Input
                            id="stock"
                            type="number"
                            required
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            placeholder="100"
                            className={`${placeholderStyle}`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Specifications */}
                  <Card className={`${secondBackgroundColor} ${principalText} `}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Especificaciones del Producto</CardTitle>
                          <p className="text-sm mt-1">
                            Agrega detalles técnicos y características específicas del producto
                          </p>
                        </div>
                        <Button type="button" onClick={addSpecification} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Especificación
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {specifications.length === 0 ? (
                        <div className="text-center py-8 ">
                          <p>No hay especificaciones agregadas</p>
                          <p className="text-sm">Haz clic en "Agregar Especificación" para comenzar</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {specifications.map((spec) => (
                            <div key={spec.id} className="flex gap-4 items-start p-4 border border-border rounded-lg">
                              <div className="flex-1">
                                <Label htmlFor={`spec-name-${spec.id}`}>Especificación</Label>
                                <Input
                                  id={`spec-name-${spec.id}`}
                                  value={spec.name}
                                  onChange={(e) => updateSpecification(spec.id, "name", e.target.value)}
                                  placeholder="Ej: Material, Peso, Dimensiones..."
                                  className={`mt-1 ${placeholderStyle}`}
                                />
                              </div>
                              <div className="flex-1">
                                <Label htmlFor={`spec-value-${spec.id}`}>Valor</Label>
                                <Input
                                  id={`spec-value-${spec.id}`}
                                  value={spec.value}
                                  onChange={(e) => updateSpecification(spec.id, "value", e.target.value)}
                                  placeholder="Ej: 100% Algodón, 250g, 30x20x5 cm..."
                                  className={`mt-1 ${placeholderStyle}`}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeSpecification(spec.id)}
                                className="mt-6 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Brand Selection */}
                  <Card className={`${secondBackgroundColor} ${principalText} `}>
                    <CardHeader>
                      <CardTitle>Marca del Producto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BrandSelector selectedBrand={selectedBrand} onBrandSelect={handleBrandSelect} />
                    </CardContent>
                  </Card>

                  <Card className={`${secondBackgroundColor} ${principalText} `}>
                    <CardHeader>
                      <CardTitle>Categoría del Producto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CategorySelector selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect} />
                    </CardContent>
                  </Card>

                  <Card className={`${secondBackgroundColor} ${principalText} `}>
                    <CardHeader>
                      <CardTitle>Atributos del Producto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AttributesSelector
                        selectedAttributes={selectedAttributes}
                        onAttributesChange={handleAttributesChange}
                      />
                    </CardContent>
                  </Card>

                  <Card className={`${secondBackgroundColor} ${principalText} `}>
                    <CardHeader>
                      <CardTitle>Imágenes del Producto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="main-image">Imagen Principal *</Label>
                          <p className="text-sm mb-2">
                            Esta será la imagen principal que se mostrará en el catálogo
                          </p>
                          <div className="mt-2">
                            <input
                              id="main-image"
                              type="file"
                              accept="image/*"
                              onChange={handleMainImageUpload}
                              className="hidden"
                            />
                            {!mainImage? (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("main-image")?.click()}
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
                                  src={URL.createObjectURL(mainImage)}
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

                        <div className="border-t border-border pt-6">
                          <Label htmlFor="images">Imágenes Adicionales</Label>
                          <p className="text-sm  mb-2">
                            Agrega más imágenes para mostrar diferentes ángulos del producto
                          </p>
                          <div className="mt-2">
                            <input
                              id="images"
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("images")?.click()}
                              className={`w-full h-40 border-dashed ${secondHoverBackground}`}
                            >
                              <div className="text-center">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Haz clic para subir imágenes o arrastra y suelta
                                </p>
                              </div>
                            </Button>
                          </div>
                        </div>

                        {images.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {images.map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`Producto ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeImage(index)}
                                  className={`absolute -top-2 -right-2 h-6 w-6 p-0 ${thirdBackgroundColor} $ ${secondHoverBackground} ${scondHoverText}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => (handleClick("/dashboard/ecommerce/products"))}
                      className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit"
                    className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                    >
                      Crear Producto
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
