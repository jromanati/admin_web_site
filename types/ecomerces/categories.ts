export interface Category {
  id: number
  name: string
  description: string
  products_count: number
  status: "active" | "inactive"
  parent?: string | null
  is_active?: boolean
  subcategories?: Category[]
}

export interface CategoryResponse {
  id: string
  name: string
  description: string
  products_count: number
  status: "active" | "inactive"
  parent?: string
  is_active?: boolean
  subcategories?: Category[]
}