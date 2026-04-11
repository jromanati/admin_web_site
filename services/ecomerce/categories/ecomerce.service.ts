import { apiClient, type ApiResponse } from "@/lib/api"
import type { Category } from "@/types/ecomerces/categories"

export class EcomerceService {
  private static token: string | null = null
  private static tokenExpiry: number | null = null

  private static buildCategoryFormData(category: Category, principalImage?: File | null): FormData {
    const formData = new FormData()
    formData.append("name", category.name)
    formData.append("description", category.description)
    formData.append("status", category.status)

    if (typeof category.parent !== "undefined") {
      formData.append("parent", category.parent === null ? "" : String(category.parent))
    }
    if (typeof category.is_active !== "undefined") {
      formData.append("is_active", category.is_active ? "true" : "false")
    }
    if (principalImage) {
      formData.append("principal_image", principalImage)
    }
    return formData
  }

  static async getDashboard(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<any>("dashboard/ecommerce/stats")
    return response
  }

  static async getCategories(): Promise<Category[]> {
    const categoriesStored = localStorage.getItem("categories")
    // console.log(categoriesStored, 'categoriesStored')
    // if (categoriesStored) {
    //   try {
    //     const parsed = JSON.parse(categoriesStored)
    //     return parsed
    //   } catch (e) {
    //     console.error("Error parsing categories from localStorage", e)
    //   }
    // }
    const response = await apiClient.get<Category[]>("categories")
    return response.success ? (response.data ?? []) : []
  }

  static async createCategory(category: Category, principalImage?: File | null): Promise<ApiResponse<Category>> {
    const body = principalImage ? this.buildCategoryFormData(category, principalImage) : category
    const response = await apiClient.post<Category>("categories/create/", body)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }

    return response
  }

  static async updateCategory(
    category: Category,
    id: number,
    principalImage?: File | null,
  ): Promise<ApiResponse<Category>> {
    const body = principalImage ? this.buildCategoryFormData(category, principalImage) : category
    const response = await apiClient.put<Category>(`categories/${id}/update/`, body)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }

  static async deleteCategory(id: number): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<any>(`categories/${id}/delete/`)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }

  static async uploadCategories(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData()
    formData.append("csv_file", file)

    const response = await apiClient.post<any>("categories/upload/", formData)

    if (response.success) {
      return response
    } else if (response.error) {
      console.error("Error uploading products:", response.error)
      return response
    }
    return response
  }

}
