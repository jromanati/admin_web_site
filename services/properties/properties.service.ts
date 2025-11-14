import { apiClient, type ApiResponse } from "@/lib/api"
import type { Property, PropertyImage } from "@/types/properties/properties"

export class PropertiesService {
  private static token: string | null = null
  private static tokenExpiry: number | null = null

  static async getDashboard(): Promise<ApiResponse<Property>> {
    const response = await apiClient.get<Property>("dashboard/properties/stats")
    return response
  }

  static async getProperties(): Promise<ApiResponse<Property>> {
    // const propertiesStored = localStorage.getItem("properties")
    // console.log(propertiesStored, 'categoriesStored')
    // if (propertiesStored) {
    //   try {
    //     const parsed = JSON.parse(propertiesStored)
    //     return parsed
    //   } catch (e) {
    //     console.error("Error parsing properties from localStorage", e)
    //   }
    // }
    const response = await apiClient.get<Property>("properties")
    const features = response.data
    localStorage.setItem("properties", JSON.stringify(features))
    return response.data
  }

  static async createProperty(property: Property): Promise<ApiResponse<Property>> {
    try {
      const formData = new FormData()
      // Agregar datos básicos del producto
      formData.append("title", property.title);
      formData.append("code", property.code);
      formData.append("published", String(property.published));
      formData.append("featured", String(property.featured));
      formData.append("show_map", String(property.show_map));
      formData.append("map_src", property.map_src);

      if (property.built_area !== undefined) formData.append("built_area", String(property.built_area));
      if (property.land_area !== undefined)  formData.append("land_area", String(property.land_area));

      formData.append("electricity", String(property.electricity));
      formData.append("water", property.water);
      formData.append("description", property.description);
      formData.append("amenities", property.amenities);
      formData.append("characteristics", property.characteristics);

      if (property.price !== undefined) formData.append("price", String(property.price));
      formData.append("currency", property.currency);
      formData.append("price_type", String(property.price_type));
      formData.append("operation", String(property.operation));
      formData.append("state", String(property.state));
      formData.append("property_type", String(property.property_type));

      if (property.bedrooms !== undefined)  formData.append("bedrooms", String(property.bedrooms));
      if (property.bathrooms !== undefined) formData.append("bathrooms", String(property.bathrooms));

      formData.append("region", property.region);
      formData.append("commune", property.commune);
      formData.append("address", property.address);

      if (property.parking !== undefined) formData.append("parking", String(property.parking));
      formData.append("storage", String(property.storage));

      if (property.mainImage) {
        formData.append("main_image", property.mainImage)
      }
      // 📸 Agregar imágenes (si las hay)
      if (property.images && Array.isArray(property.images)) {
        property.images.forEach((img: File | any) => {
          if (img instanceof File) {
            formData.append("images", img)
          }
        })
      }
      if (property.video) {
        formData.append("video", property.video)
      }
      formData.append("property_state", property.property_state);
      const response = await apiClient.post<Property>("properties/create/", formData)

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

  static async updateProperty(property: Property, propertyId:Number): Promise<ApiResponse<Property>> {
    try {
      const formData = new FormData()
      // Agregar datos básicos del producto
      formData.append("title", property.title);
      formData.append("code", property.code);
      formData.append("published", String(property.published));
      formData.append("featured", String(property.featured));
      formData.append("show_map", String(property.show_map));
      formData.append("map_src", property.map_src);

      if (property.built_area !== undefined) formData.append("built_area", String(property.built_area));
      if (property.land_area !== undefined)  formData.append("land_area", String(property.land_area));

      formData.append("electricity", String(property.electricity));
      formData.append("water", property.water);
      formData.append("description", property.description);
      formData.append("amenities", property.amenities);
      formData.append("characteristics", property.characteristics);

      if (property.price !== undefined) formData.append("price", String(property.price));
      formData.append("currency", property.currency);
      formData.append("price_type", String(property.price_type));
      formData.append("operation", String(property.operation));
      formData.append("state", String(property.state));
      formData.append("property_type", String(property.property_type));

      if (property.bedrooms !== undefined)  formData.append("bedrooms", String(property.bedrooms));
      if (property.bathrooms !== undefined) formData.append("bathrooms", String(property.bathrooms));

      formData.append("region", property.region);
      formData.append("commune", property.commune);
      formData.append("address", property.address);
      formData.append("property_state", property.property_state);

      if (property.parking !== undefined) formData.append("parking", String(property.parking));
      formData.append("storage", String(property.storage));

      // 📸 Agregar imágenes (si las hay)
      if (property.images && Array.isArray(property.images)) {
        property.images.forEach((img: File | any) => {
          if (img instanceof File) {
            formData.append("images", img)
          }
        })
      }
      if (property.deleted_images && property.deleted_images.length > 0) {
        formData.append("deleted_images", property.deleted_images)
      }
      if (property.mainImage) {
        formData.append("main_image", property.mainImage)
      }
      if (property.mainImageDelete) {
        formData.append("main_image_delete", String(property.mainImageDelete))
      }
      if (property.video) {
        formData.append("video", property.video)
      }
      if (property.videoDelete) {
        formData.append("video_delete", String(property.videoDelete))
      }
      const response = await apiClient.put<Property>(`properties/${propertyId}/update/`, formData)
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

  static async deleteProperty(id:number): Promise<ApiResponse<Property>> {
    const response = await apiClient.delete<Property>(`properties/${id}/delete/`)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }

  static async changePublishedProperty(id:number): Promise<ApiResponse<Property>> {
    const response = await apiClient.get<Property>(`properties/${id}/active/`)
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
