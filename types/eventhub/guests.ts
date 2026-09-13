// Base types
export interface BaseMetadata {
  [key: string]: any
}

export interface BaseEntity {
  id: number
  is_active: boolean
  metadata: BaseMetadata
  created_at: string
  updated_at: string
}

// Guest Group types
export interface GuestGroup extends BaseEntity {
  name: string
  description: string
  color: string
  sort_order: number
}

export interface CreateGuestGroupRequest {
  name: string
  description?: string
  color?: string
  sort_order?: number
  is_active?: boolean
  metadata?: BaseMetadata
}

export interface UpdateGuestGroupRequest extends Partial<CreateGuestGroupRequest> {}

// Event Table types
export type TableShape = 'round' | 'rectangular' | 'square'

export interface EventTable extends BaseEntity {
  name: string
  number: number
  capacity: number
  location_label: string
  description: string
  color: string
  shape: TableShape
  sort_order: number
}

export interface CreateEventTableRequest {
  name: string
  number?: number
  capacity: number
  location_label?: string
  description?: string
  color?: string
  shape: TableShape
  sort_order?: number
  is_active?: boolean
  metadata?: BaseMetadata
}

export interface UpdateEventTableRequest extends Partial<CreateEventTableRequest> {}

// Guest types
export type GuestType = 'celebrant' | 'family' | 'friend' | 'student' | 'teacher' | 'vip' | 'staff' | 'photographer' | 'dj' | 'supplier' | 'other'
export type RsvpStatus = 'pending' | 'confirmed' | 'declined' | 'maybe'

export interface Guest extends BaseEntity {
  group?: number
  table?: number
  full_name: string
  nickname?: string
  normalized_name: string
  email?: string
  phone?: string
  avatar?: string
  seat_number?: string
  guest_type: GuestType
  rsvp_status: RsvpStatus
  checked_in_at?: string
  invitation_code: string
  dietary_notes?: string
  special_notes?: string
  companions: GuestCompanion[]
}

export interface CreateGuestRequest {
  group?: number
  table?: number
  full_name: string
  nickname?: string
  email?: string
  phone?: string
  seat_number?: string
  guest_type: GuestType
  rsvp_status?: RsvpStatus
  dietary_notes?: string
  special_notes?: string
  is_active?: boolean
  metadata?: BaseMetadata
}

export interface UpdateGuestRequest extends Partial<CreateGuestRequest> {}

// Guest Companion types
export type Relationship = 'spouse' | 'child' | 'parent' | 'sibling' | 'friend' | 'partner' | 'coworker' | 'other'
export type AgeGroup = 'baby' | 'child' | 'teen' | 'adult' | 'senior' | 'unknown'

export interface GuestCompanion extends BaseEntity {
  guest: number
  full_name: string
  nickname?: string
  normalized_name: string
  avatar?: string
  relationship: Relationship
  age_group: AgeGroup
  seat_number?: string
  checked_in_at?: string
  dietary_notes?: string
  special_notes?: string
}

export interface CreateGuestCompanionRequest {
  guest: number
  full_name: string
  nickname?: string
  relationship: Relationship
  age_group: AgeGroup
  seat_number?: string
  dietary_notes?: string
  special_notes?: string
  is_active?: boolean
  metadata?: BaseMetadata
}

export interface UpdateGuestCompanionRequest extends Partial<CreateGuestCompanionRequest> {}

// API Response types
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Specific API Response types
export interface GuestGroupsResponse extends PaginatedResponse<GuestGroup> {}
export interface EventTablesResponse extends PaginatedResponse<EventTable> {}
export interface GuestsResponse extends PaginatedResponse<Guest> {}
export interface GuestCompanionsResponse extends PaginatedResponse<GuestCompanion> {}

export interface GuestGroupResponse extends ApiResponse<GuestGroup> {}
export interface EventTableResponse extends ApiResponse<EventTable> {}
export interface GuestResponse extends ApiResponse<Guest> {}
export interface GuestCompanionResponse extends ApiResponse<GuestCompanion> {}
