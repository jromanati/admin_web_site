import { apiClient, type ApiResponse } from "@/lib/api"
import type { Category, CategoryResponse } from "@/types/ecomerces/categories"

export class EcomerceService {
  private static token: string | null = null
  private static tokenExpiry: number | null = null

  static async getDashboard(): Promise<ApiResponse<Category>> {
    const response = await apiClient.get<CategoryResponse>("dashboard/ecommerce/stats")
    return response
  }

  static async getCategories(): Promise<ApiResponse<CategoryResponse>> {
    const categoriesStored = localStorage.getItem("categories")
    console.log(categoriesStored, 'categoriesStored')
    if (categoriesStored) {
      try {
        const parsed = JSON.parse(categoriesStored)
        return parsed
      } catch (e) {
        console.error("Error parsing categories from localStorage", e)
      }
    }
    const response = await apiClient.get<CategoryResponse>("categories")
    const features = response.data
    // localStorage.setItem("categories", JSON.stringify(features))
    return response.data
  }

  static async createCategory(category:Category): Promise<ApiResponse<CategoryResponse>> {
    const response = await apiClient.post<CategoryResponse>("categories/create/", category)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }

    return response
  }

  static async updateCategory(category:Category, id:number): Promise<ApiResponse<CategoryResponse>> {
    const response = await apiClient.put<CategoryResponse>(`categories/${id}/update/`, category)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }

  static async deleteCategory(id:number): Promise<ApiResponse<CategoryResponse>> {
    const response = await apiClient.delete<CategoryResponse>(`categories/${id}/delete/`)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }

}
