"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AIService, type AIBillingUsage, type AIBillingWallet } from "@/services/ai.service"
import type { AIExecution } from "@/types/ai"
import { 
  Sparkles, 
  TrendingUp, 
  ImageIcon, 
  Zap,
  Search,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react"

const useAIBillingSnapshot = () => {
  const [wallet, setWallet] = useState<AIBillingWallet | null>(null)
  const [usage, setUsage] = useState<AIBillingUsage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    ;(async () => {
      try {
        const [walletRes, usageRes] = await Promise.all([
          AIService.getBillingWallet(),
          AIService.getBillingUsage(),
        ])

        if (cancelled) return

        if (!walletRes.success || !walletRes.data) {
          throw new Error(walletRes.error || "No se pudo cargar el wallet")
        }
        if (!usageRes.success || !usageRes.data) {
          throw new Error(usageRes.error || "No se pudo cargar el uso")
        }

        setWallet(walletRes.data)
        setUsage(usageRes.data)
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

  const usedCredits = useMemo(() => {
    if (!Number.isFinite(balanceCredits) || !Number.isFinite(availableCredits)) return 0
    return Math.max(0, balanceCredits - availableCredits)
  }, [balanceCredits, availableCredits])

  const usagePercentage = useMemo(() => {
    if (!Number.isFinite(balanceCredits) || balanceCredits <= 0) return 0
    return Math.min(100, (usedCredits / balanceCredits) * 100)
  }, [balanceCredits, usedCredits])

  return {
    wallet,
    usage,
    isLoading,
    error,
    availableCredits,
    balanceCredits,
    reservedCredits,
    usedCredits,
    usagePercentage,
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "description":
      return <Sparkles className="h-4 w-4" />
    case "valuation":
      return <TrendingUp className="h-4 w-4" />
    case "image":
      return <ImageIcon className="h-4 w-4" />
    default:
      return <Zap className="h-4 w-4" />
  }
}

const getExecutionIcon = (actionCode?: string) => {
  if (actionCode === "analyze_image") {
    return <Search className="h-4 w-4" />
  }
  return getTypeIcon(actionCodeToGroup(actionCode))
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case "description":
      return "Descripción"
    case "valuation":
      return "Tasación"
    case "image":
      return "Imagen"
    default:
      return type
  }
}

const actionCodeToGroup = (actionCode?: string): "description" | "valuation" | "image" => {
  switch (actionCode) {
    case "generate_description":
      return "description"
    case "appraise_property":
      return "valuation"
    case "virtual_stage_image":
    case "analyze_image":
    case "enhance_image":
    default:
      return "image"
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "description":
      return "text-amber-600 bg-amber-50"
    case "valuation":
      return "text-blue-600 bg-blue-50"
    case "image":
      return "text-violet-600 bg-violet-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
    case "pending":
      return <Clock className="h-3.5 w-3.5 text-yellow-500" />
    case "failed":
      return <AlertCircle className="h-3.5 w-3.5 text-red-500" />
    default:
      return null
  }
}

export function AICreditsUsageCard() {
  const params = useParams()
  const [selectedMonth, setSelectedMonth] = useState("enero-2024")

  const billing = useAIBillingSnapshot()

  const monthlyLimit = Number(billing.usage?.monthly_credits_limit ?? 0)
  const monthlyUsed = Number(billing.usage?.monthly_credits_used ?? 0)
  const monthlyRemaining = Number(billing.usage?.monthly_credits_remaining ?? 0)
  const monthlyCounterResetAt = billing.usage?.monthly_counter_reset_at

  const monthlyPct = useMemo(() => {
    if (!Number.isFinite(monthlyLimit) || monthlyLimit <= 0) return 0
    if (!Number.isFinite(monthlyUsed) || monthlyUsed <= 0) return 0
    return Math.min(100, (monthlyUsed / monthlyLimit) * 100)
  }, [monthlyLimit, monthlyUsed])

  const isLowCredits = monthlyPct > 80
  const isCritical = monthlyPct > 95

  const descriptionCredits = Number(billing.usage?.usage_by_action?.generate_description?.credits_consumed ?? 0)
  const valuationCredits = Number(billing.usage?.usage_by_action?.appraise_property?.credits_consumed ?? 0)
  const imagesCredits =
    Number(billing.usage?.usage_by_action?.virtual_stage_image?.credits_consumed ?? 0) +
    Number(billing.usage?.usage_by_action?.analyze_image?.credits_consumed ?? 0) +
    Number(billing.usage?.usage_by_action?.enhance_image?.credits_consumed ?? 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">Créditos IA</CardTitle>
              <CardDescription className="text-xs">Wallet del tenant</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {billing.isLoading && (
          <div className="text-xs text-muted-foreground">Cargando…</div>
        )}
        {billing.error && !billing.isLoading && (
          <div className="text-xs text-red-600">{billing.error}</div>
        )}

        {/* Monthly Credits Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Consumo mensual</span>
            <span className="font-medium">
              {monthlyUsed} / {monthlyLimit}
            </span>
          </div>
          <Progress 
            value={monthlyPct} 
            className={`h-2 ${isCritical ? '[&>div]:bg-red-500' : isLowCredits ? '[&>div]:bg-yellow-500' : ''}`}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {monthlyRemaining} créditos disponibles
            </span>
            {isLowCredits && (
              <Badge variant={isCritical ? "destructive" : "outline"} className="text-[10px] h-5">
                {isCritical ? "Crítico" : "Bajo"}
              </Badge>
            )}
          </div>
        </div>

        {/* Usage by Type */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
          {/* Descriptions */}
          <div className="p-2 sm:p-3 rounded-lg bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-[10px] sm:text-xs font-medium text-amber-700">Descripciones</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-amber-900">
              {descriptionCredits} créditos
            </div>
            <div className="text-[10px] text-amber-600">
              {billing.usage?.usage_by_action?.generate_description?.actions_today ?? 0} hoy
            </div>
            <Progress 
              value={monthlyLimit ? (descriptionCredits / monthlyLimit) * 100 : 0} 
              className="h-1 mt-2 [&>div]:bg-amber-500"
            />
          </div>

          {/* Valuations */}
          <div className="p-2 sm:p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-[10px] sm:text-xs font-medium text-blue-700">Tasaciones</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-blue-900">
              {valuationCredits} créditos
            </div>
            <div className="text-[10px] text-blue-600">
              {billing.usage?.usage_by_action?.appraise_property?.actions_today ?? 0} hoy
            </div>
            <Progress 
              value={monthlyLimit ? (valuationCredits / monthlyLimit) * 100 : 0} 
              className="h-1 mt-2 [&>div]:bg-blue-500"
            />
          </div>

          {/* Images */}
          <div className="p-2 sm:p-3 rounded-lg bg-violet-50 border border-violet-100">
            <div className="flex items-center gap-1.5 mb-2">
              <ImageIcon className="h-3.5 w-3.5 text-violet-600" />
              <span className="text-[10px] sm:text-xs font-medium text-violet-700">Imágenes</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-violet-900">
              {imagesCredits} créditos
            </div>
            <div className="text-[10px] text-violet-600">
              {(billing.usage?.usage_by_action?.virtual_stage_image?.actions_today ?? 0) +
                (billing.usage?.usage_by_action?.analyze_image?.actions_today ?? 0) +
                (billing.usage?.usage_by_action?.enhance_image?.actions_today ?? 0)}{" "}
              hoy
            </div>
            <Progress 
              value={monthlyLimit ? (imagesCredits / monthlyLimit) * 100 : 0} 
              className="h-1 mt-2 [&>div]:bg-violet-500"
            />
          </div>
        </div>


        {/* Reset date */}
        <div className="text-center text-[10px] sm:text-xs text-muted-foreground pt-1 border-t">
          {monthlyCounterResetAt
            ? `Los contadores se reinician el ${new Date(monthlyCounterResetAt).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}`
            : "Sin fecha de reinicio"}
        </div>
      </CardContent>
    </Card>
  )
}

export function AICreditsHistoryCard() {
  const [executions, setExecutions] = useState<AIExecution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    ;(async () => {
      try {
        const res = await AIService.listExecutions()
        if (cancelled) return
        if (!res.success || !res.data) {
          throw new Error(res.error || "No se pudo cargar el historial")
        }
        setExecutions(res.data)
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

  const normalizedStatus = (status?: string) => {
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Historial de Uso IA</CardTitle>
            <CardDescription className="text-xs">Últimas generaciones</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-8" asChild>
            <Link href={`/dashboard/properties/properties/ai-credits`}>
              Ver todo
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading && <div className="text-xs text-muted-foreground">Cargando…</div>}
          {error && !isLoading && <div className="text-xs text-red-600">{error}</div>}

          {!error && !isLoading && executions.length === 0 && (
            <div className="text-xs text-muted-foreground">Sin registros disponibles</div>
          )}

          {!error && !isLoading && executions.slice(0, 5).map((ex) => (
            <div
              key={ex.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`p-1.5 rounded-md ${getTypeColor(actionCodeToGroup(ex.action_code))}`}>
                {getExecutionIcon(ex.action_code)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {ex.action_name || getTypeLabel(ex.action_code || "")}
                  </span>
                  {getStatusIcon(normalizedStatus(ex.status))}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                    {getTypeLabel(actionCodeToGroup(ex.action_code))}
                  </Badge>
                  <span>
                    {ex.created_at ? new Date(ex.created_at).toLocaleString("es-CL") : ""}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">-{Number(ex.credits_consumed ?? 0)}</span>
                <p className="text-[10px] text-muted-foreground">créditos</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function AICreditsCompactCard() {
  const params = useParams()
  const siteId = params?.id as string
  const billing = useAIBillingSnapshot()
  const remainingCredits = Math.max(0, billing.availableCredits)
  const isLowCredits = billing.usagePercentage > 80

  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
      <Link href={`/dashboard/properties/properties/ai-credits`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Créditos IA</CardTitle>
          <Zap className={`h-4 w-4 ${isLowCredits ? 'text-yellow-500' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
        <div className="text-2xl font-bold">{remainingCredits}</div>
        <Progress 
          value={billing.usagePercentage} 
          className={`h-1.5 mt-2 ${isLowCredits ? '[&>div]:bg-yellow-500' : ''}`}
        />
        </CardContent>
      </Link>
    </Card>
  )
}
