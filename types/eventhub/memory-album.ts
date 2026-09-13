// Base types
export interface BaseEntity {
  id: number
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}

// Memory Album Background
export interface MemoryAlbumBackground extends BaseEntity {
  name: string
  key: string
  background_type: 'system' | 'tenant_upload' | 'generated_ai'
  category?: 'elegant' | 'scrapbook' | 'neon' | 'vintage' | 'graduation' | 'wedding' | 'birthday' | 'corporate' | 'other'
  description?: string
  cloudinary_public_id: string
  image_secure_url: string
  thumbnail_url: string
  width?: number
  height?: number
  file_size?: number
  image_data: Record<string, any>
  is_system: boolean
  is_active: boolean
  sort_order: number
}

export interface CreateMemoryAlbumBackgroundRequest {
  file: File
  name: string
  key: string
  background_type?: 'system' | 'tenant_upload' | 'generated_ai'
  category?: string
  description?: string
  is_system?: boolean
  is_active?: boolean
  sort_order?: number
  metadata?: Record<string, any>
}

export interface UpdateMemoryAlbumBackgroundRequest {
  name?: string
  key?: string
  background_type?: 'system' | 'tenant_upload' | 'generated_ai'
  category?: string
  description?: string
  is_system?: boolean
  is_active?: boolean
  sort_order?: number
  metadata?: Record<string, any>
}

// Memory Album Template
export interface MemoryAlbumTemplate extends BaseEntity {
  name: string
  key: string
  page_type: 'cover' | 'welcome' | 'arrival' | 'party' | 'student' | 'dedications' | 'highlights' | 'closing' | 'back_cover' | 'custom'
  html_template_name: string
  description?: string
  preview_image_url?: string
  preview_cloudinary_public_id?: string
  preview_data: Record<string, any>
  default_background?: MemoryAlbumBackground
  required_slots: Record<string, any>
  settings: Record<string, any>
  is_active: boolean
  sort_order: number
}

export interface CreateMemoryAlbumTemplateRequest {
  name: string
  key: string
  page_type: 'cover' | 'welcome' | 'arrival' | 'party' | 'student' | 'dedications' | 'highlights' | 'closing' | 'back_cover' | 'custom'
  html_template_name: string
  description?: string
  default_background?: number
  required_slots?: Record<string, any>
  settings?: Record<string, any>
  is_active?: boolean
  sort_order?: number
  metadata?: Record<string, any>
}

export interface UpdateMemoryAlbumTemplateRequest {
  name?: string
  key?: string
  page_type?: 'cover' | 'welcome' | 'arrival' | 'party' | 'student' | 'dedications' | 'highlights' | 'closing' | 'back_cover' | 'custom'
  html_template_name?: string
  description?: string
  default_background?: number
  required_slots?: Record<string, any>
  settings?: Record<string, any>
  is_active?: boolean
  sort_order?: number
  metadata?: Record<string, any>
}

// Memory Album
export interface MemoryAlbum extends BaseEntity {
  title: string
  slug: string
  album_type: 'personal' | 'shared' | 'event'
  guest?: number
  companion?: number
  status: 'draft' | 'generating' | 'ready' | 'published' | 'error'
  config: Record<string, any>
  pdf_cloudinary_public_id: string
  pdf_url: string
  pdf_secure_url: string
  pdf_data: Record<string, any>
  public_token: string
  is_public: boolean
  generation_started_at?: string
  generation_finished_at?: string
  generation_error: string
  page_count: number
  pages?: MemoryAlbumPage[]
}

export interface CreateMemoryAlbumRequest {
  title: string
  album_type?: 'personal' | 'shared' | 'event'
  guest?: number
  companion?: number
  config?: Record<string, any>
  metadata?: Record<string, any>
}

export interface UpdateMemoryAlbumRequest {
  title?: string
  album_type?: 'personal' | 'shared' | 'event'
  guest?: number
  companion?: number
  status?: 'draft' | 'generating' | 'ready' | 'published' | 'error'
  config?: Record<string, any>
  is_public?: boolean
  metadata?: Record<string, any>
}

export interface CreateMemoryAlbumWithPagesRequest {
  album: CreateMemoryAlbumRequest
  pages: CreateMemoryAlbumPageRequest[]
}

// Memory Album Page
export interface MemoryAlbumPage extends BaseEntity {
  album: number
  page_number: number
  page_type: 'cover' | 'welcome' | 'arrival' | 'party' | 'student' | 'dedications' | 'highlights' | 'closing' | 'back_cover' | 'custom'
  template_name: string
  template?: MemoryAlbumTemplate
  background?: MemoryAlbumBackground
  title?: string
  data: Record<string, any>
  image_cloudinary_public_id: string
  image_url: string
  image_secure_url: string
  image_data: Record<string, any>
  status: 'pending' | 'rendered' | 'failed'
  render_error: string
}

export interface CreateMemoryAlbumPageRequest {
  album: number
  page_number: number
  page_type: 'cover' | 'welcome' | 'arrival' | 'party' | 'student' | 'dedications' | 'highlights' | 'closing' | 'back_cover' | 'custom'
  template_name: string
  template?: number
  background?: number
  title?: string
  data?: Record<string, any>
  image_file?: File
  metadata?: Record<string, any>
}

export interface UpdateMemoryAlbumPageRequest {
  page_number?: number
  page_type?: 'cover' | 'welcome' | 'arrival' | 'party' | 'student' | 'dedications' | 'highlights' | 'closing' | 'back_cover' | 'custom'
  template_name?: string
  template?: number
  background?: number
  title?: string
  data?: Record<string, any>
  image_file?: File
  metadata?: Record<string, any>
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  status?: number
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Filter types
export interface MemoryAlbumBackgroundFilters {
  is_active?: boolean
  is_system?: boolean
  category?: string
  background_type?: string
  search?: string
}

export interface MemoryAlbumTemplateFilters {
  is_active?: boolean
  page_type?: string
  search?: string
}

export interface MemoryAlbumPageFilters {
  album?: number
  page_type?: string
  status?: string
  template?: number
  background?: number
}

// Available Templates from filesystem
export interface TemplateSlot {
  key: string
  label: string
  default?: string
  required: boolean
}

export interface AvailableTemplate {
  filename: string
  template_path: string
  name: string
  category: string
  page_type: string
  description: string
  required_slots: {
    text_slots: TemplateSlot[]
    photo_slots: TemplateSlot[]
    message_slots: TemplateSlot[]
  }
}
