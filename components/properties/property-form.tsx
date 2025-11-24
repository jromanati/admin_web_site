"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Save, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { regions, communes } from "@/data/adminData"
import {
  OperationEnum,
  StateEnum,
  PropertyTypeEnum,
  PriceTypeEnum,
  PropertyStateEnum
} from "@/types/properties/properties"
import type { Property } from "@/types/properties/properties"
import VideoUpload from "@/components/ui/video-upload"
import MapEmbed from "@/components/ui/map-embed"

interface PropertyFormProps {
  initialData?: Partial<Property>
  onSubmit: (data: Property) => void
  onCancel: () => void
  isSending?: boolean
}

/** Helpers de formato */
const addThousandDots = (intStr: string) =>
  intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

/** Formatea visualmente el input:
 * - allowDecimals = true (UF): miles con punto + decimales con coma (máx 2)
 * - allowDecimals = false (CLP/USD): solo enteros con miles
 * - No "mueve" decimales si el usuario no ingresó separador
 * - No confunde el punto de miles con decimal al re-formatear ("1.890" se mantiene, no "1,89")
 */
const formatAmount = (raw: string, allowDecimals: boolean) => {
  // Mantén solo dígitos y separadores , .
  let v = (raw || "").replace(/[^\d,\.]/g, "")

  if (!allowDecimals) {
    // Solo enteros (CLP/USD)
    const digits = v.replace(/\D/g, "")
    return digits ? addThousandDots(digits) : ""
  }

  const hasComma = v.includes(",")
  const hasDot = v.includes(".")
  const endsWithSep = /[.,]$/.test(v)

  // Caso especial: termina en punto -> mostrar coma colgante (ej. "13." -> "13,")
  if (!hasComma && /\.$/.test(v)) {
    const intDigits = v.slice(0, -1).replace(/\D/g, "")
    const intFormatted = intDigits ? addThousandDots(intDigits) : ""
    return `${intFormatted},`
  }

  // 1) Si hay COMA, la coma es decimal
  if (hasComma) {
    const last = v.lastIndexOf(",")
    const intPart = v.slice(0, last)
    const decPart = v.slice(last + 1)

    const intDigits = intPart.replace(/\D/g, "")
    const intFormatted = intDigits ? addThousandDots(intDigits) : ""

    const decDigits = decPart.replace(/\D/g, "").slice(0, 2)

    if (decDigits) return `${intFormatted},${decDigits}`
    if (endsWithSep) return `${intFormatted},` // coma colgante
    return intFormatted
  }

  // 2) No hay coma. ¿El punto actúa como decimal?
  // Consideramos decimal SÓLO si la parte posterior al ÚLTIMO punto tiene 1-2 dígitos.
  if (hasDot) {
    const last = v.lastIndexOf(".")
    const after = v.slice(last + 1).replace(/\D/g, "")
    const before = v.slice(0, last)

    const isDecimalDot = after.length > 0 && after.length <= 2
    if (isDecimalDot) {
      const intDigits = before.replace(/\D/g, "")
      const intFormatted = intDigits ? addThousandDots(intDigits) : ""
      const decDigits = after.slice(0, 2)
      return decDigits ? `${intFormatted},${decDigits}` : intFormatted
    }
  }

  // 3) Todos los puntos son miles (ej. "1.890" -> "1.890")
  const digits = v.replace(/\D/g, "")
  return digits ? addThousandDots(digits) : ""
}

/** Convierte string formateado a número JS (robusto):
 * - Si tiene coma: "." se asume miles y "," decimal.
 * - Si NO tiene coma pero tiene un único punto con 1-2 decimales: "." es decimal.
 * - Si no hay separador: entero.
 */
const parseAmountToNumber = (formatted: string) => {
  const s = String(formatted || "").trim()
  if (!s) return 0
  if (s.includes(",")) {
    // Formato chileno
    const n = s.replace(/\./g, "").replace(",", ".")
    return Number(n) || 0
  }
  // Sin coma: ¿punto decimal?
  if (/^\d+\.\d{1,2}$/.test(s)) {
    return Number(s) || 0
  }
  // Entero sin separadores o con puntos como miles
  return Number(s.replace(/\./g, "")) || 0
}

/** Formatea un número para mostrarlo en el input acorde a allowDecimals */
const formatNumberForInput = (num: number, allowDecimals: boolean) => {
  const s = String(num)
  const decimals = allowDecimals
    ? Math.min((s.split(".")[1]?.length ?? 0), 2)
    : 0
  return new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

const PropertyFormComponent = ({ initialData, onSubmit, onCancel, isSending = false }: PropertyFormProps) => {
  const [selectedRegion, setSelectedRegion] = useState(initialData?.region || "")
  const [availableCommunes, setAvailableCommunes] = useState<string[]>([])
  const [images, setImages] = useState<File[]>([])
  const [mainImage, setMainImage] = useState<File>()
  const [mainImageExist, setMainImageExist] = useState<string>("")
  const [mainImageDelete, setmainImageDelete] = useState<boolean>(false)
  const [video, setVideo] = useState<string | null>(initialData?.video || null)
  const [videoDelete, setvideoDelete] = useState<boolean>(false)
  const [secondBackgroundColor, setSecondBackgroundColor] = useState("")
  const [principalText, setPrincipalText] = useState("")
  const [principalHoverBackground, setPrincipalHoverBackground] = useState("")
  const [secondHoverBackground, setSecondHoverBackground] = useState("")
  const [principalHoverText, setPrincipalHoverText] = useState("")

  useEffect(() => {
    if (initialData && initialData.video){
      setVideo(initialData.video || null)
    }
    if (initialData?.mainImage) {
      setMainImageExist(initialData.mainImage)
    }
    const rawClientData = localStorage.getItem("tenant_data")
    const tenant_data = rawClientData ? JSON.parse(rawClientData) : null
    if (tenant_data?.styles_site){
      setSecondBackgroundColor(tenant_data.styles_site.second_background_color)
      setPrincipalText(tenant_data.styles_site.principal_text)
      setPrincipalHoverBackground(tenant_data.styles_site.principal_hover_background)
      setSecondHoverBackground(tenant_data.styles_site.second_hover_background)
      setPrincipalHoverText(tenant_data.styles_site.principal_hover_text)
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<Property>({
    defaultValues: {
      title: "",
      code: "",
      published: false,
      featured: false,
      show_map: false,
      map_src: "",
      built_area: undefined,
      land_area: undefined,
      electricity: false,
      water: "",
      description: "",
      amenities: "",
      characteristics: "",
      price: undefined, // lo convertiremos de string formateado a número en onSubmit
      currency: "CLP",
      price_type: PriceTypeEnum.FIJO,
      operation: OperationEnum.VENTA,
      state: StateEnum.NUEVA,
      property_state: PropertyStateEnum.DISPONIBLE,
      property_type: PropertyTypeEnum.CASA,
      bedrooms: undefined,
      bathrooms: undefined,
      region: "",
      commune: "",
      address: "",
      parking: undefined,
      storage: false,
      mainImage: null,
      images: [],
      video: null,
      ...initialData,
    },
  })

  // currency y price (string formateado) para reaccionar a cambios
  const currency = watch("currency") as "CLP" | "USD" | "UF" | undefined
  const allowDecimals = currency === "UF"

  // Actualizar comunas cuando cambia la región
  useEffect(() => {
    if (selectedRegion && communes[selectedRegion as keyof typeof communes]) {
      setAvailableCommunes(communes[selectedRegion as keyof typeof communes])
    } else {
      setAvailableCommunes([])
    }
  }, [selectedRegion])

  // Inicializar datos si existen
  useEffect(() => {
    if (initialData) {
      reset(initialData)
      setSelectedRegion(initialData.region || "")
      setImages((initialData.images as any) || [])
    }
  }, [initialData, reset])

  // Si initialData.price existe, formatearlo para el input según moneda actual
  useEffect(() => {
    if (initialData?.price != null) {
      const num =
        typeof initialData.price === "number"
          ? initialData.price
          : parseAmountToNumber(String(initialData.price))
      const formatted = formatNumberForInput(num, allowDecimals)
      setValue("price" as any, formatted as any, { shouldValidate: true })
      const el = document.querySelector<HTMLInputElement>('input[name="price"]')
      if (el) el.value = formatted
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowDecimals, initialData?.price])

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    setValue("region", region)
    setValue("commune", "") // Reset commune when region changes
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
    setMainImageExist("")
    setmainImageDelete(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        setImages((prev) => [...prev, file])
      })
    }
  }
  const [deletedImagePublicIds, setDeletedImagePublicIds] = useState<string[]>([])
  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    if (initialData){
      // @ts-ignore (si tu tipo de imagen incluye public_id en edición)
      const imageToDelete = initialData.images?.[index]
      if (imageToDelete?.public_id) {
        setDeletedImagePublicIds((prev) => [...prev, imageToDelete.public_id])
      }
    }
    setImages(updatedImages)
    // @ts-ignore: si tu Property.images es File[] en creación, mantenlo así
    setValue("images", updatedImages as any)
  }

  const onFormSubmit = (data: Property) => {
    // data.price aquí puede venir como string formateado (porque input es text)
    // Aseguramos convertir a number para el backend
    const rawPrice = (data as any).price as unknown as string | number | undefined
    let priceNumber: number | undefined = undefined
    if (typeof rawPrice === "string") {
      priceNumber = parseAmountToNumber(rawPrice)
    } else if (typeof rawPrice === "number") {
      priceNumber = rawPrice
    }

    // Validación no negativa
    if (priceNumber !== undefined && priceNumber < 0) {
      // Si usas toast, podrías mostrar error. Aquí simple early-return.
      return
    }

    onSubmit({
      ...data,
      // fuerza precio como number
      price: priceNumber as any,
      mainImage,
      mainImageDelete,
      images,
      deletedImagePublicIds,
      video,
      videoDelete
    } as Property)
  }

  // Permitir dígitos, navegación, copy/paste y separador decimal si corresponde
  const allowDecimalKey = (e: React.KeyboardEvent<HTMLInputElement>, allowDecimals: boolean) => {
    const ctrlCmd = e.ctrlKey || e.metaKey
    const navigation = ["Backspace","Delete","ArrowLeft","ArrowRight","Home","End","Tab","Escape","Enter"]
    const isDigit = /^[0-9]$/.test(e.key)
    const isSeparator = allowDecimals && (
      e.key === "," || e.key === "." || e.key === "Decimal" || e.code === "NumpadDecimal"
    )
    if (ctrlCmd) return
    if (navigation.includes(e.key)) return
    if (isDigit) return
    if (isSeparator) return
    e.preventDefault()
  }

  /** Handler onChange del precio con mantenimiento de caret */
  const handlePriceChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const input = e.target
    const before = input.value
    const caret = input.selectionStart ?? before.length
    const formatted = formatAmount(before, allowDecimals)

    // Asignar al input visible
    input.value = formatted

    // Actualizar react-hook-form internamente
    setValue("price" as any, formatted as any, { shouldValidate: true })

    // Mantener caret en posición razonable
    const diff = formatted.length - before.length
    const newPos = Math.max(0, caret + diff)
    requestAnimationFrame(() => input.setSelectionRange(newPos, newPos))
  }

  // Manejar pegado (paste) para normalizar contenido
  const handlePricePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text")
    const input = e.currentTarget
    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? 0
    const nextRaw = input.value.slice(0, start) + pasted + input.value.slice(end)
    const formatted = formatAmount(nextRaw, allowDecimals)
    input.value = formatted
    setValue("price" as any, formatted as any, { shouldValidate: true })
    const pos = formatted.length
    requestAnimationFrame(() => input.setSelectionRange(pos, pos))
  }

  // Si cambias de moneda, re-formatea lo que haya escrito
  useEffect(() => {
    const el = document.querySelector<HTMLInputElement>('input[name="price"]')
    if (!el) return
    const formatted = formatAmount(el.value || "", allowDecimals)
    el.value = formatted
    setValue("price" as any, formatted as any, { shouldValidate: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowDecimals])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">{initialData?.title ? "Editar Propiedad" : "Nueva Propiedad"}</h2>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
        {/* Información Básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
            <input
              type="text"
              {...register("title", { required: "El título es requerido" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Casa moderna en Las Condes"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Código</label>
            <input
              type="text"
              {...register("code")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: LC001"
            />
          </div>
        </div>

        {/* Tipo y Operación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Propiedad *</label>
            <select
              {...register("property_type", { required: "El tipo es requerido" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(PropertyTypeEnum).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.property_type && <p className="mt-1 text-sm text-red-600">{errors.property_type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Operación *</label>
            <select
              {...register("operation", { required: "La operación es requerida" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(OperationEnum).map((operation) => (
                <option key={operation} value={operation}>
                  {operation}
                </option>
              ))}
            </select>
            {errors.operation && <p className="mt-1 text-sm text-red-600">{errors.operation.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de la propiedad *
            </label>
            <select
              {...register("state", { required: "El estado es requerido" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(StateEnum).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              {...register("property_state", { required: "El estado es requerido" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(PropertyStateEnum).map((property_state) => (
                <option key={property_state} value={property_state}>
                  {property_state}
                </option>
              ))}
            </select>
            {errors.property_state && <p className="mt-1 text-sm text-red-600">{errors.property_state.message}</p>}
          </div>
        </div>

        {/* Precio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
            <select
              {...register("currency")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="CLP">CLP</option>
              <option value="USD">USD</option>
              <option value="UF">UF</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
            <input
              type="text"
              inputMode={allowDecimals ? "decimal" : "numeric"}
              placeholder={allowDecimals ? "0,00" : "0"}
              {...register("price" as any, {
                validate: (v: any) => {
                  const num = typeof v === "number" ? v : parseAmountToNumber(String(v || ""))
                  if (num < 0) return "El precio no puede ser negativo"
                  return true
                },
              })}
              onKeyDown={(e) => allowDecimalKey(e, allowDecimals)}
              onChange={handlePriceChange}
              onPaste={handlePricePaste}
              onBlur={(e) => {
                e.target.value = formatAmount(e.target.value, allowDecimals)
                setValue("price" as any, e.target.value as any, { shouldValidate: true })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{String(errors.price.message)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Precio</label>
            <select
              {...register("price_type")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(PriceTypeEnum).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ubicación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Región *</label>
            <select
              {...register("region", { required: "La región es requerida" })}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar región</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {errors.region && <p className="mt-1 text-sm text-red-600">{errors.region.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comuna *</label>
            <select
              {...register("commune", { required: "La comuna es requerida" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!selectedRegion}
            >
              <option value="">Seleccionar comuna</option>
              {availableCommunes.map((commune) => (
                <option key={commune} value={commune}>
                  {commune}
                </option>
              ))}
            </select>
            {errors.commune && <p className="mt-1 text-sm text-red-600">{errors.commune.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
          <input
            type="text"
            {...register("address")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Av. Las Condes 1234"
          />
        </div>

        {/* Características */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Habitaciones</label>
            <input
              type="number"
              {...register("bedrooms", { min: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Baños</label>
            <input
              type="number"
              {...register("bathrooms", { min: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estacionamientos</label>
            <input
              type="number"
              {...register("parking", { min: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bodega</label>
            <input
              type="checkbox"
              {...register("storage")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>         
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Área Construida (m²)</label>
            <input
              type="number"
              {...register("built_area", { min: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Área de Terreno (m²)</label>
            <input
              type="number"
              {...register("land_area", { min: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
          <textarea
            {...register("description")}
            rows={30}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Descripción detallada de la propiedad..."
          />
        </div>

        {/* Mapa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación en Google Maps</label>
          <p className="text-sm text-gray-500 mb-4">
            Busca la dirección o pega el código iframe de Google Maps para mostrar la ubicación
          </p>
          <MapEmbed value={watch("map_src") || ""} onChange={(src) => setValue("map_src", src)} />
        </div>

        {/* Imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágen de portada
          </label>
          <div className="space-y-4">
            <div>
              <p className="text-sm mb-2">
                Esta será la imagen principal que se mostrará en la proiedad
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
            

          </div>
        </div>

        {/* Imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágenes adicionales
          </label>
          <div className="space-y-4">
            {/* Upload button */}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click para subir</span> o arrastra y suelta
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG o JPEG (MAX. 10MB)</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>

            {/* Image preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    {/* @ts-ignore: image puede venir con .url en edición */}
                    <img
                      src={(image as any).url ? (image as any).url : URL.createObjectURL(image)}
                      alt={`Producto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className={`absolute -top-2 -right-2 h-6 w-6 p-0`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Video de la Propiedad</label>
          <p className="text-sm text-gray-500 mb-4">
            Sube un video para mostrar mejor la propiedad (opcional, máximo 150MB)
          </p>
          <VideoUpload
            value={video}
            onChange={(newVideo, videoDelete) => {
              setVideo(newVideo)
              setValue("video", newVideo)
              setvideoDelete(videoDelete)
            }}
            maxSize={150}
          />
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register("published")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Publicada</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register("featured")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Destacada</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register("show_map")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Mostrar Mapa</label>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className={`
              px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${secondBackgroundColor} ${principalText} ${principalHoverBackground}`}
          >
            <X className="h-4 w-4 mr-2 inline" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSending}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
            ${secondBackgroundColor} ${principalText} ${principalHoverBackground}
            `}
          >
            {isSending ? (
              <>
                <div
                  className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  style={{ animation: "spin 1s linear infinite" }}
                ></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2 inline" />
                Guardar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PropertyFormComponent
