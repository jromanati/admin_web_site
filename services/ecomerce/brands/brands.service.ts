import { apiClient, type ApiResponse } from "@/lib/api"
import type { Product, ProductResponse } from "@/types/ecomerces/products"
import type { Brand } from "@/types/ecomerces/brands"

export class BrandsService {
  private static token: string | null = null
  private static tokenExpiry: number | null = null

  static async getBrands(): Promise<ApiResponse<Brand>> {
    // const brandsStored = localStorage.getItem("brands")
    // if (brandsStored && brandsStored.length > 0) {
    //   try {
    //     const parsed = JSON.parse(brandsStored)
    //     return parsed
    //   } catch (e) {
    //     console.error("Error parsing categories from localStorage", e)
    //   }
    // }
    const response = await apiClient.get<Brand>("brands")
    const brands = response.data
    localStorage.setItem("brands", JSON.stringify(brands))
    return brands
  }

  static async createBrand(brand: Brand): Promise<ApiResponse<Brand>> {
    try {
      const formData = new FormData()

      // Agregar datos básicos del producto
      formData.append("name", brand.name)
      formData.append("description", brand.description || "")
      formData.append("country", brand.country || "")
      formData.append("website", brand.website || "")
      formData.append("email", brand.email || "")
      // formData.append("logo_url", brand.logo_url || "")
      // formData.append("cover_url", brand.cover_url || "")
      formData.append("is_active", brand.is_active ? "true" : "false")
      formData.append("logo_image", brand.logo_image || "")
      // formData.append("social_links", brand.social_links || "")

      const response = await apiClient.post<Brand>("brands/", formData)

      if (response.success) {
        return response
      } else {
        console.error("Error creating product:", response.error)
        return response
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      return { success: false, error: "Unexpected error" }
    }
  }

  static async updateBrand(brand: Brand, brandId:Number): Promise<ApiResponse<Brand>> {
    try {
      const formData = new FormData()

      // Datos básicos
      formData.append("name", brand.name)
      formData.append("description", brand.description || "")
      formData.append("country", brand.country || "")
      formData.append("website", brand.website || "")
      formData.append("email", brand.email || "")
      // formData.append("logo_url", brand.logo_url || "")
      formData.append("is_active", brand.is_active ? "true" : "false")
      formData.append("logo_image", brand.logo_image || "")
      formData.append("deleted_logo_image", brand.deleted_logo_image || false)
      if (Array.isArray(brand.social_links) && brand.social_links.length) {
        const social_links = brand.social_links.map(({ id, platform, url }) => ({
          id: Number(id ?? 0),
          platform: String(platform ?? ""),
          url: String(url ?? ""),
        }))
        formData.append("social_links", JSON.stringify(social_links))
      }
      const response = await apiClient.put<Product>(`brands/${brandId}/`, formData)

      if (response.success) {
        return response
      } else {
        console.error("Error updating brand:", response.error)
        return response
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      return { success: false, error: "Unexpected error" }
    }
  }

  static async activeProduct(id:number): Promise<ApiResponse<Product>> {
    const response = await apiClient.get<Product>(`products/${id}/active/`)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }

  static async deleteProduct(id:number): Promise<ApiResponse<ProductResponse>> {
    const response = await apiClient.delete<ProductResponse>(`products/${id}/delete/`)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }


  // static async deleteFeature(id:number): Promise<ApiResponse<Feature>> {
  //   const response = await apiClient.delete<Feature>(`features/${id}/delete/`)
  //   if (response.success) {
  //     return response
  //   }
  //   else if (response.error) {
  //     console.error("Error creating:", response.error)
  //     return response
  //   }
  //   return response
  // }

  // static async createFeatureDetail(feature_detail:FeatureDetail): Promise<ApiResponse<FeatureDetail>> {
  //   const response = await apiClient.post<FeatureDetail>("features/detail/create/", feature_detail)
  //   if (response.success) {
  //     return response
  //   }
  //   else if (response.error) {
  //     console.error("Error creating:", response.error)
  //     return response
  //   }

  //   return response
  // }

  // static async updateFeatureDetail(feature_detail:FeatureDetail, id:number): Promise<ApiResponse<FeatureDetail>> {
  //   const response = await apiClient.put<FeatureDetail>(`features/detail/${id}/update/`, feature_detail)
  //   if (response.success) {
  //     return response
  //   }
  //   else if (response.error) {
  //     console.error("Error creating:", response.error)
  //     return response
  //   }
  //   return response
  // }

  // static async deleteFeatureDetail(id:number): Promise<ApiResponse<FeatureDetail>> {
  //   const response = await apiClient.delete<FeatureDetail>(`features/detail/${id}/delete/`)
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
