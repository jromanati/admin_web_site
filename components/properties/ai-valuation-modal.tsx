"use client"

import { useEffect, useRef, useState } from "react"
import { TrendingUp, Loader2, DollarSign, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { AIService } from "@/services/ai.service"

interface PropertyData {
  property_type?: string
  operation?: string
  region?: string
  commune?: string
  bedrooms?: number
  bathrooms?: number
  built_area?: number
  land_area?: number
  parking?: number
  state?: string
}

interface ValuationResult {
  min_price: number
  max_price: number
  suggested_price: number
  currency: string
  confidence: "alta" | "media" | "baja"
  comparable_properties: number
  market_trend: "al alza" | "estable" | "a la baja"
}

interface AIValuationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  propertyId?: number | string
  propertyData: PropertyData
  onApply: (price: number, currency: string) => void
}

export function AIValuationModal({
  open,
  onOpenChange,
  propertyId,
  propertyData,
  onApply,
}: AIValuationModalProps) {
  const [isCalculating, setIsCalculating] = useState(false)
  const [valuation, setValuation] = useState<ValuationResult | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const executionIdRef = useRef<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!open) {
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
      executionIdRef.current = null
      setIsCalculating(false)
      setValuation(null)
      setSelectedPrice(null)
      setError(null)
    }
  }, [open])

  const formatPrice = (price: number, currency: string) => {
    if (currency === "UF") {
      return `${price.toLocaleString("es-CL")} UF`
    }
    if (currency === "USD") {
      return `USD ${price.toLocaleString("es-CL")}`
    }
    return `$${price.toLocaleString("es-CL")}`
  }

  const normalizeValuation = (payload: any): ValuationResult | null => {
    if (!payload || typeof payload !== "object") return null

    // Backward compat (old contract)
    if (
      payload.min_price !== undefined &&
      payload.max_price !== undefined &&
      payload.suggested_price !== undefined
    ) {
      const currency = typeof payload.currency === "string" ? payload.currency : "UF"
      const min = Number(payload.min_price)
      const max = Number(payload.max_price)
      const suggested = Number(payload.suggested_price)

      if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(suggested)) return null

      const confidence =
        payload.confidence === "alta" || payload.confidence === "media" || payload.confidence === "baja"
          ? payload.confidence
          : "media"
      const market_trend =
        payload.market_trend === "al alza" || payload.market_trend === "estable" || payload.market_trend === "a la baja"
          ? payload.market_trend
          : "estable"

      return {
        min_price: min,
        max_price: max,
        suggested_price: suggested,
        currency,
        confidence,
        comparable_properties: Number(payload.comparable_properties) || 0,
        market_trend,
      }
    }

    // New contract (price_* + _low/_high)
    const currencyBaseRaw = typeof payload.currency_base === "string" ? payload.currency_base : "CLP"
    const currency = currencyBaseRaw.toUpperCase()

    const pick = (cur: string) => {
      if (cur === "UF") {
        return {
          low: Number(payload.price_uf_low ?? payload.price_uf),
          high: Number(payload.price_uf_high ?? payload.price_uf),
          suggested: Number(payload.price_uf),
        }
      }
      if (cur === "USD") {
        return {
          low: Number(payload.price_usd_low ?? payload.price_usd),
          high: Number(payload.price_usd_high ?? payload.price_usd),
          suggested: Number(payload.price_usd),
        }
      }
      return {
        low: Number(payload.price_clp_low ?? payload.price_clp),
        high: Number(payload.price_clp_high ?? payload.price_clp),
        suggested: Number(payload.price_clp),
      }
    }

    const picked = pick(currency)
    const low = picked.low
    const high = picked.high
    const suggested = picked.suggested

    if (!Number.isFinite(low) || !Number.isFinite(high) || !Number.isFinite(suggested)) return null

    const confidenceNum = Number(payload.confidence)
    const confidence: ValuationResult["confidence"] =
      Number.isFinite(confidenceNum) && confidenceNum >= 0.8
        ? "alta"
        : Number.isFinite(confidenceNum) && confidenceNum >= 0.6
          ? "media"
          : "baja"

    return {
      min_price: low,
      max_price: high,
      suggested_price: suggested,
      currency,
      confidence,
      comparable_properties: 0,
      market_trend: "estable",
    }
  }

  const handleCalculate = async () => {
    setIsCalculating(true)
    setValuation(null)
    setSelectedPrice(null)
    setError(null)

    abortControllerRef.current?.abort()
    const ac = new AbortController()
    abortControllerRef.current = ac

    try {
      const pid =
        typeof propertyId === "number"
          ? propertyId
          : typeof propertyId === "string"
            ? Number(propertyId)
            : NaN

      if (!Number.isFinite(pid) || pid <= 0) {
        throw new Error(`Missing property id (got: ${String(propertyId)})`)
      }

      const startRes = await AIService.startAppraiseProperty(pid)
      if (!startRes.success || !startRes.data?.execution_id) {
        throw new Error(startRes.error || "No se pudo iniciar la tasación")
      }

      executionIdRef.current = startRes.data.execution_id

      const execution = await AIService.pollExecution(startRes.data.execution_id, {
        signal: ac.signal,
      })

      const artifact = execution.artifacts?.find((a) => a.artifact_type === "json")
      const raw = artifact?.content

      const jsonPayload =
        typeof raw === "string"
          ? (() => {
              try {
                return JSON.parse(raw)
              } catch {
                return null
              }
            })()
          : raw

      const normalized = normalizeValuation(jsonPayload)
      if (!normalized) {
        throw new Error("La IA no devolvió una tasación válida")
      }

      setValuation(normalized)
      setSelectedPrice(normalized.suggested_price)
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        return
      }
      const msg = e instanceof Error ? e.message : "Error desconocido"
      setError(msg)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleRegenerate = async () => {
    const executionId = executionIdRef.current
    if (!executionId) {
      return handleCalculate()
    }

    setIsCalculating(true)
    setValuation(null)
    setSelectedPrice(null)
    setError(null)

    abortControllerRef.current?.abort()
    const ac = new AbortController()
    abortControllerRef.current = ac

    try {
      const regenRes = await AIService.regenerateExecution(executionId)
      const newExecutionId = regenRes.data?.execution_id
      if (!regenRes.success || !newExecutionId) {
        throw new Error(regenRes.error || "No se pudo recalcular")
      }

      executionIdRef.current = newExecutionId

      const execution = await AIService.pollExecution(newExecutionId, { signal: ac.signal })
      const artifact = execution.artifacts?.find((a) => a.artifact_type === "json")
      const raw = artifact?.content
      const jsonPayload =
        typeof raw === "string"
          ? (() => {
              try {
                return JSON.parse(raw)
              } catch {
                return null
              }
            })()
          : raw

      const normalized = normalizeValuation(jsonPayload)
      if (!normalized) {
        throw new Error("La IA no devolvió una tasación válida")
      }

      setValuation(normalized)
      setSelectedPrice(normalized.suggested_price)
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        return
      }
      const msg = e instanceof Error ? e.message : "Error desconocido"
      setError(msg)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleApply = () => {
    if (selectedPrice && valuation) {
      onApply(selectedPrice, valuation.currency)
      onOpenChange(false)
      setValuation(null)
      setSelectedPrice(null)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setValuation(null)
    setSelectedPrice(null)
    setIsCalculating(false)
    setError(null)
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    executionIdRef.current = null
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "alta":
        return "text-emerald-600 bg-emerald-50"
      case "media":
        return "text-amber-600 bg-amber-50"
      case "baja":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "al alza":
        return "text-emerald-600"
      case "a la baja":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const hasMinimumData =
    !!propertyData.property_type && !!propertyData.commune && (propertyData.built_area ?? 0) > 0

  const content = (
    <div className="space-y-4">
      {/* Resumen de datos */}
      <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Datos para la tasación:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {propertyData.property_type && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Tipo:</span>
              <span className="font-medium">{propertyData.property_type}</span>
            </div>
          )}
          {propertyData.operation && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Operación:</span>
              <span className="font-medium">{propertyData.operation}</span>
            </div>
          )}
          {propertyData.commune && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Comuna:</span>
              <span className="font-medium">{propertyData.commune}</span>
            </div>
          )}
          {propertyData.state && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Estado:</span>
              <span className="font-medium">{propertyData.state}</span>
            </div>
          )}
          {(propertyData.bedrooms ?? 0) > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Dormitorios:</span>
              <span className="font-medium">{propertyData.bedrooms}</span>
            </div>
          )}
          {(propertyData.bathrooms ?? 0) > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Baños:</span>
              <span className="font-medium">{propertyData.bathrooms}</span>
            </div>
          )}
          {(propertyData.built_area ?? 0) > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Área construida:</span>
              <span className="font-medium">{propertyData.built_area} m²</span>
            </div>
          )}
          {(propertyData.land_area ?? 0) > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Terreno:</span>
              <span className="font-medium">{propertyData.land_area} m²</span>
            </div>
          )}
          {(propertyData.parking ?? 0) > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Estacionamientos:</span>
              <span className="font-medium">{propertyData.parking}</span>
            </div>
          )}
        </div>
      </div>

      {/* Advertencia si faltan datos */}
      {!hasMinimumData && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800">Datos insuficientes</p>
            <p className="text-amber-700">
              Para una tasación más precisa, completa al menos: tipo de propiedad, comuna y área
              construida.
            </p>
          </div>
        </div>
      )}

      {/* Botón de calcular */}
      {!valuation && (
        <Button
          onClick={handleCalculate}
          disabled={isCalculating || !hasMinimumData}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
        >
          {isCalculating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Calculando tasación...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Calcular Tasación
            </>
          )}
        </Button>
      )}

      {error && (
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-red-800">No se pudo calcular</p>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Resultado de tasación */}
      {valuation && (
        <div className="space-y-4">
          {/* Precio sugerido */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 sm:p-5 text-center">
            <p className="text-sm text-blue-600 mb-1">Precio Sugerido</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-700">
              {formatPrice(valuation.suggested_price, valuation.currency)}
            </p>
          </div>

          {/* Rango de precios */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSelectedPrice(valuation.min_price)}
              className={`p-2 sm:p-3 rounded-lg border text-center transition-all ${
                selectedPrice === valuation.min_price
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-border hover:border-blue-300 hover:bg-blue-50/50"
              }`}
            >
              <p className="text-xs text-muted-foreground">Precio Mínimo</p>
              <p className="text-base sm:text-lg font-semibold text-foreground">
                {formatPrice(valuation.min_price, valuation.currency)}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPrice(valuation.max_price)}
              className={`p-2 sm:p-3 rounded-lg border text-center transition-all ${
                selectedPrice === valuation.max_price
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-border hover:border-blue-300 hover:bg-blue-50/50"
              }`}
            >
              <p className="text-xs text-muted-foreground">Precio Máximo</p>
              <p className="text-base sm:text-lg font-semibold text-foreground">
                {formatPrice(valuation.max_price, valuation.currency)}
              </p>
            </button>
          </div>

          {/* Seleccionar precio sugerido */}
          <button
            type="button"
            onClick={() => setSelectedPrice(valuation.suggested_price)}
            className={`w-full p-2 sm:p-3 rounded-lg border text-center transition-all ${
              selectedPrice === valuation.suggested_price
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                : "border-border hover:border-blue-300 hover:bg-blue-50/50"
            }`}
          >
            <p className="text-xs text-muted-foreground">Usar Precio Sugerido</p>
            <p className="text-base sm:text-lg font-semibold text-foreground">
              {formatPrice(valuation.suggested_price, valuation.currency)}
            </p>
          </button>

          {/* Métricas adicionales */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Confianza</p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${getConfidenceColor(valuation.confidence)}`}
              >
                {valuation.confidence}
              </span>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Comparadas</p>
              <p className="text-sm font-semibold">{valuation.comparable_properties}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Tendencia</p>
              <p className={`text-sm font-semibold capitalize ${getTrendIcon(valuation.market_trend)}`}>
                {valuation.market_trend}
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isCalculating}
              className="w-full sm:flex-1"
            >
              {isCalculating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              Recalcular
            </Button>
            <Button
              onClick={handleApply}
              disabled={!selectedPrice}
              className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Aplicar Precio
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Tasación con IA
            </DrawerTitle>
            <DrawerDescription>
              Obtén un rango de precio estimado basado en el mercado actual
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Tasación con IA
          </DialogTitle>
          <DialogDescription>
            Obtén un rango de precio estimado basado en el mercado actual
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
