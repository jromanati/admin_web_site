export interface StreamingManagerProps {
  siteId: string
}

export interface StreamConfig {
  id: number
  name: string
  stream_url: string
  stream_key: string
  is_active: boolean
}

export interface ScheduledStream {
  id: string
  title: string
  description: string
  scheduled_date: Date
  duration: number
  status: "scheduled" | "live" | "completed" | "cancelled"
  viewers?: number
  stream_url?: string
  url?: string
  public_id?: string
  main_image: File
}

export interface PastStream {
  id: string
  title: string
  description: string
  date: Date
  duration: number
  viewers: number
  sales: number
  stream_url: string
  recordingUrl?: string
  isActive: boolean
  imageUrl?: string
}