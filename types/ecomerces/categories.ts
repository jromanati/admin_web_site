export interface Category {
  id: number
  name: string
  description: string
  products_count: number
  status: "active" | "inactive"
  parent?: number | null
  is_active?: boolean
  principal_image?: File | null
  image_url?: string | null
  subcategories?: Category[]
}

export interface CategoryResponse {
  id: number
  name: string
  description: string
  products_count: number
  status: "active" | "inactive"
  parent?: number | null
  is_active?: boolean
  image_url?: string | null
  subcategories?: Category[]
}