// Archivo: app/dashboard/ecommerce/products/edit/[id]/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { mutate } from "swr"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react"
import { CategorySelector } from "@/components/ecommerce/category-selector"
import { AttributesSelector } from "@/components/ecommerce/attributes-selector"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AuthService } from "@/services/auth.service"

import { ProductsService } from "@/services/ecomerce/products/products.service"
import type { Product, ProductSpecificationsGroup } from "@/types/ecomerces/products"
import type { Category } from "@/types/ecomerces/categories"
import type { Feature } from "@/types/ecomerces/features"
import { BrandSelector } from "@/components/ecommerce/brand-selector"

interface Brand {
  id: string
  name: string
  logo_url?: string
  is_active: boolean
}

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const productId = Number(id)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    sku: "",
  })
  const [existingImages, setExistingImages] = useState<{ id: number; url: string; public_id: string }[]>([])
  const [deletedImagePublicIds, setDeletedImagePublicIds] = useState<string[]>([])
  const [images, setImages] = useState<File[]>([])
  const [selectedCategory, setSelectedCategory] = useState<any>()
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string[] }>({})
  const [mainImage, setMainImage] = useState<File>()
  const [mainImageExist, setMainImageExist] = useState<string>("")
  let isTokenValid = false // AuthService.isTokenValid()
  const [specifications, setSpecifications] = useState<ProductSpecificationsGroup[]>([])
  const [deletedSpecificationsIds, setDeletedSpecificationsIds] = useState<string[]>([])
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>(undefined)
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [scondHoverText, setSecondlHoverText] = useState("")
  const [placeholderStyle, setPlaceholderStyle] = useState("")
  const [thirdBackgroundColor, setThirdBackgroundColor] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
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
        setPrincipalHoverText(tenant_data.styles_site.principal_hover_text)
      }
      setisLoading(false);
  }, [])

  useEffect(() => {
    const isValid = AuthService.isTokenValid()
    if (isValid) {
      isTokenValid = true
    }
  }, [])
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!isTokenValid) {
        const isRefreshValid = await AuthService.isRefreshTokenValid()
        if (!isRefreshValid)window.location.href = "/"
      }
    }
    fetchDashboard()
  }, [])  // 👈 ejecuta solo al montar

  useEffect(() => {
    const stored = localStorage.getItem("products")
    const storedCategories = localStorage.getItem("categories")
    const storedFeatures = localStorage.getItem("features")
    if (stored) {
      try {
        const parsed: Product[] = JSON.parse(stored)
        const parsedCategories: Category[] = JSON.parse(storedCategories || "[]")
        const parsedeatures: Feature[] = JSON.parse(storedFeatures || "[]")
        const product = parsed.find((p) => p.id === productId)
        if (product) {
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            stock: product.stock.toString(),
            sku: product.sku,
          })
          const category = parsedCategories.filter(cat => cat.id == Number(product.category))
          setSelectedCategory(category[0])
          // setImages(product.images as File[])
          if (product.images && Array.isArray(product.images)) {
            setExistingImages(product.images)
            Array.from(product.images).forEach((file) => {
              setImages((prev) => [...prev, file])
            })
          }
          if (product.main_image) {
            setMainImageExist(product.main_image)
          }
          if (product.features && product.features.length > 0) {
            const attributes: { [key: string]: string[] } = {}

            product.features.forEach((f) => {
              const featureId = f.feature.id
              const detailIds = f.feature.detail.map((d) => d.id)
              attributes[featureId] = detailIds
            })

            setSelectedAttributes(attributes)
          }
          if (product.specifications && product.specifications.length > 0) {
            setSpecifications(product.specifications)
          }
          if (product.brand_data) {
            setSelectedBrand(product.brand_data)
          }
        }
      } catch (e) {
        console.error("Error al cargar producto", e)
      }
    }
  }, [productId])

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
    setMainImageExist("")
  }

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
    const imageToDelete = existingImages[index]
    if (imageToDelete) {
      setDeletedImagePublicIds((prev) => [...prev, imageToDelete.public_id])
      setExistingImages(existingImages.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const featuresDetailIds: number[] = []
    Object.values(selectedAttributes).forEach((arr) => {
      arr.forEach((id) => featuresDetailIds.push(Number(id)))
    })
    let brand_id = null
    if (selectedBrand) {
      brand_id = selectedBrand.id
    }
    const updatedProduct: Product = {
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
      id: productId,
      deleted_images: JSON.stringify(deletedImagePublicIds),
      main_image: mainImage || null,
      specifications: specifications,
      deleted_specification: JSON.stringify(deletedSpecificationsIds),
      brand: brand_id,
    }

    console.log(updatedProduct)

    const res = await ProductsService.updateProduct(updatedProduct, productId)

    if (res.success && res.data) {
      const stored = localStorage.getItem("products")
      let updated: Product[] = []
      try {
        updated = stored ? JSON.parse(stored) : []
      } catch (e) {
        console.error("Error parsing localStorage products", e)
      }

      const newList = updated.map((p) => (p.id === productId ? res.data : p))
      localStorage.setItem("products", JSON.stringify(newList))
      mutate("products", newList, false)

      router.push("/dashboard/ecommerce/products")
    } else {
      console.error("Error updating product:", res.error)
    }
  }
  const addSpecification = () => {
    const newSpec: ProductSpecificationsGroup = {
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
    setDeletedSpecificationsIds([...deletedSpecificationsIds, id])
    setSpecifications(specifications.filter((spec) => spec.id !== id))
  }

  const handleBrandSelect = (brand: Brand | undefined) => {
    setSelectedBrand(brand)
  }

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
                      <h1 className="text-xl font-semibold ">Editar Producto</h1>
                      <p className="text-sm ">Modifica los datos del producto</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <Card className={`${secondBackgroundColor} ${principalText} `}>
                  <CardHeader>
                    <CardTitle>Editar Producto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nombre</Label>
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
                        <Label htmlFor="sku">SKU</Label>
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
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      placeholder="Describe el producto en detalle..."
                      rows={4}
                      className={`${placeholderStyle}`}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Precio</Label>
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
                        <Label htmlFor="stock">Stock</Label>
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
                      <div className="text-center py-8">
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
                              // className="mt-6 text-destructive hover:text-destructive"
                              className={`mt-6 text-destructive ${secondHoverBackground} ${principalHoverText}`}
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
                    <CardTitle>Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategorySelector selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />
                  </CardContent>
                </Card>

                <Card className={`${secondBackgroundColor} ${principalText} `}>
                  <CardHeader>
                    <CardTitle>Atributos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AttributesSelector
                      selectedAttributes={selectedAttributes}
                      onAttributesChange={setSelectedAttributes}
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
                        <p className="text-sm  mb-2">
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
                          {!mainImage && !mainImageExist ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("main-image")?.click()}
                              className={`w-full h-40 border-dashed ${secondHoverBackground}`}
                            >
                              <div className="text-center">
                                <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm ">Haz clic para subir la imagen principal</p>
                              </div>
                            </Button>
                          ) : (
                            <div className="relative w-full h-40">
                              <img
                                // src={URL.createObjectURL(mainImage)}
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
                      {/* Adicionales */}
                      <div className="border-t border-border pt-6">
                        <Label htmlFor="images">Imágenes Adicionales</Label>
                        <p className="text-sm mb-2">
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
                                Haz clic para subir imágenes adicionales o arrastra y suelta
                              </p>
                            </div>
                          </Button>
                        </div>
                      </div>
                      {images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image.url ? image.url : URL.createObjectURL(image)}
                                alt={`Imagen ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                onClick={() => removeImage(index)}
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
                  <Button type="button" variant="outline"
                  onClick={() => (handleClick("/dashboard/ecommerce/products"))}
                  className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit"
                  className={`${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
                  >
                    Guardar Cambios</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
