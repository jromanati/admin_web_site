export type AIExecutionStatus =
  | "pending"
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"

export type AIArtifactStatus = "pending" | "applied" | "discarded"

export type AIArtifactType = "text" | "json" | "image"

export type AIArtifactStorageType = "database" | "cloudinary"

export interface AIAction {
  id: number
  code: string
  name: string
  description?: string
  provider?: string
  target_model?: string
  model_id?: string
  is_active?: boolean
}

export interface AIArtifact {
  id: string
  execution_id: string
  artifact_type: AIArtifactType
  storage_type: AIArtifactStorageType
  status: AIArtifactStatus
  content: unknown
  applied_to_field?: string
  applied_at?: string | null
  discarded_at?: string | null
  metadata?: Record<string, unknown>
  created_at?: string
}

export interface AIExecution {
  id: string
  action_code: string
  action_name?: string
  status: AIExecutionStatus
  target_model_name?: string
  target_object_id?: number
  input_data?: Record<string, unknown>
  error_message?: string
  error_code?: string
  regeneration_count?: number
  provider?: string
  model_used?: string
  actual_cost_usd?: string
  tokens_input?: number
  tokens_output?: number
  duration_seconds?: number
  credits_reserved?: string
  credits_consumed?: string
  created_at?: string
  started_at?: string | null
  completed_at?: string | null
  artifacts?: AIArtifact[]
}

export interface AIStartResponse {
  execution_id: string
  status: AIExecutionStatus
  message?: string
}

export interface AIRegenerateResponse {
  execution_id: string
  status: AIExecutionStatus
  regeneration_count?: number
  message?: string
}

export interface AIArtifactApplyResponse {
  message: string
  artifact_id: string
  applied_to_field?: string
}

export interface AIArtifactDiscardResponse {
  message: string
  artifact_id: string
}

export interface AICreditsErrorPayload {
  error?: string
  required?: number
  available?: number
}

export interface AIRateLimitErrorPayload {
  error?: string
  limit_type?: string
  limit_value?: number
  current_value?: number
}

export type AIApiErrorPayload = unknown

export type AIApiErrorCode =
  | "INSUFFICIENT_CREDITS"
  | "RATE_LIMIT"
  | "HTTP_ERROR"
  | "UNKNOWN"

export interface AIApiError {
  code: AIApiErrorCode
  status?: number
  message: string
  payload?: AIApiErrorPayload
}
