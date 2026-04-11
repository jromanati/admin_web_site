"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIService, type AIBillingUsage, type AIBillingWallet } from "@/services/ai.service"
import type { AIExecution } from "@/types/ai"
import { 
  Sparkles, 
  TrendingUp, 
  ImageIcon, 
  Zap,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Download,
  Calendar,
  CreditCard,
  ArrowUpRight,
  Filter
} from "lucide-react"

interface AICreditsFullPageProps {
  siteId: string
}

interface HistoryItem {
  id: string
  type: "description" | "valuation" | "image"
  actionCode?: string
  property: string
  propertyId: string
  credits: number
  date: string
  status: "success" | "pending" | "failed"
  details?: string
}

const actionToHistoryType = (actionCode?: string): HistoryItem["type"] => {
  switch (actionCode) {
    case "generate_description":
      return "description"
    case "appraise_property":
      return "valuation"
    case "virtual_stage_image":
    case "analyze_image":
    default:
      return "image"
  }
}

const getExecutionStatusLabel = (status?: string) => {
  switch (status) {
    case "pending":
      return "Pendiente"
    case "queued":
      return "En cola"
    case "processing":
      return "Procesando"
    case "completed":
      return "Completado"
    case "failed":
      return "Fallido"
    case "cancelled":
      return "Cancelado"
    default:
      return status || "-"
  }
}

const renderExecutionResult = (execution: AIExecution) => {
  const artifacts = execution.artifacts ?? []
  const firstArtifact = artifacts[0]

  const renderObjectAsDetails = (obj: unknown) => {
    if (!obj || typeof obj !== "object") return null
    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length === 0) return null

    return (
      <div className="space-y-2">
        {entries.map(([k, v]) => (
          <div key={k} className="grid grid-cols-1 sm:grid-cols-3 gap-1">
            <div className="text-xs font-medium text-muted-foreground">{k}</div>
            <div className="sm:col-span-2 text-sm whitespace-pre-wrap break-words">
              {typeof v === "string" ? v : JSON.stringify(v)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderAppraiseResult = (content: unknown) => {
    if (!content || typeof content !== "object") {
      return <div className="text-xs text-muted-foreground">Sin resultado</div>
    }

    const obj = content as Record<string, unknown>
    const labelMap: Record<string, string> = {
      operation: "Operación",
      disclaimer: "Disclaimer",
      currency_base: "Moneda base",
      price_uf: "Precio en UF",
      price_uf_low: "Precio en UF (mínimo)",
      price_uf_high: "Precio en UF (máximo)",
      price_clp: "Precio en CLP",
      price_clp_low: "Precio en CLP (mínimo)",
      price_clp_high: "Precio en CLP (máximo)",
      price_usd: "Precio en USD",
      price_usd_low: "Precio en USD (mínimo)",
      price_usd_high: "Precio en USD (máximo)",
      estimated_price_uf: "Precio estimado en UF",
      estimated_price_clp: "Precio estimado en CLP",
      price_per_sqm_uf: "Precio por m² (UF)",
      price_per_sqm_clp: "Precio por m² (CLP)",
      confidence: "Confianza",
      main_factors: "Factores principales",
      notes: "Notas",
    }

    const renderValue = (key: string, value: unknown) => {
      if (key === "main_factors" && Array.isArray(value)) {
        return (
          <div className="text-sm">
            <ul className="list-disc pl-5 space-y-1">
              {value.map((v, idx) => (
                <li key={idx}>
                  {typeof v === "string" ? v : JSON.stringify(v)}
                </li>
              ))}
            </ul>
          </div>
        )
      }

      if (typeof value === "string" || typeof value === "number") {
        return <div className="text-sm whitespace-pre-wrap break-words">{String(value)}</div>
      }

      if (value == null) {
        return <div className="text-sm text-muted-foreground">-</div>
      }

      return <div className="text-sm whitespace-pre-wrap break-words">{JSON.stringify(value)}</div>
    }

    const keys = Object.keys(obj)
    if (keys.length === 0) return <div className="text-xs text-muted-foreground">Sin resultado</div>

    return (
      <div className="space-y-3">
        {keys.map((key) => (
          <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-1">
            <div className="text-xs font-medium text-muted-foreground">
              {labelMap[key] ?? key}
            </div>
            <div className="sm:col-span-2">{renderValue(key, obj[key])}</div>
          </div>
        ))}
      </div>
    )
  }

  const renderAnalyzeImageResult = (content: unknown) => {
    if (!content || typeof content !== "object") {
      return <div className="text-xs text-muted-foreground">Pendiente</div>
    }

    const obj = content as Record<string, unknown>
    const notes = obj.notes
    const steps = obj.steps

    return (
      <div className="space-y-4">
        <div>
          <div className="text-xs font-medium text-muted-foreground">Análisis</div>
          <div className="mt-1 text-sm whitespace-pre-wrap break-words">
            {typeof notes === "string" ? notes : notes != null ? JSON.stringify(notes) : "-"}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-muted-foreground">Pasos</div>
          <div className="mt-2 space-y-2">
            {Array.isArray(steps) && steps.length > 0 ? (
              steps.map((s, idx) => {
                const stepObj = (s || {}) as Record<string, unknown>
                const title = stepObj.title
                return (
                  <div key={idx} className="rounded-md border bg-muted/20 p-2">
                    <div className="text-xs text-muted-foreground">Título</div>
                    <div className="text-sm font-medium">
                      {typeof title === "string" ? title : title != null ? JSON.stringify(title) : "-"}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-xs text-muted-foreground">-</div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (execution.action_code === "virtual_stage_image") {
    const beforeUrl = (execution.input_data as any)?.image_url as string | undefined
    const afterUrl = artifacts.find((a) => a.artifact_type === "image")?.content as string | undefined

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Antes</div>
          {beforeUrl ? (
            <img src={beforeUrl} alt="Antes" className="w-full rounded-md border object-contain max-h-[55vh]" />
          ) : (
            <div className="text-xs text-muted-foreground">Pendiente</div>
          )}
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Después</div>
          {afterUrl ? (
            <img src={afterUrl} alt="Después" className="w-full rounded-md border object-contain max-h-[55vh]" />
          ) : (
            <div className="text-xs text-muted-foreground">Pendiente</div>
          )}
        </div>
      </div>
    )
  }

  if (execution.action_code === "generate_description") {
    const text = (firstArtifact?.content as string | undefined) ?? ""
    return (
      <div className="whitespace-pre-wrap text-sm">
        {text || "Pendiente"}
      </div>
    )
  }

  if (execution.action_code === "appraise_property") {
    const content = firstArtifact?.content
    if (!content) return <div className="text-xs text-muted-foreground">Pendiente</div>

    if (typeof content === "string") {
      return <div className="whitespace-pre-wrap text-sm">{content}</div>
    }

    return renderAppraiseResult(content)
  }

  if (execution.action_code === "analyze_image") {
    const content = firstArtifact?.content
    if (!content) return <div className="text-xs text-muted-foreground">Pendiente</div>

    if (typeof content === "string") {
      return <div className="whitespace-pre-wrap text-sm">{content}</div>
    }

    return renderAnalyzeImageResult(content)
  }

  if (artifacts.length === 0) {
    return <div className="text-xs text-muted-foreground">Sin resultado</div>
  }

  return (
    <div className="space-y-2">
      {artifacts.map((a) => (
        <div key={a.id} className="rounded-md bg-muted/30 p-2 text-xs">
          <div className="font-medium">{a.artifact_type}</div>
          <div className="mt-1 text-muted-foreground">
            {a.artifact_type === "image" ? "Pendiente" : JSON.stringify(a.content ?? null)}
          </div>
        </div>
      ))}
    </div>
  )
}

const executionToHistoryStatus = (status?: string): HistoryItem["status"] => {
  switch (status) {
    case "completed":
      return "success"
    case "failed":
    case "cancelled":
      return "failed"
    case "pending":
    case "queued":
    case "processing":
    default:
      return "pending"
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "description": return <Sparkles className="h-4 w-4" />
    case "valuation": return <TrendingUp className="h-4 w-4" />
    case "image": return <ImageIcon className="h-4 w-4" />
    default: return <Zap className="h-4 w-4" />
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case "description": return "Descripción"
    case "valuation": return "Tasación"
    case "image": return "Imagen"
    default: return type
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "description": return "text-amber-600 bg-amber-50 border-amber-200"
    case "valuation": return "text-blue-600 bg-blue-50 border-blue-200"
    case "image": return "text-violet-600 bg-violet-50 border-violet-200"
    default: return "text-gray-600 bg-gray-50 border-gray-200"
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50"><CheckCircle2 className="h-3 w-3 mr-1" />Exitoso</Badge>
    case "pending":
      return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>
    case "failed":
      return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50"><AlertCircle className="h-3 w-3 mr-1" />Fallido</Badge>
    default:
      return null
  }
}

export function AICreditsFullPage({ siteId }: AICreditsFullPageProps) {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState("enero-2024")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [historyPage, setHistoryPage] = useState(1)

  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null)
  const [executionDetail, setExecutionDetail] = useState<AIExecution | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const [wallet, setWallet] = useState<AIBillingWallet | null>(null)
  const [usage, setUsage] = useState<AIBillingUsage | null>(null)
  const [executions, setExecutions] = useState<AIExecution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    ;(async () => {
      try {
        const [walletRes, usageRes, executionsRes] = await Promise.all([
          AIService.getBillingWallet(),
          AIService.getBillingUsage(),
          AIService.listExecutions(),
        ])

        if (cancelled) return

        if (!walletRes.success || !walletRes.data) {
          throw new Error(walletRes.error || "No se pudo cargar el wallet")
        }
        if (!usageRes.success || !usageRes.data) {
          throw new Error(usageRes.error || "No se pudo cargar el uso")
        }

        if (!executionsRes.success || !executionsRes.data) {
          throw new Error(executionsRes.error || "No se pudo cargar el historial")
        }

        setWallet(walletRes.data)
        setUsage(usageRes.data)
        setExecutions(executionsRes.data)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Error desconocido")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const availableCredits = useMemo(() => Number(wallet?.available ?? 0), [wallet?.available])
  const balanceCredits = useMemo(() => Number(wallet?.balance ?? 0), [wallet?.balance])
  const reservedCredits = useMemo(() => Number(wallet?.reserved ?? 0), [wallet?.reserved])

  const monthlyLimit = useMemo(() => Number(usage?.monthly_credits_limit ?? 0), [usage?.monthly_credits_limit])
  const monthlyUsed = useMemo(() => Number(usage?.monthly_credits_used ?? 0), [usage?.monthly_credits_used])
  const monthlyRemaining = useMemo(() => Number(usage?.monthly_credits_remaining ?? 0), [usage?.monthly_credits_remaining])

  const monthlyPct = useMemo(() => {
    if (!Number.isFinite(monthlyLimit) || monthlyLimit <= 0) return 0
    if (!Number.isFinite(monthlyUsed) || monthlyUsed <= 0) return 0
    return Math.min(100, (monthlyUsed / monthlyLimit) * 100)
  }, [monthlyLimit, monthlyUsed])

  const usagePercentage = useMemo(() => {
    if (!wallet) return 0
    if (!Number.isFinite(balanceCredits) || balanceCredits <= 0) return 0
    const used = Math.max(0, balanceCredits - availableCredits)
    return Math.min(100, (used / balanceCredits) * 100)
  }, [wallet, balanceCredits, availableCredits])

  const remainingCredits = useMemo(() => {
    if (!Number.isFinite(availableCredits)) return 0
    return Math.max(0, availableCredits)
  }, [availableCredits])

  const isLowCredits = usagePercentage > 80
  const isCritical = usagePercentage > 95

  const historyItems = useMemo<HistoryItem[]>(() => {
    return (executions || []).map((ex) => {
      const actionLabel = ex.action_name || getTypeLabel(actionToHistoryType(ex.action_code))

      return {
        id: ex.id,
        type: actionToHistoryType(ex.action_code),
        actionCode: ex.action_code,
        property: actionLabel,
        propertyId: String(ex.target_object_id ?? ""),
        credits: Number(ex.credits_consumed ?? 0),
        date: ex.created_at ? new Date(ex.created_at).toLocaleString("es-CL") : "",
        status: executionToHistoryStatus(ex.status),
        details: undefined,
      }
    })
  }, [executions])

  const filteredHistory = useMemo(() => {
    return historyItems.filter((item) => {
      if (filterType !== "all" && item.type !== filterType) return false
      if (filterStatus !== "all" && item.status !== filterStatus) return false
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const haystack = `${item.property} ${getTypeLabel(item.type)}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [historyItems, filterType, filterStatus, searchQuery])

  const pageSize = 10
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredHistory.length / pageSize))
  }, [filteredHistory.length])

  const pagedHistory = useMemo(() => {
    const start = (historyPage - 1) * pageSize
    return filteredHistory.slice(start, start + pageSize)
  }, [filteredHistory, historyPage])

  useEffect(() => {
    setHistoryPage(1)
  }, [searchQuery, filterType, filterStatus])

  const openExecutionDetail = async (executionId: string) => {
    setSelectedExecutionId(executionId)
    setExecutionDetail(null)
    setDetailError(null)
    setIsDetailOpen(true)
    setIsLoadingDetail(true)

    try {
      const res = await AIService.getExecution(executionId)
      if (!res.success || !res.data) {
        throw new Error(res.error || "No se pudo cargar el detalle")
      }
      setExecutionDetail(res.data)
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : "Error desconocido")
    } finally {
      setIsLoadingDetail(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push(`/dashboard/properties`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button> */}
          {/* <div>
            <h1 className="text-2xl font-bold tracking-tight">Créditos IA</h1>
            
          </div> */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold tracking-tight">Créditos IA</h2>
            <p className="text-muted-foreground text-sm">Gestiona tu consumo de herramientas de inteligencia artificial</p>
        </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
            <CreditCard className="h-4 w-4 mr-2" />
            Comprar créditos
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">Cargando consumo…</CardContent>
          </Card>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-sm text-red-700">{error}</CardContent>
          </Card>
        </div>
      )}

      {/* Plan Overview */}
      <div className="p-6 space-y-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Créditos IA</CardTitle>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Cambiar plan
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {monthlyUsed} / {monthlyLimit}
                </span>
              </div>
              <Progress 
                value={monthlyPct} 
                className={`h-3 ${isCritical ? '[&>div]:bg-red-500' : isLowCredits ? '[&>div]:bg-yellow-500' : '[&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-purple-500'}`}
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {usage?.counter_reset_at ? (
                    <>Se reinicia el {new Date(usage.counter_reset_at).toLocaleDateString("es-CL", { day: "numeric", month: "long" })}</>
                  ) : (
                    <>Sin fecha de reinicio</>
                  )}
                </span>
                {isLowCredits && (
                  <Badge variant={isCritical ? "destructive" : "secondary"}>
                    {isCritical ? "Créditos críticos" : "Créditos bajos"}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-violet-600">{remainingCredits}</div>
            <p className="text-xs text-muted-foreground mt-1">créditos restantes</p>
            <div className="mt-3 pt-3 border-t">
              {reservedCredits > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Reservados: {reservedCredits}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Este mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{monthlyUsed}</div>
            <p className="text-xs text-muted-foreground mt-1">créditos consumidos</p>
            <div className="mt-3 pt-3 border-t space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-amber-600">
                  <Sparkles className="h-3 w-3" /> Descripciones
                </span>
                <span className="font-medium">{Number(usage?.usage_by_action?.generate_description?.credits_consumed ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-blue-600">
                  <TrendingUp className="h-3 w-3" /> Tasaciones
                </span>
                <span className="font-medium">{Number(usage?.usage_by_action?.appraise_property?.credits_consumed ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-violet-600">
                  <ImageIcon className="h-3 w-3" /> Imágenes
                </span>
                <span className="font-medium">
                  {Number(usage?.usage_by_action?.virtual_stage_image?.credits_consumed ?? 0) +
                    Number(usage?.usage_by_action?.enhance_image?.credits_consumed ?? 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage by Type - Detailed */}
      <div className="p-6 space-y-6">
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-white">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Sparkles className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base">Descripciones</CardTitle>
                <CardDescription className="text-xs">Acciones en el rango reportado por backend</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <div className="text-3xl font-bold text-amber-700">{Number(usage?.usage_by_action?.generate_description?.credits_consumed ?? 0)}</div>
              <div className="text-sm text-muted-foreground">{usage?.usage_by_action?.generate_description?.actions_today ?? 0} hoy</div>
            </div>
            <Progress 
              value={monthlyLimit ? (Number(usage?.usage_by_action?.generate_description?.credits_consumed ?? 0) / monthlyLimit) * 100 : 0} 
              className="h-2 [&>div]:bg-amber-500"
            />
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Tasaciones</CardTitle>
                <CardDescription className="text-xs">Acciones en el rango reportado por backend</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <div className="text-3xl font-bold text-blue-700">{Number(usage?.usage_by_action?.appraise_property?.credits_consumed ?? 0)}</div>
              <div className="text-sm text-muted-foreground">{usage?.usage_by_action?.appraise_property?.actions_today ?? 0} hoy</div>
            </div>
            <Progress 
              value={monthlyLimit ? (Number(usage?.usage_by_action?.appraise_property?.credits_consumed ?? 0) / monthlyLimit) * 100 : 0} 
              className="h-2 [&>div]:bg-blue-500"
            />
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-slate-50/50 to-white">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Search className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-base">Análisis de imágenes</CardTitle>
                <CardDescription className="text-xs">Consumo en créditos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <div className="text-3xl font-bold text-slate-700">{Number(usage?.usage_by_action?.analyze_image?.credits_consumed ?? 0)}</div>
              <div className="text-sm text-muted-foreground">{usage?.usage_by_action?.analyze_image?.actions_today ?? 0} hoy</div>
            </div>
            <Progress
              value={monthlyLimit ? (Number(usage?.usage_by_action?.analyze_image?.credits_consumed ?? 0) / monthlyLimit) * 100 : 0}
              className="h-2 [&>div]:bg-slate-500"
            />
          </CardContent>
        </Card>

        <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-white">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-violet-100 rounded-lg">
                <ImageIcon className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-base">Imágenes</CardTitle>
                <CardDescription className="text-xs">Acciones en el rango reportado por backend</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <div className="text-3xl font-bold text-violet-700">{Number(usage?.usage_by_action?.virtual_stage_image?.credits_consumed ?? 0)}</div>
              <div className="text-sm text-muted-foreground">{usage?.usage_by_action?.virtual_stage_image?.actions_today ?? 0} hoy</div>
            </div>
            <Progress 
              value={monthlyLimit ? (Number(usage?.usage_by_action?.virtual_stage_image?.credits_consumed ?? 0) / monthlyLimit) * 100 : 0} 
              className="h-2 [&>div]:bg-violet-500"
            />
          </CardContent>
        </Card>
      </div>

      {/* History Section */}
      <div className="p-6 space-y-6">
        <Card >
            <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                <CardTitle>Historial de consumo</CardTitle>
                <CardDescription>Detalle de todas las generaciones realizadas</CardDescription>
                </div>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-[160px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="enero-2024">Enero 2024</SelectItem>
                    <SelectItem value="diciembre-2023">Diciembre 2023</SelectItem>
                    <SelectItem value="noviembre-2023">Noviembre 2023</SelectItem>
                    <SelectItem value="octubre-2023">Octubre 2023</SelectItem>
                </SelectContent>
                </Select>
            </div>
            </CardHeader>
            <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por tipo o acción..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
                </div>
                <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="description">Descripciones</SelectItem>
                    <SelectItem value="valuation">Tasaciones</SelectItem>
                    <SelectItem value="image">Imágenes</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="success">Exitoso</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="failed">Fallido</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block rounded-lg border overflow-hidden">
                <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                    <TableHead>Tipo</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Créditos</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pagedHistory.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => openExecutionDetail(item.id)}
                    >
                        <TableCell>
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(item.type)}`}>
                            {item.actionCode === "analyze_image" ? <Search className="h-4 w-4" /> : getTypeIcon(item.type)}
                            {getTypeLabel(item.type)}
                        </div>
                        </TableCell>
                        <TableCell className="font-medium">{item.property}</TableCell>
                        <TableCell className="text-sm">{item.date}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right font-semibold">-{item.credits}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {pagedHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border rounded-lg space-y-2 cursor-pointer"
                  onClick={() => openExecutionDetail(item.id)}
                >
                    <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(item.type)}`}>
                        {item.actionCode === "analyze_image" ? <Search className="h-4 w-4" /> : getTypeIcon(item.type)}
                        {getTypeLabel(item.type)}
                    </div>
                    {getStatusBadge(item.status)}
                    </div>
                    <div>
                    <p className="font-medium text-sm">{item.property}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>{item.date}</span>
                    <span className="font-semibold text-foreground">-{item.credits} créditos</span>
                    </div>
                </div>
                ))}
            </div>

            {filteredHistory.length > 0 && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-xs text-muted-foreground">
                  Página {historyPage} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    disabled={historyPage <= 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
                    disabled={historyPage >= totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {filteredHistory.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No se encontraron registros</p>
                <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                </div>
            )}
            </CardContent>
        </Card>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent
          className={`max-h-[90vh] overflow-y-auto ${
            executionDetail?.action_code === "virtual_stage_image"
              ? "!w-[96vw] !max-w-[1800px]"
              : "!w-[92vw] !max-w-[980px]"
          }`}
        >
          <DialogHeader>
            <DialogTitle>Detalle de ejecución</DialogTitle>
          </DialogHeader>

          {isLoadingDetail && (
            <div className="text-sm text-muted-foreground">Cargando…</div>
          )}

          {detailError && !isLoadingDetail && (
            <div className="text-sm text-red-600">{detailError}</div>
          )}

          {!detailError && !isLoadingDetail && executionDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Acción</div>
                  <div className="font-medium">
                    {executionDetail.action_name || getTypeLabel(actionToHistoryType(executionDetail.action_code))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Estado</div>
                  <div className="font-medium">{getExecutionStatusLabel(executionDetail.status)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Créditos</div>
                  <div className="font-medium">{executionDetail.credits_consumed ?? "0"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Duración</div>
                  <div className="font-medium">
                    {executionDetail.duration_seconds != null ? `${executionDetail.duration_seconds}s` : "-"}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground mb-2">Resultado</div>
                {renderExecutionResult(executionDetail)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Monthly Comparison */}
      <div className="p-6 space-y-6">
        <Card>
            <CardHeader>
            <CardTitle>Comparativa mensual</CardTitle>
            <CardDescription>Evolución de consumo en los últimos meses</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Comparativa mensual pendiente: requiere endpoint de historial/ledger o ejecuciones filtrables.
              </div>
            </div>
            </CardContent>
        </Card>
        </div>
    </div>
  )
}
