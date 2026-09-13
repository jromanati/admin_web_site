// EventHub types for event profile management

export interface EventProfile {
  id?: number
  title: string
  description?: string
  date: string // YYYY-MM-DD format
  start_time: string // HH:MM:SS format
  end_time: string // HH:MM:SS format
  location_name?: string
  location_address?: string
  celebrant_name?: string
  public_token?: string // readonly, auto-generated
  status?: EventStatus
  settings?: Record<string, any>
  created_at?: string // readonly, ISO 8601
  updated_at?: string // readonly, ISO 8601
}

export enum EventStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface EventProfileListResponse {
  count: number
  next: string | null
  previous: string | null
  results: EventProfile[]
}

export interface CreateEventProfileRequest {
  title: string
  description?: string
  date: string
  start_time: string
  end_time: string
  location_name?: string
  location_address?: string
  celebrant_name?: string
  status?: EventStatus
  settings?: Record<string, any>
}

export interface UpdateEventProfileRequest {
  title: string
  description?: string
  date: string
  start_time: string
  end_time: string
  location_name?: string
  location_address?: string
  celebrant_name?: string
  status?: EventStatus
  settings?: Record<string, any>
}

export interface PatchEventProfileRequest {
  title?: string
  description?: string
  date?: string
  start_time?: string
  end_time?: string
  location_name?: string
  location_address?: string
  celebrant_name?: string
  status?: EventStatus
  settings?: Record<string, any>
}
