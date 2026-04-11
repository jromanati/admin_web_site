"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Wand2 } from "lucide-react"
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

interface AIImageAnalyzeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageId?: number | string
  imageUrl: string
  onAnalysisComplete: (executionId: string) => void
}

export function AIImageAnalyzeModal({
  open,
  onOpenChange,
  imageId,
  imageUrl,
  onAnalysisComplete,
}: AIImageAnalyzeModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!open) {
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
      setIsAnalyzing(false)
      setError(null)
    }
  }, [open])

  const handleClose = () => {
    onOpenChange(false)
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setIsAnalyzing(false)
    setError(null)
  }

  const handleStart = async () => {
    setIsAnalyzing(true)
    setError(null)

    abortControllerRef.current?.abort()
    const ac = new AbortController()
    abortControllerRef.current = ac

    try {
      const pid =
        typeof imageId === "number" ? imageId : typeof imageId === "string" ? Number(imageId) : NaN

      if (!Number.isFinite(pid) || pid <= 0) {
        throw new Error(`Missing image id (got: ${String(imageId)})`)
      }

      const startRes = await AIService.startAnalyzeImage(pid)
      if (!startRes.success || !startRes.data?.execution_id) {
        throw new Error(startRes.error || "No se pudo iniciar el análisis")
      }

      const execution = await AIService.pollExecution(startRes.data.execution_id, {
        signal: ac.signal,
      })

      const artifact = execution.artifacts?.find((a) => a.artifact_type === "json")
      if (!artifact) {
        throw new Error("El análisis no devolvió resultados")
      }

      onAnalysisComplete(startRes.data.execution_id)
      onOpenChange(false)
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        return
      }
      setError(e instanceof Error ? e.message : "Error desconocido")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const content = (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
        <img src={imageUrl} alt="Imagen" className="w-full h-full object-cover" />
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="font-medium text-sm">Analizando imagen…</p>
              <p className="text-xs text-white/70">Esto puede tardar unos segundos</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Para mejorar esta imagen con IA, primero debemos analizarla.
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={handleClose} disabled={isAnalyzing}>
          Cancelar
        </Button>
        <Button onClick={handleStart} disabled={isAnalyzing} className="bg-violet-600 hover:bg-violet-700 text-white">
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analizando…
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Analizar y continuar
            </>
          )}
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-violet-500" />
              Mejorar imagen con IA
            </DrawerTitle>
            <DrawerDescription>
              Primero analizaremos la imagen para construir un pipeline de mejoras
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-violet-500" />
            Mejorar imagen con IA
          </DialogTitle>
          <DialogDescription>
            Primero analizaremos la imagen para construir un pipeline de mejoras
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
