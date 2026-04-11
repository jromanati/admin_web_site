"use client"

import { useEffect, useRef, useState } from "react"
import {
  Wand2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Check,
  RotateCcw,
  Replace,
  Eye,
} from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useIsMobile } from "@/hooks/use-mobile"
import { AIService } from "@/services/ai.service"
import {
  AI_IMAGE_OPTIONS,
  getOperationOptions,
  type RoomType,
  type Operation,
  type Style,
  type WallColor,
  type AIImagePayload,
} from "@/lib/ai-image-options"

interface AIImageEnhancerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageId: number
  imageUrl: string
  onApply: (result: { url: string; artifactId: string; executionId: string }) => void
}

type Step = "room_type" | "operation" | "options" | "preview" | "result"

export function AIImageEnhancerModal({
  open,
  onOpenChange,
  imageId,
  imageUrl,
  onApply,
}: AIImageEnhancerModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("room_type")
  const [roomType, setRoomType] = useState<RoomType | null>(null)
  const [operation, setOperation] = useState<Operation | null>(null)
  const [style, setStyle] = useState<Style | null>(null)
  const [wallColor, setWallColor] = useState<WallColor | null>(null)
  const [preserveArchitecture, setPreserveArchitecture] = useState(true)
  const [improveLighting, setImproveLighting] = useState(true)
  const [declutter, setDeclutter] = useState(true)
  const [cleanBackground, setCleanBackground] = useState(false)
  const [removePersonalItems, setRemovePersonalItems] = useState(true)
  const [removeFurniture, setRemoveFurniture] = useState(false)
  const [removeDecor, setRemoveDecor] = useState(false)
  const [staging, setStaging] = useState(true)
  const [makeEmptyClean, setMakeEmptyClean] = useState(false)
  const [extraInstructions, setExtraInstructions] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const abortRef = useRef<AbortController | null>(null)
  const lastResultRef = useRef<{ url: string; artifactId: string; executionId: string } | null>(null)

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort()
      abortRef.current = null
      lastResultRef.current = null
    }
  }, [open])

  const resetState = () => {
    setCurrentStep("room_type")
    setRoomType(null)
    setOperation(null)
    setStyle(null)
    setWallColor(null)
    setPreserveArchitecture(true)
    setImproveLighting(true)
    setDeclutter(true)
    setCleanBackground(false)
    setRemovePersonalItems(true)
    setRemoveFurniture(false)
    setRemoveDecor(false)
    setStaging(true)
    setMakeEmptyClean(false)
    setExtraInstructions("")
    setIsProcessing(false)
    setResultImageUrl(null)
    setShowComparison(false)
    setError(null)
  }

  const handleClose = () => {
    onOpenChange(false)
    resetState()
  }

  const buildPayload = (): AIImagePayload | null => {
    if (!roomType || !operation) return null

    const payload: AIImagePayload = {
      image_url: imageUrl,
      room_type: roomType,
      operation: operation,
    }

    const options = getOperationOptions(operation)

    if (options.showStyle && style) {
      payload.style = style
      payload.furniture_style = style
    }
    if (options.showWallColor && wallColor) {
      payload.wall_color = wallColor
    }

    payload.preserve_architecture = preserveArchitecture
    payload.improve_lighting = improveLighting
    payload.declutter = declutter
    payload.clean_background = cleanBackground
    payload.remove_personal_items = removePersonalItems
    payload.remove_furniture = removeFurniture
    payload.remove_decor = removeDecor
    payload.staging = staging
    payload.make_empty_clean = makeEmptyClean

    const trimmed = extraInstructions.trim()
    if (trimmed.length > 0) {
      payload.extra_instructions = trimmed
    }

    return payload
  }

  const handleProcess = async () => {
    const payload = buildPayload()
    if (!payload) return

    setIsProcessing(true)
    setError(null)

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    try {
      const startRes = await AIService.startVirtualStage(imageId, payload)
      if (!startRes.success || !startRes.data?.execution_id) {
        throw new Error(startRes.error || "No se pudo iniciar el proceso")
      }

      const executionId = startRes.data.execution_id
      const execution = await AIService.pollExecution(executionId, { signal: ac.signal })
      const artifact = execution.artifacts?.find(
        (a) => a.artifact_type === "image" || (a as any).artifact_type === "image_url"
      )

      const url = typeof artifact?.content === "string" ? artifact.content : null
      if (!url || !artifact?.id) {
        throw new Error("La mejora no devolvió una imagen")
      }

      lastResultRef.current = { url, artifactId: artifact.id, executionId }
      setResultImageUrl(url)
      setCurrentStep("result")
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return
      setError(e instanceof Error ? e.message : "Error desconocido")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApply = () => {
    const last = lastResultRef.current
    if (!last) return

    setIsProcessing(true)
    setError(null)

    ;(async () => {
      try {
        const res = await AIService.applyArtifact(last.artifactId)
        if (!res.success) {
          throw new Error(res.error || "No se pudo aplicar la imagen")
        }

        onApply(last)
        handleClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido")
      } finally {
        setIsProcessing(false)
      }
    })()
  }

  const operationOptions = operation ? getOperationOptions(operation) : null

  const steps: { key: Step; label: string; shortLabel: string }[] = [
    { key: "room_type", label: "Espacio", shortLabel: "1" },
    { key: "operation", label: "Acción", shortLabel: "2" },
    { key: "options", label: "Opciones", shortLabel: "3" },
    { key: "preview", label: "Vista previa", shortLabel: "4" },
    { key: "result", label: "Resultado", shortLabel: "5" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  const canProceed = () => {
    switch (currentStep) {
      case "room_type":
        return roomType !== null
      case "operation":
        return operation !== null
      case "options":
        return true
      case "preview":
        return true
      default:
        return false
    }
  }

  const goNext = () => {
    if (currentStep === "room_type" && roomType) setCurrentStep("operation")
    else if (currentStep === "operation" && operation) setCurrentStep("options")
    else if (currentStep === "options") setCurrentStep("preview")
    else if (currentStep === "preview") handleProcess()
  }

  const goBack = () => {
    if (currentStep === "operation") setCurrentStep("room_type")
    else if (currentStep === "options") setCurrentStep("operation")
    else if (currentStep === "preview") setCurrentStep("options")
    else if (currentStep === "result") setCurrentStep("preview")
  }

  const content = (
    <div className="space-y-4">
      {/* Progress Steps */}
      <div className="flex items-center justify-between px-1">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div
              className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                index < currentStepIndex
                  ? "bg-violet-600 text-white"
                  : index === currentStepIndex
                    ? "bg-violet-100 text-violet-700 ring-2 ring-violet-600"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {index < currentStepIndex ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : index + 1}
            </div>
            <span
              className={`ml-1.5 text-xs hidden sm:inline ${
                index === currentStepIndex ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mx-1 sm:mx-2 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Image Preview */}
      <div>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          {showComparison && resultImageUrl ? (
            <div className="grid grid-cols-2 h-full">
              <div className="relative">
                <img src={imageUrl} alt="Original" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/70 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  Original
                </span>
              </div>
              <div className="relative border-l border-white">
                <img src={resultImageUrl} alt="Mejorada" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-violet-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  Mejorada
                </span>
              </div>
            </div>
          ) : (
            <img
              src={currentStep === "result" && resultImageUrl ? resultImageUrl : imageUrl}
              alt="Imagen"
              className="w-full h-full object-cover"
            />
          )}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin mx-auto mb-2 sm:mb-3" />
                <p className="font-medium text-sm sm:text-base">Procesando imagen...</p>
                <p className="text-xs sm:text-sm text-white/70">Esto puede tomar unos segundos</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[140px] sm:min-h-[200px]">
        {/* Step 1: Room Type */}
        {currentStep === "room_type" && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">
              1. Selecciona el tipo de espacio
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AI_IMAGE_OPTIONS.roomTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setRoomType(type.value as RoomType)}
                  className={`p-2 sm:p-3 rounded-lg border text-center transition-all ${
                    roomType === type.value
                      ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200 text-violet-700"
                      : "border-border hover:border-violet-300 hover:bg-violet-50/50"
                  }`}
                >
                  <span className="text-xs sm:text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Operation */}
        {currentStep === "operation" && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">2. ¿Qué quieres hacer?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AI_IMAGE_OPTIONS.operations.map((op) => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => {
                    setOperation(op.value as Operation)
                    setStyle(null)
                    setWallColor(null)
                  }}
                  className={`p-2 sm:p-3 rounded-lg border text-center transition-all ${
                    operation === op.value
                      ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200 text-violet-700"
                      : "border-border hover:border-violet-300 hover:bg-violet-50/50"
                  }`}
                >
                  <span className="text-xs sm:text-sm font-medium">{op.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Additional Options */}
        {currentStep === "options" && operationOptions && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">3. Opciones adicionales</h3>

            {/* Style Selection */}
            {operationOptions.showStyle && (
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm text-muted-foreground">Estilo (opcional)</Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                  {AI_IMAGE_OPTIONS.styles.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStyle(style === s.value ? null : (s.value as Style))}
                      className={`p-1.5 sm:p-2 rounded-lg border text-center transition-all ${
                        style === s.value
                          ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200 text-violet-700"
                          : "border-border hover:border-violet-300 hover:bg-violet-50/50"
                      }`}
                    >
                      <span className="text-[10px] sm:text-xs font-medium">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wall Color Selection */}
            {operationOptions.showWallColor && (
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm text-muted-foreground">Color de paredes (opcional)</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
                  {AI_IMAGE_OPTIONS.wallColors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() =>
                        setWallColor(wallColor === c.value ? null : (c.value as WallColor))
                      }
                      className={`p-1.5 sm:p-2 rounded-lg border text-center transition-all ${
                        wallColor === c.value
                          ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200 text-violet-700"
                          : "border-border hover:border-violet-300 hover:bg-violet-50/50"
                      }`}
                    >
                      <span className="text-[10px] sm:text-xs font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm text-muted-foreground">Ajustes (opcionales)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preserve-architecture"
                    checked={preserveArchitecture}
                    onCheckedChange={(checked) => setPreserveArchitecture(Boolean(checked))}
                  />
                  <label htmlFor="preserve-architecture" className="text-xs sm:text-sm cursor-pointer">
                    Preservar arquitectura
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="improve-lighting"
                    checked={improveLighting}
                    onCheckedChange={(checked) => setImproveLighting(Boolean(checked))}
                  />
                  <label htmlFor="improve-lighting" className="text-xs sm:text-sm cursor-pointer">
                    Mejorar iluminación
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="declutter"
                    checked={declutter}
                    onCheckedChange={(checked) => setDeclutter(Boolean(checked))}
                  />
                  <label htmlFor="declutter" className="text-xs sm:text-sm cursor-pointer">
                    Ordenar (declutter)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remove-personal-items"
                    checked={removePersonalItems}
                    onCheckedChange={(checked) => setRemovePersonalItems(Boolean(checked))}
                  />
                  <label htmlFor="remove-personal-items" className="text-xs sm:text-sm cursor-pointer">
                    Quitar objetos personales
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="clean-background"
                    checked={cleanBackground}
                    onCheckedChange={(checked) => setCleanBackground(Boolean(checked))}
                  />
                  <label htmlFor="clean-background" className="text-xs sm:text-sm cursor-pointer">
                    Limpiar fondo
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remove-furniture"
                    checked={removeFurniture}
                    onCheckedChange={(checked) => setRemoveFurniture(Boolean(checked))}
                  />
                  <label htmlFor="remove-furniture" className="text-xs sm:text-sm cursor-pointer">
                    Quitar muebles
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remove-decor"
                    checked={removeDecor}
                    onCheckedChange={(checked) => setRemoveDecor(Boolean(checked))}
                  />
                  <label htmlFor="remove-decor" className="text-xs sm:text-sm cursor-pointer">
                    Quitar decoración
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="staging"
                    checked={staging}
                    onCheckedChange={(checked) => setStaging(Boolean(checked))}
                  />
                  <label htmlFor="staging" className="text-xs sm:text-sm cursor-pointer">
                    Staging (agregar / mejorar)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="make-empty-clean"
                    checked={makeEmptyClean}
                    onCheckedChange={(checked) => setMakeEmptyClean(Boolean(checked))}
                  />
                  <label htmlFor="make-empty-clean" className="text-xs sm:text-sm cursor-pointer">
                    Dejar vacío y limpio
                  </label>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="extra-instructions" className="text-xs sm:text-sm text-muted-foreground">
                  Instrucciones extra (opcional)
                </Label>
                <textarea
                  id="extra-instructions"
                  value={extraInstructions}
                  onChange={(e) => setExtraInstructions(e.target.value)}
                  className="w-full min-h-[72px] rounded-md border bg-background px-3 py-2 text-xs sm:text-sm"
                  placeholder="Ej: más luminoso, sin cambiar el piso, mantener ventanas..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Preview Payload */}
        {currentStep === "preview" && (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm font-medium text-foreground">4. Confirmar configuración</h3>
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground">Tipo de espacio:</span>
                  <span className="ml-2 font-medium">
                    {AI_IMAGE_OPTIONS.roomTypes.find((r) => r.value === roomType)?.label}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Operación:</span>
                  <span className="ml-2 font-medium">
                    {AI_IMAGE_OPTIONS.operations.find((o) => o.value === operation)?.label}
                  </span>
                </div>
                {style && (
                  <div>
                    <span className="text-muted-foreground">Estilo:</span>
                    <span className="ml-2 font-medium">
                      {AI_IMAGE_OPTIONS.styles.find((s) => s.value === style)?.label}
                    </span>
                  </div>
                )}
                {wallColor && (
                  <div>
                    <span className="text-muted-foreground">Color paredes:</span>
                    <span className="ml-2 font-medium">
                      {AI_IMAGE_OPTIONS.wallColors.find((c) => c.value === wallColor)?.label}
                    </span>
                  </div>
                )}
              </div>
              {error && (
                <div className="text-xs sm:text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* Payload JSON Preview */}
            <details className="text-xs sm:text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Ver payload técnico
              </summary>
              <pre className="mt-2 p-2 sm:p-3 bg-muted rounded-lg overflow-x-auto text-[10px] sm:text-xs">
                {JSON.stringify(buildPayload(), null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Step 5: Result */}
        {currentStep === "result" && resultImageUrl && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Imagen mejorada</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
                className="text-muted-foreground h-8 text-xs sm:text-sm"
              >
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                {showComparison ? "Ocultar" : "Comparar"}
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              La imagen ha sido procesada exitosamente. Puedes aplicarla a tu propiedad o generar
              una nueva versión.
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border">
        <Button
          variant="ghost"
          size={isMobile ? "sm" : "default"}
          onClick={currentStep === "room_type" ? handleClose : goBack}
          disabled={isProcessing}
          className="text-xs sm:text-sm"
        >
          {currentStep === "room_type" ? (
            "Cancelar"
          ) : (
            <>
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              Atrás
            </>
          )}
        </Button>

        {currentStep === "result" ? (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"} 
              onClick={resetState}
              className="text-xs sm:text-sm"
            >
              <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Nueva mejora</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
            <Button
              size={isMobile ? "sm" : "default"}
              onClick={handleApply}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm"
            >
              <Replace className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Usar esta imagen</span>
              <span className="sm:hidden">Usar</span>
            </Button>
          </div>
        ) : (
          <Button
            size={isMobile ? "sm" : "default"}
            onClick={goNext}
            disabled={!canProceed() || isProcessing}
            className="bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 animate-spin" />
                <span className="hidden sm:inline">Procesando...</span>
              </>
            ) : currentStep === "preview" ? (
              <>
                <Wand2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Procesar imagen</span>
                <span className="sm:hidden">Procesar</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Siguiente</span>
                <span className="sm:hidden">Sig.</span>
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle className="flex items-center gap-2 text-base">
              <Wand2 className="h-4 w-4 text-violet-500" />
              Mejorar Imagen con IA
            </DrawerTitle>
            <DrawerDescription className="text-xs">
              Transforma tus imágenes de propiedades con IA
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-violet-500" />
            Mejorar Imagen con IA
          </DialogTitle>
          <DialogDescription>
            Transforma tus imágenes de propiedades con inteligencia artificial
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
