export interface ShippingCost {
  id: string
  city: string
  region: string
  zip_code: string
  shipping_cost: number
  discount_threshold: number
  discount_percentage: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ShippingCostFilters {
  city?: string
  region?: string
  is_active?: boolean
}

export interface ShippingCostInput {
  city: string
  region: string
  zip_code: string
  shipping_cost: number
  discount_threshold: number
  discount_percentage: number
  is_active: boolean
}

export interface ShippingCostUpdateInput {
  city?: string
  region?: string
  zip_code?: string
  shipping_cost?: number
  discount_threshold?: number
  discount_percentage?: number
  is_active?: boolean
}

export interface ShippingCostCalculationRequest {
  city: string
  region: string
  order_total: number
}

export interface ShippingCostCalculationResponse {
  shipping_cost: number
  base_cost: number
  discount_applied: number
  discount_percentage: number
  discount_threshold: number
}
