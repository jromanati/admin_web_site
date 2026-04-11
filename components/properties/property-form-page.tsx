"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import PropertyFormComponent from "./property-form"
import type { Property, PropertyImage } from "@/types/properties/properties"
import { OperationEnum, StateEnum, PropertyTypeEnum, PriceTypeEnum,
  PropertyStateEnum
 } from "@/types/properties/properties"
import { PropertiesService } from "@/services/properties/properties.service"
import { AuthService } from "@/services/auth.service"
import useSWR, { mutate } from "swr"
import { useRouter } from "next/navigation"

interface PropertyFormPageProps {
  propertyId?: string
  mode: "create" | "edit"
}

export function PropertyFormPage({ propertyId, mode }: PropertyFormPageProps) {
  const [initialData, setInitialData] = useState<Partial<Property> | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")
  useEffect(() => {
      const rawUserData = localStorage.getItem("user_data")
      const rawClientData = localStorage.getItem("tenant_data")
      const tenant_data = rawClientData ? JSON.parse(rawClientData) : null
      setIsLoading(false)
      if (tenant_data.styles_site){
        setSecondBackgroundColor(tenant_data.styles_site.second_background_color)
        setPrincipalText(tenant_data.styles_site.principal_text)
        setPrincipalHoverBackground(tenant_data.styles_site.principal_hover_background)
        setSecondHoverBackground(tenant_data.styles_site.second_hover_background)
        setPrincipalHoverText(tenant_data.styles_site.principal_hover_text)
      }
  }, [])

  const numOrUndef = (v: any) =>
    v === null || v === undefined || v === "" ? undefined : Number(v);

  const mapEnum = (v: any, dict: Record<string, string>, fallback: string) => {
    if (v == null) return fallback;
    const key = String(v).trim().toLowerCase();
    const hit = Object.keys(dict).find(k => k.toLowerCase() === key);
    return hit ? dict[hit] : fallback;
  };
  const mapEnumValue = (input: string | undefined | null, Enum: Record<string, string>, fallback: string) => {
    if (!input) return fallback
    if (input in Enum) return Enum[input]
    const foundValue = Object.values(Enum).find(
      (v) => v.toLowerCase() === String(input).toLowerCase()
    )
    return foundValue || fallback
  }

  useEffect(() => {
    if (mode === "edit" && propertyId) {
      let cancelled = false
      setIsLoading(true)

      ;(async () => {
        const idNum = Number(propertyId)
        if (!Number.isFinite(idNum)) {
          setIsLoading(false)
          return
        }

        const res = await PropertiesService.getPropertyById(idNum)
        if (cancelled) return

        if (!res.success || !res.data) {
          setIsLoading(false)
          return
        }

        const prop: any = res.data as any
        setInitialData({
          title: prop.title ?? "",
          code: prop.code ?? "",
          published: !!prop.published,
          featured: !!prop.featured,
          show_map: !!prop.show_map,
          map_src: prop.map_src ?? "",
          built_area: numOrUndef(prop.built_area),
          land_area: numOrUndef(prop.land_area),
          electricity: !!prop.electricity,
          water: prop.water ?? "",
          description: prop.description ?? "",
          amenities: prop.amenities ?? "",
          characteristics: prop.characteristics ?? "",
          price: numOrUndef(prop.price),
          currency: prop.currency ?? "CLP",
          price_type: mapEnum(prop.price_type, PriceTypeEnum as any, "FIJO") as any,
          property_type: mapEnumValue(prop.property_type, PropertyTypeEnum as any, "CASA") as any,
          property_state: mapEnum(prop.property_state, PropertyStateEnum as any, "DISPONIBLE") as any,
          operation: mapEnum(prop.operation, OperationEnum as any, "VENTA") as any,
          state: mapEnum(prop.state, StateEnum as any, "NUEVA") as any,
          bedrooms: numOrUndef(prop.bedrooms),
          bathrooms: numOrUndef(prop.bathrooms),
          region: prop.region ?? "",
          commune: prop.commune ?? "",
          address: prop.address ?? "",
          parking: numOrUndef(prop.parking),
          storage: !!prop.storage,
          mainImage: prop.image_url,
          images: prop.images,
          video: prop.video_url ?? null,
        })
        setIsLoading(false)
      })()

      return () => {
        cancelled = true
      }
    }
    else{
      setInitialData({
        title: "",
        code:  "",
        published: true,
        featured: false,
        show_map: true,
        map_src: "",
        built_area: 0,
        land_area: 0,
        electricity: false,
        water:  "",
        description: "",
        amenities: "",
        characteristics: "",
        price: 0,
        currency: "CLP",
        price_type: PriceTypeEnum.FIJO,
        property_type: PropertyTypeEnum.CASA,
        property_state: PropertyStateEnum.DISPONIBLE,
        operation:  OperationEnum.VENTA,
        state: StateEnum.NUEVA,
        bedrooms: 0,
        bathrooms: 0,
        region: "",
        commune: "",
        address: "",
        parking: 0,
        storage: false,
        mainImage: null,
        images: [],
        video: null,
      });
    }
  }, [mode, propertyId])

  const handleSubmit = async (data: Property & any) => {
    const isValid = AuthService.isTokenValid()
    if (!isValid) {
      const isRefreshValid = await AuthService.isRefreshTokenValid()
      if (!isRefreshValid)window.location.href = "/"
    }
    setIsSending(true)
    let res;
    if (mode === "edit" && propertyId) {
      const data_to_update = data
      data_to_update.deleted_images = JSON.stringify(data.deletedImagePublicIds)
      data_to_update.mainImageDelete = data.mainImageDelete
      data_to_update.videoDelete = data.videoDelete
      res = await PropertiesService.updateProperty(data_to_update, Number(propertyId))
    }
    else{
      res = await PropertiesService.createProperty(data)
    }

    if (res.success && res.data) {
      // 🔄 Actualizar localStorage "products"
      const stored = localStorage.getItem("properties")
      let updated: any[] = []

      try {
        updated = stored ? JSON.parse(stored) : []
      } catch (e) {
        console.error("Error parsing products from localStorage", e)
      }

      updated.push(res.data)
      // localStorage.setItem("properties", JSON.stringify(updated))

      mutate('properties', updated, false)
      setIsLoading(true);
      setIsSending(false)
      router.push(`/dashboard/properties/properties`)
    } else {
      router.push("/")
    }
  }
  const router = useRouter()
  const handleCancel = () => {
    setIsLoading(true);
    router.push(`/dashboard/properties/properties`)
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
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-xl font-semibold ">
                      {mode === "create" ? "Nueva Propiedad" : "Editar Propiedad"}
                    </h1>
                    <p className="text-sm ">
                      {mode === "create"
                        ? "Registra una nueva propiedad en tu portafolio"
                        : "Modifica los datos de la propiedad"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
              <PropertyFormComponent
                initialData={initialData}
                propertyId={propertyId}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSending={isSending}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
