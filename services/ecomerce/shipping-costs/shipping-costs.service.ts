import { apiClient, type ApiResponse } from "@/lib/api"
import type { ShippingCost, ShippingCostFilters, ShippingCostInput, ShippingCostUpdateInput, ShippingCostCalculationRequest, ShippingCostCalculationResponse } from "@/types/ecomerces/shipping-costs"

export class ShippingCostsService {
  static buildQueryParams(filters?: ShippingCostFilters): string {
    const params = new URLSearchParams()
    if (filters?.city) params.append("city", filters.city)
    if (filters?.region) params.append("region", filters.region)
    if (filters?.is_active !== undefined) params.append("is_active", String(filters.is_active))
    const queryString = params.toString()
    return queryString ? `?${queryString}` : ""
  }

  static async getShippingCosts(filters?: ShippingCostFilters): Promise<ApiResponse<ShippingCost[]>> {
    const query = this.buildQueryParams(filters)
    return apiClient.get<ShippingCost[]>(`shipping-costs/${query}`)
  }

  static async getShippingCost(id: string): Promise<ApiResponse<ShippingCost>> {
    return apiClient.get<ShippingCost>(`shipping-costs/${id}/`)
  }

  static async createShippingCost(data: ShippingCostInput): Promise<ApiResponse<ShippingCost>> {
    return apiClient.post<ShippingCost>("shipping-costs/", data)
  }

  static async updateShippingCost(id: string, data: ShippingCostUpdateInput): Promise<ApiResponse<ShippingCost>> {
    return apiClient.put<ShippingCost>(`shipping-costs/${id}/`, data)
  }

  static async deleteShippingCost(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`shipping-costs/${id}/`)
  }

  static async calculateShippingCost(data: ShippingCostCalculationRequest): Promise<ApiResponse<ShippingCostCalculationResponse>> {
    return apiClient.post<ShippingCostCalculationResponse>("shipping-costs/calculate/", data)
  }
}
