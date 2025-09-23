import { apiClient, type ApiResponse } from "@/lib/api"
import type { Feature, FeatureDetail } from "@/types/ecomerces/features"

export class FeaturesService {
  private static token: string | null = null
  private static tokenExpiry: number | null = null

  static async getFeatures(): Promise<ApiResponse<Feature>> {
    const featuresStored = localStorage.getItem("features")
    if (featuresStored) {
      try {
        const parsed = JSON.parse(featuresStored)
        return parsed
      } catch (e) {
        console.error("Error parsing categories from localStorage", e)
      }
    }
    const response = await apiClient.get<Feature>("features")
    const features = response.data
    localStorage.setItem("features", JSON.stringify(features))
    return features
  }

  static async createFeature(feature:Feature): Promise<ApiResponse<Feature>> {
    const response = await apiClient.post<Feature>("features/create/", feature)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }

    return response
  }

  static async updateFeature(feature:Feature, id:number): Promise<ApiResponse<Feature>> {
    const response = await apiClient.put<Feature>(`features/${id}/update/`, feature)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }

  static async deleteFeature(id:number): Promise<ApiResponse<Feature>> {
    const response = await apiClient.delete<Feature>(`features/${id}/delete/`)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }

  static async createFeatureDetail(feature_detail:FeatureDetail): Promise<ApiResponse<FeatureDetail>> {
    const response = await apiClient.post<FeatureDetail>("features/detail/create/", feature_detail)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }

    return response
  }

  static async updateFeatureDetail(feature_detail:FeatureDetail, id:number): Promise<ApiResponse<FeatureDetail>> {
    const response = await apiClient.put<FeatureDetail>(`features/detail/${id}/update/`, feature_detail)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }

  static async deleteFeatureDetail(id:number): Promise<ApiResponse<FeatureDetail>> {
    const response = await apiClient.delete<FeatureDetail>(`features/detail/${id}/delete/`)
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
