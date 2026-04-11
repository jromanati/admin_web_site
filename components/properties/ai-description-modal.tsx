"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles, Copy, Check, Loader2 } from "lucide-react"
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
  amenities?: string
  characteristics?: string
}

interface AIDescriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  propertyId?: number | string
  propertyData: PropertyData
  onApply: (description: string) => void
}

export function AIDescriptionModal({
  open,
  onOpenChange,
  propertyId,
  propertyData,
  onApply,
}: AIDescriptionModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const executionIdRef = useRef<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!open) {
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
      executionIdRef.current = null
      setIsGenerating(false)
      setGeneratedDescription(null)
      setError(null)
    }
  }, [open])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGeneratedDescription(null)
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

      const startRes = await AIService.startGenerateDescription(pid)
      if (!startRes.success || !startRes.data?.execution_id) {
        throw new Error(startRes.error || "No se pudo iniciar la generación")
      }

      executionIdRef.current = startRes.data.execution_id

      const execution = await AIService.pollExecution(startRes.data.execution_id, {
        signal: ac.signal,
      })

      const artifact = execution.artifacts?.find((a) => a.artifact_type === "text")
      const content = artifact?.content
      const description = typeof content === "string" ? content : null

      if (!description) {
        throw new Error("La IA no devolvió una descripción")
      }

      setGeneratedDescription(description)
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        return
      }
      const msg = e instanceof Error ? e.message : "Error desconocido"
      setError(msg)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    if (generatedDescription) {
      navigator.clipboard.writeText(generatedDescription)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleApply = () => {
    if (generatedDescription) {
      onApply(generatedDescription)
      onOpenChange(false)
      setGeneratedDescription(null)
    }
  }

  const handleRegenerate = async () => {
    const executionId = executionIdRef.current
    if (!executionId) {
      return handleGenerate()
    }

    setIsGenerating(true)
    setGeneratedDescription(null)
    setError(null)

    abortControllerRef.current?.abort()
    const ac = new AbortController()
    abortControllerRef.current = ac

    try {
      const regenRes = await AIService.regenerateExecution(executionId)
      const newExecutionId = regenRes.data?.execution_id
      if (!regenRes.success || !newExecutionId) {
        throw new Error(regenRes.error || "No se pudo regenerar")
      }

      executionIdRef.current = newExecutionId
      const execution = await AIService.pollExecution(newExecutionId, { signal: ac.signal })
      const artifact = execution.artifacts?.find((a) => a.artifact_type === "text")
      const content = artifact?.content
      const description = typeof content === "string" ? content : null
      if (!description) {
        throw new Error("La IA no devolvió una descripción")
      }
      setGeneratedDescription(description)
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        return
      }
      const msg = e instanceof Error ? e.message : "Error desconocido"
      setError(msg)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setGeneratedDescription(null)
    setIsGenerating(false)
    setError(null)
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    executionIdRef.current = null
  }

  const content = (
    <div className="space-y-4">
      {/* Resumen de datos que se usarán */}
      <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Datos que se utilizarán:</h4>
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
        </div>
      </div>

      {/* Botón de generar */}
      {!generatedDescription && (
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generando descripción...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generar Descripción
            </>
          )}
        </Button>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* Descripción generada */}
      {generatedDescription && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Descripción generada:</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </>
              )}
            </Button>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4 max-h-48 sm:max-h-64 overflow-y-auto">
            <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
              {generatedDescription}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="w-full sm:flex-1"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Regenerar
            </Button>
            <Button
              onClick={handleApply}
              className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              Aplicar Descripción
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
              <Sparkles className="h-5 w-5 text-amber-500" />
              Generar Descripción con IA
            </DrawerTitle>
            <DrawerDescription>
              La IA generará una descripción atractiva basada en los datos de tu propiedad
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Generar Descripción con IA
          </DialogTitle>
          <DialogDescription>
            La IA generará una descripción atractiva basada en los datos de tu propiedad
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
