"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type ProductPreviewImage = {
  url: string
  alt?: string
}

export type ProductPreviewData = {
  name: string
  description?: string
  price?: number | null
  original_price?: number | null
  stock?: number | null
  sku?: string
  brand_name?: string
  category_name?: string
  is_new?: boolean
  is_active?: boolean
  images?: ProductPreviewImage[]
  specifications?: { name: string; value: string }[]
  benefits?: { value: string; benefit_type?: string }[]
  compatibilities?: { value: string }[]
}

interface ProductPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: ProductPreviewData
}

export function ProductPreviewModal({ open, onOpenChange, data }: ProductPreviewModalProps) {
  const images = data.images ?? []
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!open) return
    setActiveIndex(0)
  }, [open])

  const activeImage = images[activeIndex]

  const defaultInfoTab = useMemo(() => {
    const hasSpecs = (data.specifications?.length ?? 0) > 0
    const hasBenefits = (data.benefits?.length ?? 0) > 0
    const hasCompat = (data.compatibilities?.length ?? 0) > 0

    if (hasSpecs) return "specs"
    if (hasBenefits) return "benefits"
    if (hasCompat) return "compat"
    return "specs"
  }, [data.benefits?.length, data.compatibilities?.length, data.specifications?.length])

  const hasDiscount = useMemo(() => {
    if (typeof data.price !== "number" || typeof data.original_price !== "number") return false
    return data.original_price > data.price
  }, [data.price, data.original_price])

  const nextImage = () => {
    if (images.length <= 1) return
    setActiveIndex((i) => (i + 1) % images.length)
  }

  const prevImage = () => {
    if (images.length <= 1) return
    setActiveIndex((i) => (i - 1 + images.length) % images.length)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[95vw] max-w-6xl sm:max-w-6xl h-[90vh] max-h-[90vh] p-0 gap-0 flex flex-col">
        <div className="px-6 py-4 border-b sticky top-0 bg-background">
          <DialogHeader className="p-0">
            <DialogTitle>Previsualización</DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[minmax(0,560px)_1fr] gap-8 items-start">
            <div className="space-y-3">
            <div className="relative w-full aspect-square rounded-lg bg-muted overflow-hidden">
              {activeImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeImage.url} alt={activeImage.alt ?? data.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center text-sm text-muted-foreground">Sin imagen</div>
              )}

              {images.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.slice(0, 10).map((img, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`relative aspect-square rounded-md overflow-hidden border ${idx === activeIndex ? "border-primary" : "border-border"}`}
                    onClick={() => setActiveIndex(idx)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt ?? data.name} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {data.is_new && <Badge variant="default">Nuevo</Badge>}
                  {hasDiscount && <Badge variant="destructive">Oferta</Badge>}
                  {typeof data.is_active === "boolean" && (
                    <Badge variant={data.is_active ? "default" : "secondary"}>{data.is_active ? "Activo" : "Inactivo"}</Badge>
                  )}
                  {data.brand_name && <Badge variant="outline">{data.brand_name}</Badge>}
                  {data.category_name && <Badge variant="outline">{data.category_name}</Badge>}
                </div>

                <h2 className="text-2xl font-semibold leading-tight">{data.name || "(Sin nombre)"}</h2>
                {data.sku && <p className="text-sm text-muted-foreground">SKU: {data.sku}</p>}
              </div>

              <div className="space-y-1">
                {typeof data.price === "number" && (
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold">${data.price}</span>
                    {hasDiscount && typeof data.original_price === "number" && (
                      <span className="text-sm text-muted-foreground line-through">${data.original_price}</span>
                    )}
                  </div>
                )}
                {typeof data.stock === "number" && (
                  <p className="text-sm text-muted-foreground">Stock: {data.stock}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="button" className="sm:min-w-56">Agregar al carrito</Button>
                <Button type="button" variant="outline" className="sm:min-w-40">Comprar ahora</Button>
              </div>

              {data.description && (
                <div className="space-y-2">
                  <h3 className="font-medium">Descripción</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{data.description}</p>
                </div>
              )}

              {(((data.specifications?.length ?? 0) > 0) || ((data.benefits?.length ?? 0) > 0) || ((data.compatibilities?.length ?? 0) > 0)) && (
                <Card>
                  <CardContent className="p-4">
                    <Tabs defaultValue={defaultInfoTab}>
                      <TabsList className="w-full">
                        {(data.specifications?.length ?? 0) > 0 && <TabsTrigger value="specs">Especificaciones</TabsTrigger>}
                        {(data.benefits?.length ?? 0) > 0 && <TabsTrigger value="benefits">Beneficios</TabsTrigger>}
                        {(data.compatibilities?.length ?? 0) > 0 && <TabsTrigger value="compat">Compatibilidad</TabsTrigger>}
                      </TabsList>

                      {(data.specifications?.length ?? 0) > 0 && (
                        <TabsContent value="specs" className="mt-4">
                          <div className="space-y-2">
                            {data.specifications!.slice(0, 20).map((s, idx) => (
                              <div key={idx} className="flex justify-between gap-4 text-sm">
                                <span className="text-muted-foreground">{s.name}</span>
                                <span className="font-medium text-right">{s.value}</span>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      )}

                      {(data.benefits?.length ?? 0) > 0 && (
                        <TabsContent value="benefits" className="mt-4">
                          <div className="flex flex-col gap-2">
                            {data.benefits!.slice(0, 20).map((b, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                                <span>{b.value}</span>
                                {b.benefit_type && <Badge variant="outline" className="text-xs">{b.benefit_type}</Badge>}
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      )}

                      {(data.compatibilities?.length ?? 0) > 0 && (
                        <TabsContent value="compat" className="mt-4">
                          <div className="flex flex-col gap-2 text-sm">
                            {data.compatibilities!.slice(0, 30).map((c, idx) => (
                              <span key={idx} className="text-muted-foreground">{c.value}</span>
                            ))}
                          </div>
                        </TabsContent>
                      )}
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
