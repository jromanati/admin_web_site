"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AIService } from "@/services/ai.service"
import { AdminSidebar } from "@/components/admin-sidebar"
import ImageLightbox from "@/components/ui/image-lightbox"
import { AIImageEnhancerModal } from "@/components/properties/ai-image-enhancer-modal"

type AnalysisStep = {
  step: number
  title: string
  virtual_stage_params: Record<string, unknown>
}

type AnalysisResult = {
  notes?: string
  room_type?: string
  quality_score?: number
  staging_style?: string
  marketing_ready?: boolean
  needs_improvement?: boolean
  suggested_actions?: string[]
  steps?: AnalysisStep[]
}

export default function AIImagePipelinePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AIImagePipelinePageInner />
    </Suspense>
  )
}

function AIImagePipelinePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const imageIdParam = searchParams.get("imageId")
  const executionIdParam = searchParams.get("executionId")
  const imageUrlParam = searchParams.get("imageUrl")
  const propertyIdParam = searchParams.get("propertyId")

  const imageId = useMemo(() => {
    const n = Number(imageIdParam)
    return Number.isFinite(n) ? n : NaN
  }, [imageIdParam])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [steps, setSteps] = useState<AnalysisStep[]>([])

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isRunningStep, setIsRunningStep] = useState(false)

  const [stepResults, setStepResults] = useState<Array<{ url: string; artifactId: string; executionId: string } | null>>([])
  const [selectedPreviewStep, setSelectedPreviewStep] = useState<number | null>(null)

  const [beforeUrl, setBeforeUrl] = useState<string | null>(null)
  const [afterUrl, setAfterUrl] = useState<string | null>(null)
  const [lastArtifactId, setLastArtifactId] = useState<string | null>(null)
  const [lastExecutionId, setLastExecutionId] = useState<string | null>(null)

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  const [enhancerOpen, setEnhancerOpen] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    const run = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (!executionIdParam) {
          throw new Error("Missing executionId")
        }

        const execRes = await AIService.getExecution(executionIdParam)
        if (!execRes.success || !execRes.data) {
          throw new Error(execRes.error || "No se pudo cargar el análisis")
        }

        const execution = execRes.data
        const artifact = execution.artifacts?.find((a) => a.artifact_type === "json")
        const raw = artifact?.content
        const payload =
          typeof raw === "string"
            ? (() => {
                try {
                  return JSON.parse(raw)
                } catch {
                  return null
                }
              })()
            : raw

        if (!payload || typeof payload !== "object") {
          throw new Error("El análisis no devolvió resultados")
        }

        const result = payload as AnalysisResult
        const resultSteps = Array.isArray(result.steps) ? result.steps : []

        setAnalysis(result)
        setSteps(resultSteps)
        setCurrentStepIndex(0)
        setStepResults(new Array(resultSteps.length).fill(null))
        setSelectedPreviewStep(null)
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return
        setError(e instanceof Error ? e.message : "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }

    run()

    return () => {
      ac.abort()
    }
  }, [executionIdParam])

  const runStep = async (index: number) => {
    if (!Number.isFinite(imageId)) {
      setError(`Missing imageId (got: ${String(imageIdParam)})`)
      return
    }

    const step = steps[index]
    if (!step) return

    setIsRunningStep(true)
    setError(null)

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    try {
      const body: Record<string, unknown> = {
        ...(step.virtual_stage_params || {}),
      }

      if (index > 0) {
        const prevUrl = stepResults[index - 1]?.url
        if (prevUrl) body.image_url = prevUrl
      }

      const startRes = await AIService.startVirtualStage(imageId, body)
      if (!startRes.success || !startRes.data?.execution_id) {
        throw new Error(startRes.error || "No se pudo iniciar la mejora")
      }

      const executionId = startRes.data.execution_id
      setLastExecutionId(executionId)

      const execution = await AIService.pollExecution(executionId, {
        signal: ac.signal,
      })

      const artifact = execution.artifacts?.find(
        (a) => a.artifact_type === "image" || (a as any).artifact_type === "image_url"
      )

      const url = typeof artifact?.content === "string" ? artifact.content : null
      if (!url || !artifact?.id) {
        throw new Error("La mejora no devolvió una imagen")
      }

      if (!beforeUrl) {
        setBeforeUrl(afterUrl)
      }

      setAfterUrl(url)
      setLastArtifactId(artifact.id)
      setCurrentStepIndex(index + 1)

      setStepResults((prev) => {
        const next = [...prev]
        next[index] = {
          url,
          artifactId: artifact.id,
          executionId,
        }
        return next
      })

      setSelectedPreviewStep(index)
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return
      setError(e instanceof Error ? e.message : "Error desconocido")
    } finally {
      setIsRunningStep(false)
    }
  }

  const handleRetryLast = async () => {
    if (!lastExecutionId) return

    setIsRunningStep(true)
    setError(null)

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    try {
      const regenRes = await AIService.regenerateExecution(lastExecutionId)
      const newExecutionId = regenRes.data?.execution_id
      if (!regenRes.success || !newExecutionId) {
        throw new Error(regenRes.error || "No se pudo reintentar")
      }

      setLastExecutionId(newExecutionId)
      const execution = await AIService.pollExecution(newExecutionId, { signal: ac.signal })
      const artifact = execution.artifacts?.find(
        (a) => a.artifact_type === "image" || (a as any).artifact_type === "image_url"
      )
      const url = typeof artifact?.content === "string" ? artifact.content : null
      if (!url || !artifact?.id) {
        throw new Error("El reintento no devolvió una imagen")
      }

      setAfterUrl(url)
      setLastArtifactId(artifact.id)

      setStepResults((prev) => {
        const next = [...prev]
        const selected = selectedPreviewStep ?? Math.max(0, currentStepIndex - 1)
        if (selected >= 0 && selected < next.length) {
          next[selected] = {
            url,
            artifactId: artifact.id,
            executionId: newExecutionId,
          }
        }
        return next
      })
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return
      setError(e instanceof Error ? e.message : "Error desconocido")
    } finally {
      setIsRunningStep(false)
    }
  }

  const handleApply = async () => {
    if (!lastArtifactId) return

    setIsRunningStep(true)
    setError(null)

    try {
      const res = await AIService.applyArtifact(lastArtifactId)
      if (!res.success) {
        throw new Error(res.error || "No se pudo aplicar")
      }
      router.push("/dashboard/properties/properties")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido")
    } finally {
      setIsRunningStep(false)
    }
  }

  const handleDiscard = async () => {
    if (!lastArtifactId) return

    setIsRunningStep(true)
    setError(null)

    try {
      const res = await AIService.discardArtifact(lastArtifactId)
      if (!res.success) {
        throw new Error(res.error || "No se pudo descartar")
      }
      router.push("/dashboard/properties/properties")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido")
    } finally {
      setIsRunningStep(false)
    }
  }

  const canRunNext = steps.length > 0 && currentStepIndex < steps.length
  const isFinished = steps.length > 0 && currentStepIndex >= steps.length

  const previewStepIndex =
    selectedPreviewStep !== null
      ? selectedPreviewStep
      : currentStepIndex > 0
        ? currentStepIndex - 1
        : null

  const previewAfter = previewStepIndex !== null ? stepResults[previewStepIndex]?.url ?? null : null
  const previewBefore =
    previewStepIndex !== null && previewStepIndex > 0
      ? stepResults[previewStepIndex - 1]?.url ?? null
      : imageUrlParam

  const enhancerBaseUrl = previewAfter || afterUrl || imageUrlParam || ""

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar siteType="properties" siteId="" siteName="" currentPath={`/dashboard/properties/properties`} />
      <div className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Pipeline de mejoras IA</h1>
              <p className="text-sm text-muted-foreground">
                Revisa el análisis, ejecuta pasos sugeridos y aplica la mejor imagen final.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.back()} disabled={isRunningStep}>
                Volver
              </Button>
              <Button
                onClick={() => setEnhancerOpen(true)}
                disabled={!Number.isFinite(imageId) || !enhancerBaseUrl}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                Mejora personalizada
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="rounded-lg border p-6">
              <p className="text-sm text-muted-foreground">Cargando análisis…</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {analysis && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Puntaje:</span>
                  <span className="ml-2 font-medium">{analysis.quality_score ?? "-"}/10</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Room type:</span>
                  <span className="ml-2 font-medium">{analysis.room_type ?? "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Marketing ready:</span>
                  <span className="ml-2 font-medium">{String(analysis.marketing_ready ?? "-")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Necesita mejora:</span>
                  <span className="ml-2 font-medium">{String(analysis.needs_improvement ?? "-")}</span>
                </div>
              </div>
              {analysis.notes && (
                <p className="text-sm text-muted-foreground">{analysis.notes}</p>
              )}
            </div>
          )}

          {steps.length > 0 && (
            <div className="space-y-6">
              <div className="rounded-lg border p-4 space-y-3">
                <h2 className="font-medium">Pasos ({steps.length})</h2>
                <div className="space-y-2">
                  {steps.map((s, i) => (
                    <div
                      key={i}
                      className={`rounded-md border p-3 text-sm ${
                        i < currentStepIndex
                          ? "bg-emerald-50 border-emerald-200"
                          : i === currentStepIndex
                            ? "bg-violet-50 border-violet-200"
                            : "bg-background"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (i < currentStepIndex && stepResults[i]?.url) setSelectedPreviewStep(i)
                        }}
                        disabled={!(i < currentStepIndex && stepResults[i]?.url)}
                        className={`w-full text-left font-medium ${
                          i < currentStepIndex && stepResults[i]?.url
                            ? "hover:underline"
                            : "cursor-default"
                        }`}
                      >
                        {s.step}. {s.title}
                      </button>
                      {i === currentStepIndex && (
                        <div className="mt-2">
                          <Button
                            onClick={() => runStep(i)}
                            disabled={isRunningStep}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                          >
                            Ejecutar este paso
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {canRunNext && currentStepIndex > 0 && (
                  <div className="pt-2">
                    <Button variant="outline" onClick={handleRetryLast} disabled={isRunningStep || !lastExecutionId}>
                      Reintentar último
                    </Button>
                  </div>
                )}

                {isFinished && (
                  <div className="pt-2 space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Pipeline completo. Puedes aplicar o descartar la última imagen generada.
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleApply}
                        disabled={isRunningStep || !lastArtifactId}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Aplicar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDiscard}
                        disabled={isRunningStep || !lastArtifactId}
                      >
                        Descartar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h2 className="font-medium">Vista previa</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Antes</div>
                    <div className="relative aspect-[3/2] rounded-lg overflow-hidden bg-muted">
                      {previewBefore ? (
                        <button
                          type="button"
                          className="w-full h-full"
                          onClick={() => {
                            setLightboxSrc(previewBefore)
                            setLightboxOpen(true)
                          }}
                        >
                          <img src={previewBefore} alt="Antes" className="w-full h-full object-cover" />
                        </button>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          Ejecuta pasos para ver comparación
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Después</div>
                    <div className="relative aspect-[3/2] rounded-lg overflow-hidden bg-muted">
                      {previewAfter ? (
                        <button
                          type="button"
                          className="w-full h-full"
                          onClick={() => {
                            setLightboxSrc(previewAfter)
                            setLightboxOpen(true)
                          }}
                        >
                          <img src={previewAfter} alt="Después" className="w-full h-full object-cover" />
                        </button>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          Sin resultado aún
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLoading && steps.length === 0 && analysis && (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              El análisis no entregó pasos para ejecutar.
            </div>
          )}
          </div>
        </div>
      </div>

      {lightboxSrc && (
        <ImageLightbox
          open={lightboxOpen}
          onOpenChange={(open) => {
            setLightboxOpen(open)
            if (!open) setLightboxSrc(null)
          }}
          src={lightboxSrc}
        />
      )}

      {Number.isFinite(imageId) && enhancerBaseUrl && (
        <AIImageEnhancerModal
          open={enhancerOpen}
          onOpenChange={setEnhancerOpen}
          imageId={imageId}
          imageUrl={enhancerBaseUrl}
          onApply={(result) => {
            const baseBefore = enhancerBaseUrl
            setAfterUrl(result.url)
            setLastArtifactId(result.artifactId)
            setLastExecutionId(result.executionId)

            if (baseBefore) {
              setBeforeUrl(baseBefore)
            }

            setSelectedPreviewStep(null)

            if (propertyIdParam) {
              router.push(`/dashboard/properties/properties/edit/${encodeURIComponent(propertyIdParam)}`)
            }
          }}
        />
      )}
    </div>
  )
}
