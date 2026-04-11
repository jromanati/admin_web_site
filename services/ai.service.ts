import { apiClient, type ApiResponse } from "@/lib/api"
import type {
  AIAction,
  AIArtifact,
  AIArtifactApplyResponse,
  AIArtifactDiscardResponse,
  AIApiError,
  AIExecution,
  AIExecutionStatus,
  AIRegenerateResponse,
  AIStartResponse,
} from "@/types/ai"

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const id = setTimeout(() => resolve(), ms)

    if (signal) {
      const onAbort = () => {
        clearTimeout(id)
        reject(new DOMException("Aborted", "AbortError"))
      }
      if (signal.aborted) return onAbort()
      signal.addEventListener("abort", onAbort, { once: true })
    }
  })

const toAIApiError = (res: ApiResponse<any>): AIApiError => {
  const status = res.status
  const payload = res.data

  if (status === 402) {
    return {
      code: "INSUFFICIENT_CREDITS",
      status,
      message: (payload && payload.error) || res.error || "Insufficient credits",
      payload,
    }
  }

  if (status === 429) {
    return {
      code: "RATE_LIMIT",
      status,
      message: (payload && payload.error) || res.error || "Rate limit exceeded",
      payload,
    }
  }

  return {
    code: status ? "HTTP_ERROR" : "UNKNOWN",
    status,
    message: res.error || "Unknown error",
    payload,
  }
}

export interface PollExecutionOptions {
  timeoutMs?: number
  backoffMs?: number[]
  signal?: AbortSignal
}

export type AIBillingWallet = {
  balance: string
  reserved: string
  available: string
}

export type AIBillingUsage = {
  actions_today: number
  max_actions_per_day: number
  parallel_jobs_active: number
  max_parallel_jobs: number
  cost_today_usd: string
  max_daily_cost_usd: string
  counter_reset_at: string
  monthly_counter_reset_at: string

  credits_consumed_total?: string
  cost_total_usd?: string
  executions_total?: number

  monthly_credits_limit?: string
  monthly_credits_used?: string
  monthly_credits_remaining?: string

  usage_by_action: Record<
    string,
    {
      actions_today: number
      cost_today_usd: string
      credits_consumed?: string
    }
  >
}

export class AIService {
  static async listActions(): Promise<ApiResponse<AIAction[]>> {
    return apiClient.get<AIAction[]>("ai/actions/")
  }

  static async listExecutions(): Promise<ApiResponse<AIExecution[]>> {
    return apiClient.get<AIExecution[]>("ai/executions/")
  }

  static async getExecution(executionId: string): Promise<ApiResponse<AIExecution>> {
    return apiClient.get<AIExecution>(`ai/executions/${executionId}/`)
  }

  static async regenerateExecution(executionId: string): Promise<ApiResponse<AIRegenerateResponse>> {
    return apiClient.post<AIRegenerateResponse>(`ai/executions/${executionId}/regenerate/`)
  }

  static async getArtifact(artifactId: string): Promise<ApiResponse<AIArtifact>> {
    return apiClient.get<AIArtifact>(`ai/artifacts/${artifactId}/`)
  }

  static async applyArtifact(
    artifactId: string
  ): Promise<ApiResponse<AIArtifactApplyResponse>> {
    return apiClient.post<AIArtifactApplyResponse>(`ai/artifacts/${artifactId}/apply/`)
  }

  static async discardArtifact(
    artifactId: string
  ): Promise<ApiResponse<AIArtifactDiscardResponse>> {
    return apiClient.post<AIArtifactDiscardResponse>(`ai/artifacts/${artifactId}/discard/`)
  }

  static async getBillingWallet(): Promise<ApiResponse<AIBillingWallet>> {
    return apiClient.get<AIBillingWallet>("ai/billing/wallet/")
  }

  static async getBillingUsage(): Promise<ApiResponse<AIBillingUsage>> {
    return apiClient.get<AIBillingUsage>("ai/billing/usage/")
  }

  static async startGenerateDescription(propertyId: number): Promise<ApiResponse<AIStartResponse>> {
    return apiClient.post<AIStartResponse>(
      `ai/real-estate/properties/${propertyId}/generate-description/`
    )
  }

  static async startAppraiseProperty(propertyId: number): Promise<ApiResponse<AIStartResponse>> {
    return apiClient.post<AIStartResponse>(`ai/real-estate/properties/${propertyId}/appraise/`)
  }

  static async startEnhanceImage(
    imageId: number,
    body: { scale: number }
  ): Promise<ApiResponse<AIStartResponse>> {
    return apiClient.post<AIStartResponse>(`ai/real-estate/images/${imageId}/enhance/`, body)
  }

  static async startAnalyzeImage(
    imageId: number,
    body?: { room_type?: string }
  ): Promise<ApiResponse<AIStartResponse>> {
    return apiClient.post<AIStartResponse>(`ai/real-estate/images/${imageId}/analyze/`, body)
  }

  static async startVirtualStage(
    imageId: number,
    body: Record<string, unknown>
  ): Promise<ApiResponse<AIStartResponse>> {
    return apiClient.post<AIStartResponse>(`ai/real-estate/images/${imageId}/virtual-stage/`, body)
  }

  static async pollExecution(
    executionId: string,
    options: PollExecutionOptions = {}
  ): Promise<AIExecution> {
    const timeoutMs = options.timeoutMs ?? 2 * 60 * 1000
    const backoffMs = options.backoffMs ?? [1000, 2000, 3000, 5000]
    const signal = options.signal

    const startedAt = Date.now()

    let attempt = 0
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError")
      }

      const elapsed = Date.now() - startedAt
      if (elapsed > timeoutMs) {
        throw new Error("AI polling timeout")
      }

      const res = await apiClient.get<AIExecution>(`ai/executions/${executionId}/`, undefined, {
        signal,
      })
      if (!res.success || !res.data) {
        throw toAIApiError(res)
      }

      const execution = res.data
      if (execution.status === "completed") {
        return execution
      }

      if (execution.status === "failed") {
        throw {
          code: "HTTP_ERROR",
          status: 200,
          message: execution.error_message || "AI execution failed",
          payload: execution,
        } satisfies AIApiError
      }

      if (execution.status === "cancelled") {
        throw {
          code: "HTTP_ERROR",
          status: 200,
          message: "AI execution cancelled",
          payload: execution,
        } satisfies AIApiError
      }

      const delay = backoffMs[Math.min(attempt, backoffMs.length - 1)]
      attempt += 1
      await sleep(delay, signal)
    }
  }
}

export const isFinalExecutionStatus = (status: AIExecutionStatus) =>
  status === "completed" || status === "failed" || status === "cancelled"
