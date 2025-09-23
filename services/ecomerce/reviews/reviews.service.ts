import { apiClient, type ApiResponse } from "@/lib/api"
import type { Review } from "@/types/ecomerces/reviews"

export class ReviewsService {
  private static token: string | null = null
  private static tokenExpiry: number | null = null

  static async getReviews(): Promise<ApiResponse<Review>> {
    const response = await apiClient.get<Review>("admin/reviews")
    const reviews = response.data
    return reviews
  }

  static async approveProductReview(id:number): Promise<ApiResponse<Review>> {
    const response = await apiClient.get<Review>(`admin/reviews/${id}/approve/`)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }

  static async rejectProductReview(id:number): Promise<ApiResponse<Review>> {
    const response = await apiClient.get<Review>(`admin/reviews/${id}/reject/`)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }

  // static async deleteProduct(id:number): Promise<ApiResponse<ProductResponse>> {
  //   const response = await apiClient.delete<ProductResponse>(`products/${id}/delete/`)
  //   if (response.success) {
  //     return response
  //   }
  //   else if (response.error) {
  //     console.error("Error creating:", response.error)
  //     return response
  //   }
  //   return response
  // }
}
