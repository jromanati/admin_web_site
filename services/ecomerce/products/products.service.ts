import { apiClient, type ApiResponse } from "@/lib/api"
import type { Product, ProductResponse } from "@/types/ecomerces/products"

export class ProductsService {
  private static token: string | null = null
  private static tokenExpiry: number | null = null

  static async getProducts(): Promise<ApiResponse<ProductResponse>> {
    const productsStored = localStorage.getItem("products")
    
    // if (productsStored) {
    //   console.log(productsStored, 'productsStored!!!')
    //   try {
    //     const parsed = JSON.parse(productsStored)
    //     return parsed
    //   } catch (e) {
    //     console.error("Error parsing categories from localStorage", e)
    //   }
    // }
    const response = await apiClient.get<ProductResponse>("products")
    const products = response.data
    localStorage.setItem("products", JSON.stringify(products))
    return products
  }

  static async createProduct(product: Product): Promise<ApiResponse<Product>> {
    try {
      const formData = new FormData()

      // Agregar datos básicos del producto
      formData.append("name", product.name)
      formData.append("description", product.description || "")
      formData.append("price", product.price.toString())
      formData.append("original_price", product.original_price.toString())
      formData.append("rating", product.rating.toString())
      formData.append("stock", product.stock.toString())
      formData.append("sku", product.sku)
      formData.append("category", product.category.toString())
      formData.append("is_new", product.is_new ? "true" : "false")
      formData.append("is_active", product.is_active ? "true" : "false")
      formData.append("principal_image", product.main_image || "")
      formData.append("brand", product.brand || "")

      // 📸 Agregar imágenes (si las hay)
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((img: File | any) => {
          if (img instanceof File) {
            formData.append("images", img)
          }
        })
      }

      // 🧩 Agregar atributos (features_detail IDs como string[] json)
      if (product.features && Array.isArray(product.features)) {
        const featureIds = product.features.map(f => f.toString())
        formData.append("features", JSON.stringify(featureIds))
      }

      if (Array.isArray(product.specifications) && product.specifications.length) {
        const specs = product.specifications.map(({ id, name, value }) => ({
          id: String(id),
          name: String(name ?? ""),
          value: String(value ?? ""),
        }))
        formData.append("specifications", JSON.stringify(specs))
      }

      // Compatibilidades
      if (Array.isArray(product.compatibilities) && product.compatibilities.length) {
        const specs = product.compatibilities.map(({ id, value }) => ({
          id: String(id),
          value: String(value ?? ""),
        }))
        formData.append("compatibilities", JSON.stringify(specs))
      }
      // Beneficios
      if (Array.isArray(product.benefits) && product.benefits.length) {
        const benefits = product.benefits.map(({ id, value, benefit_type }) => ({
          id: String(id),
          value: String(value ?? ""),
          benefit_type: String(benefit_type ?? ""),
        }))
        formData.append("benefits", JSON.stringify(benefits))
      }

      const response = await apiClient.post<Product>("products/create/", formData)

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

  static async updateProduct(product: Product, productId:Number): Promise<ApiResponse<Product>> {
    try {
      const formData = new FormData()

      // Datos básicos
      formData.append("name", product.name)
      formData.append("description", product.description || "")
      formData.append("price", product.price.toString())
      formData.append("original_price", product.original_price.toString())
      formData.append("rating", product.rating.toString())
      formData.append("stock", product.stock.toString())
      formData.append("sku", product.sku)
      formData.append("category", product.category.toString())
      formData.append("is_new", product.is_new ? "true" : "false")
      formData.append("is_active", product.is_active ? "true" : "false")
      formData.append("principal_image", product.main_image || "")
      formData.append("brand", product.brand || "")
      if (product.deleted_images && product.deleted_images.length > 0) {
        formData.append("deleted_images", product.deleted_images)
      }
      // Imágenes (solo si son nuevas del tipo File)
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((img: File | any) => {
          if (img instanceof File) {
            formData.append("images", img)
          }
        })
      }

      // Atributos (features_detail)
      if (product.features && Array.isArray(product.features)) {
        const featureIds = product.features.map(f => f.toString())
        formData.append("features", JSON.stringify(featureIds))
      }

      // Especificaciones
      if (Array.isArray(product.specifications) && product.specifications.length) {
        const specs = product.specifications.map(({ id, name, value }) => ({
          id: String(id),
          name: String(name ?? ""),
          value: String(value ?? ""),
        }))
        formData.append("specifications", JSON.stringify(specs))
      }
      if (product.deleted_specification && product.deleted_specification.length > 0) {
        formData.append("deleted_specification", product.deleted_specification)
      }
      // Compatibilidades
      if (Array.isArray(product.compatibilities) && product.compatibilities.length) {
        const specs = product.compatibilities.map(({ id, value }) => ({
          id: String(id),
          value: String(value ?? ""),
        }))
        formData.append("compatibilities", JSON.stringify(specs))
      }
      if (product.delete_compatibilities && product.delete_compatibilities.length > 0) {
        formData.append("delete_compatibilities", product.delete_compatibilities)
      }
      // Beneficios
      if (Array.isArray(product.benefits) && product.benefits.length) {
        const benefits = product.benefits.map(({ id, value, benefit_type }) => ({
          id: String(id),
          value: String(value ?? ""),
          benefit_type: String(benefit_type ?? ""),
        }))
        formData.append("benefits", JSON.stringify(benefits))
      }
      if (product.delete_benefits && product.delete_benefits.length > 0) {
        formData.append("delete_benefits", product.delete_benefits)
      }
      const response = await apiClient.put<Product>(`products/${productId}/update/`, formData)

      if (response.success) {
        return response
      } else {
        console.error("Error updating product:", response.error)
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

  static async uploadProducts(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData()
    formData.append("csv_file", file)

    const response = await apiClient.post<any>("products/upload/", formData)

    if (response.success) {
      return response
    } else if (response.error) {
      console.error("Error uploading products:", response.error)
      return response
    }
    return response
  }

  static async uploadImagesProducts(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData()
    formData.append("zip_file", file)

    const response = await apiClient.post<any>("products/upload-images/", formData)

    if (response.success) {
      return response
    } else if (response.error) {
      console.error("Error uploading image:", response)
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
