import { apiClient } from "@/lib/api"
import type {
  MemoryAlbumBackground,
  MemoryAlbumTemplate,
  MemoryAlbum,
  MemoryAlbumPage,
  CreateMemoryAlbumBackgroundRequest,
  UpdateMemoryAlbumBackgroundRequest,
  CreateMemoryAlbumTemplateRequest,
  UpdateMemoryAlbumTemplateRequest,
  CreateMemoryAlbumRequest,
  UpdateMemoryAlbumRequest,
  CreateMemoryAlbumWithPagesRequest,
  CreateMemoryAlbumPageRequest,
  UpdateMemoryAlbumPageRequest,
  ApiResponse,
  PaginatedResponse,
  MemoryAlbumBackgroundFilters,
  MemoryAlbumTemplateFilters,
  MemoryAlbumPageFilters,
  AvailableTemplate
} from "@/types/eventhub/memory-album"

// Memory Album Background Service
export class MemoryAlbumBackgroundService {
  static async getBackgrounds(filters?: MemoryAlbumBackgroundFilters): Promise<PaginatedResponse<MemoryAlbumBackground>> {
    try {
      console.log("Fetching memory album backgrounds")
      const queryParams = new URLSearchParams()
      
      if (filters) {
        if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active.toString())
        if (filters.is_system !== undefined) queryParams.append('is_system', filters.is_system.toString())
        if (filters.category) queryParams.append('category', filters.category)
        if (filters.background_type) queryParams.append('background_type', filters.background_type)
        if (filters.search) queryParams.append('search', filters.search)
      }
      
      const url = queryParams.toString() 
        ? `eventhub/album-backgrounds/?${queryParams.toString()}`
        : "eventhub/album-backgrounds/"
      
      const response = await apiClient.get<PaginatedResponse<MemoryAlbumBackground>>(url)
      console.log("Backgrounds API response:", response)
      
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          return {
            count: response.data.length,
            next: null,
            previous: null,
            results: response.data
          }
        }
        return response.data as PaginatedResponse<MemoryAlbumBackground>
      }
      
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    } catch (error) {
      console.error("Error fetching backgrounds:", error)
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    }
  }

  static async getBackgroundById(id: number): Promise<ApiResponse<MemoryAlbumBackground>> {
    try {
      console.log(`Fetching background ${id}`)
      const response = await apiClient.get<MemoryAlbumBackground>(`eventhub/album-backgrounds/${id}/`)
      console.log("Background API response:", response)
      
      if (response.success && response.data) {
        return {
          success: true,
          status: response.status,
          data: response.data
        }
      }
      
      if (!('success' in response) && (response as any).id) {
        return {
          success: true,
          status: 200,
          data: response as MemoryAlbumBackground
        }
      }
      
      return {
        success: false,
        status: 404,
        data: {} as MemoryAlbumBackground,
        error: "Background not found"
      }
    } catch (error) {
      console.error("Error fetching background:", error)
      return { 
        success: false, 
        status: 500,
        data: {} as MemoryAlbumBackground, 
        error: "Failed to fetch background" 
      }
    }
  }

  static async createBackground(data: CreateMemoryAlbumBackgroundRequest): Promise<ApiResponse<MemoryAlbumBackground>> {
    try {
      console.log("Creating background with upload")
      const formData = new FormData()
      
      formData.append('file', data.file)
      formData.append('name', data.name)
      formData.append('key', data.key)
      
      if (data.background_type) formData.append('background_type', data.background_type)
      if (data.category) formData.append('category', data.category)
      if (data.description) formData.append('description', data.description)
      if (data.is_system !== undefined) formData.append('is_system', data.is_system.toString())
      if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString())
      if (data.sort_order !== undefined) formData.append('sort_order', data.sort_order.toString())
      if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata))
      
      const response = await apiClient.post<MemoryAlbumBackground>(
        "eventhub/album-backgrounds/upload/",
        formData
      )
      
      console.log("Create background response:", response)
      return response
    } catch (error) {
      console.error("Error creating background:", error)
      return { 
        success: false, 
        status: 500,
        data: {} as MemoryAlbumBackground, 
        error: "Failed to create background" 
      }
    }
  }

  static async updateBackground(id: number, data: UpdateMemoryAlbumBackgroundRequest): Promise<ApiResponse<MemoryAlbumBackground>> {
    try {
      console.log(`Updating background ${id}`)
      const response = await apiClient.put<MemoryAlbumBackground>(`eventhub/album-backgrounds/${id}/`, data)
      console.log("Update background response:", response)
      return response
    } catch (error) {
      console.error("Error updating background:", error)
      return { 
        success: false, 
        status: 500,
        data: {} as MemoryAlbumBackground, 
        error: "Failed to update background" 
      }
    }
  }

  static async deleteBackground(id: number): Promise<ApiResponse<void>> {
    try {
      console.log(`Deleting background ${id}`)
      const response = await apiClient.delete<void>(`eventhub/album-backgrounds/${id}/`)
      console.log("Delete background response:", response)
      return response
    } catch (error) {
      console.error("Error deleting background:", error)
      return { 
        success: false, 
        status: 500,
        data: undefined, 
        error: "Failed to delete background" 
      }
    }
  }
}

// Memory Album Template Service
export class MemoryAlbumTemplateService {
  static async getTemplates(filters?: MemoryAlbumTemplateFilters): Promise<PaginatedResponse<MemoryAlbumTemplate>> {
    try {
      console.log("Fetching memory album templates")
      const queryParams = new URLSearchParams()
      
      if (filters) {
        if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active.toString())
        if (filters.page_type) queryParams.append('page_type', filters.page_type)
        if (filters.search) queryParams.append('search', filters.search)
      }
      
      const url = queryParams.toString() 
        ? `eventhub/album-templates/?${queryParams.toString()}`
        : "eventhub/album-templates/"
      
      const response = await apiClient.get<PaginatedResponse<MemoryAlbumTemplate>>(url)
      console.log("Templates API response:", response)
      
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          return {
            count: response.data.length,
            next: null,
            previous: null,
            results: response.data
          }
        }
        return response.data as PaginatedResponse<MemoryAlbumTemplate>
      }
      
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    }
  }

  static async getTemplateById(id: number): Promise<ApiResponse<MemoryAlbumTemplate>> {
    try {
      console.log(`Fetching template ${id}`)
      const response = await apiClient.get<MemoryAlbumTemplate>(`eventhub/album-templates/${id}/`)
      console.log("Template API response:", response)
      
      if (response.success && response.data) {
        return {
          success: true,
          status: response.status,
          data: response.data
        }
      }
      
      if (!('success' in response) && (response as any).id) {
        return {
          success: true,
          status: 200,
          data: response as MemoryAlbumTemplate
        }
      }
      
      return {
        success: false,
        status: 404,
        data: {} as MemoryAlbumTemplate,
        error: "Template not found"
      }
    } catch (error) {
      console.error("Error fetching template:", error)
      return { 
        success: false, 
        status: 500,
        data: {} as MemoryAlbumTemplate, 
        error: "Failed to fetch template" 
      }
    }
  }

  static async createTemplate(data: CreateMemoryAlbumTemplateRequest): Promise<ApiResponse<MemoryAlbumTemplate>> {
    try {
      console.log("Creating template")
      const response = await apiClient.post<MemoryAlbumTemplate>("eventhub/album-templates/", data)
      console.log("Create template response:", response)
      return response
    } catch (error) {
      console.error("Error creating template:", error)
      return { 
        success: false, 
        status: 500,
        data: {} as MemoryAlbumTemplate, 
        error: "Failed to create template" 
      }
    }
  }

  static async updateTemplate(id: number, data: UpdateMemoryAlbumTemplateRequest): Promise<ApiResponse<MemoryAlbumTemplate>> {
    try {
      console.log(`Updating template ${id}`)
      const response = await apiClient.put<MemoryAlbumTemplate>(`eventhub/album-templates/${id}/`, data)
      console.log("Update template response:", response)
      return response
    } catch (error) {
      console.error("Error updating template:", error)
      return { 
        success: false, 
        status: 500,
        data: {} as MemoryAlbumTemplate, 
        error: "Failed to update template" 
      }
    }
  }

  static async deleteTemplate(id: number): Promise<ApiResponse<void>> {
    try {
      console.log(`Deleting template ${id}`)
      const response = await apiClient.delete<void>(`eventhub/album-templates/${id}/`)
      console.log("Delete template response:", response)
      return response
    } catch (error) {
      console.error("Error deleting template:", error)
      return { 
        success: false, 
        status: 500,
        data: undefined, 
        error: "Failed to delete template" 
      }
    }
  }

  static async uploadPreview(id: number, file: File): Promise<ApiResponse<MemoryAlbumTemplate>> {
    try {
      console.log(`Uploading preview for template ${id}`)
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await apiClient.post<MemoryAlbumTemplate>(
        `eventhub/album-templates/${id}/upload-preview/`,
        formData
      )
      
      console.log("Upload preview response:", response)
      return response
    } catch (error) {
      console.error("Error uploading preview:", error)
      return { 
        success: false, 
        status: 500,
        data: {} as MemoryAlbumTemplate, 
        error: "Failed to upload preview" 
      }
    }
  }

  static async getAvailableTemplates(): Promise<AvailableTemplate[]> {
    try {
      console.log("Fetching available templates from filesystem")
      const response = await apiClient.get<AvailableTemplate[]>("eventhub/album-templates/available-templates/")
      console.log("Available templates response:", response)
      
      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [response.data]
      }
      
      return []
    } catch (error) {
      console.error("Error fetching available templates:", error)
      return []
    }
  }
}

// Memory Album Service
export class MemoryAlbumService {
  static async getAlbums(): Promise<PaginatedResponse<MemoryAlbum>> {
    try {
      console.log("Fetching memory albums")
      const response = await apiClient.get<PaginatedResponse<MemoryAlbum>>("eventhub/memory-albums/")
      console.log("Albums API response:", response)
      
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          return {
            count: response.data.length,
            next: null,
            previous: null,
            results: response.data
          }
        }
        return response.data as PaginatedResponse<MemoryAlbum>
      }
      
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    } catch (error) {
      console.error("Error fetching albums:", error)
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    }
  }

  static async getAlbumById(id: number): Promise<ApiResponse<MemoryAlbum>> {
    try {
      console.log(`Fetching album ${id}`)
      const response = await apiClient.get<MemoryAlbum>(`eventhub/memory-albums/${id}/`)
      console.log("Album API response:", response)
      
      if (response.success && response.data) {
        return {
          success: true,
          status: response.status,
          data: response.data
        }
      }
      
      if (!('success' in response) && (response as any).id) {
        return {
          success: true,
          status: 200,
          data: response as MemoryAlbum
        }
      }
      
      return {
        success: false,
        status: 404,
        data: {} as MemoryAlbum,
        error: "Album not found"
      }
    } catch (error) {
      console.error("Error fetching album:", error)
      return { 
        success: false, 
        status: 500,
        data: {} as MemoryAlbum, 
        error: "Failed to fetch album" 
      }
    }
  }

  static async createAlbum(data: CreateMemoryAlbumRequest): Promise<ApiResponse<MemoryAlbum>> {
    try {
      console.log("Creating album")
      const response = await apiClient.post<MemoryAlbum>("eventhub/memory-albums/", data)
      console.log("Create album response:", response)
      return response
    } catch (error) {
      console.error("Error creating album:", error)
      return { 
        success: false, 
        status: 500,
        data: {} as MemoryAlbum, 
        error: "Failed to create album" 
      }
    }
  }

  static async createAlbumWithPages(data: CreateMemoryAlbumWithPagesRequest): Promise<ApiResponse<MemoryAlbum>> {
    try {
      console.log("Creating album with pages")
      const response = await apiClient.post<MemoryAlbum>("eventhub/memory-albums/create-with-pages/", data)
      console.log("Create album with pages response:", response)
      return response
    } catch (error) {
      console.error("Error creating album with pages:", error)
      return { 
        success: false, 
        status: 500,
        data: {} as MemoryAlbum, 
        error: "Failed to create album with pages" 
      }
    }
  }

  static async updateAlbum(id: number, data: UpdateMemoryAlbumRequest): Promise<ApiResponse<MemoryAlbum>> {
    try {
      console.log(`Updating album ${id}`)
      const response = await apiClient.put<MemoryAlbum>(`eventhub/memory-albums/${id}/`, data)
      console.log("Update album response:", response)
      return response
    } catch (error) {
      console.error("Error updating album:", error)
      return { 
        success: false, 
        status: 500,
        data: {} as MemoryAlbum, 
        error: "Failed to update album" 
      }
    }
  }

  static async deleteAlbum(id: number): Promise<ApiResponse<void>> {
    try {
      console.log(`Deleting album ${id}`)
      const response = await apiClient.delete<void>(`eventhub/memory-albums/${id}/`)
      console.log("Delete album response:", response)
      return response
    } catch (error) {
      console.error("Error deleting album:", error)
      return { 
        success: false, 
        status: 500,
        data: undefined, 
        error: "Failed to delete album" 
      }
    }
  }

  static async getAlbumPages(id: number): Promise<MemoryAlbumPage[]> {
    try {
      console.log(`Fetching pages for album ${id}`)
      const response = await apiClient.get<MemoryAlbumPage[]>(`eventhub/memory-albums/${id}/pages/`)
      console.log("Album pages API response:", response)
      
      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [response.data]
      }
      
      return []
    } catch (error) {
      console.error("Error fetching album pages:", error)
      return []
    }
  }
}

// Memory Album Page Service
export class MemoryAlbumPageService {
  static async getPages(filters?: MemoryAlbumPageFilters): Promise<PaginatedResponse<MemoryAlbumPage>> {
    try {
      console.log("Fetching memory album pages")
      const queryParams = new URLSearchParams()
      
      if (filters) {
        if (filters.album) queryParams.append('album', filters.album.toString())
        if (filters.page_type) queryParams.append('page_type', filters.page_type)
        if (filters.status) queryParams.append('status', filters.status)
        if (filters.template) queryParams.append('template', filters.template.toString())
        if (filters.background) queryParams.append('background', filters.background.toString())
      }
      
      const url = queryParams.toString() 
        ? `eventhub/memory-album-pages/?${queryParams.toString()}`
        : "eventhub/memory-album-pages/"
      
      const response = await apiClient.get<PaginatedResponse<MemoryAlbumPage>>(url)
      console.log("Pages API response:", response)
      
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          return {
            count: response.data.length,
            next: null,
            previous: null,
            results: response.data
          }
        }
        return response.data as PaginatedResponse<MemoryAlbumPage>
      }
      
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    } catch (error) {
      console.error("Error fetching pages:", error)
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    }
  }

  static async getPageById(id: number): Promise<ApiResponse<MemoryAlbumPage>> {
    try {
      console.log(`Fetching page ${id}`)
      const response = await apiClient.get<MemoryAlbumPage>(`eventhub/memory-album-pages/${id}/`)
      console.log("Page API response:", response)
      
      if (response.success && response.data) {
        return {
          success: true,
          status: response.status,
          data: response.data
        }
      }
      
      if (!('success' in response) && (response as any).id) {
        return {
          success: true,
          status: 200,
          data: response as MemoryAlbumPage
        }
      }
      
      return {
        success: false,
        status: 404,
        data: {} as MemoryAlbumPage,
        error: "Page not found"
      }
    } catch (error) {
      console.error("Error fetching page:", error)
      return { 
        success: false, 
        status: 500,
        data: {} as MemoryAlbumPage, 
        error: "Failed to fetch page" 
      }
    }
  }

  static async createPage(data: CreateMemoryAlbumPageRequest): Promise<ApiResponse<MemoryAlbumPage>> {
    try {
      console.log("Creating page")
      const formData = new FormData()
      
      formData.append('album', data.album.toString())
      formData.append('page_number', data.page_number.toString())
      formData.append('page_type', data.page_type)
      formData.append('template_name', data.template_name)
      
      if (data.template !== undefined) formData.append('template', data.template.toString())
      if (data.background !== undefined) formData.append('background', data.background.toString())
      if (data.title) formData.append('title', data.title)
      if (data.data) formData.append('data', JSON.stringify(data.data))
      if (data.image_file) formData.append('image_file', data.image_file)
      if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata))
      
      const response = await apiClient.post<MemoryAlbumPage>(
        "eventhub/memory-album-pages/",
        formData
      )
      
      console.log("Create page response:", response)
      return response
    } catch (error) {
      console.error("Error creating page:", error)
      return { 
        success: false, 
        status: 500,
        data: {} as MemoryAlbumPage, 
        error: "Failed to create page" 
      }
    }
  }

  static async updatePage(id: number, data: UpdateMemoryAlbumPageRequest): Promise<ApiResponse<MemoryAlbumPage>> {
    try {
      console.log(`Updating page ${id}`)
      
      if (data.image_file) {
        // If there's a file, use FormData
        const formData = new FormData()
        
        if (data.page_number !== undefined) formData.append('page_number', data.page_number.toString())
        if (data.page_type) formData.append('page_type', data.page_type)
        if (data.template_name) formData.append('template_name', data.template_name)
        if (data.template !== undefined) formData.append('template', data.template.toString())
        if (data.background !== undefined) formData.append('background', data.background.toString())
        if (data.title !== undefined) formData.append('title', data.title)
        if (data.data !== undefined) formData.append('data', JSON.stringify(data.data))
        if (data.image_file) formData.append('image_file', data.image_file)
        if (data.metadata !== undefined) formData.append('metadata', JSON.stringify(data.metadata))
        
        const response = await apiClient.put<MemoryAlbumPage>(
          `eventhub/memory-album-pages/${id}/`,
          formData
        )
        
        console.log("Update page response:", response)
        return response
      } else {
        // No file, use regular JSON
        const response = await apiClient.put<MemoryAlbumPage>(`eventhub/memory-album-pages/${id}/`, data)
        console.log("Update page response:", response)
        return response
      }
    } catch (error) {
      console.error("Error updating page:", error)
      return { 
        success: false, 
        status: 500,
        data: {} as MemoryAlbumPage, 
        error: "Failed to update page" 
      }
    }
  }

  static async deletePage(id: number): Promise<ApiResponse<void>> {
    try {
      console.log(`Deleting page ${id}`)
      const response = await apiClient.delete<void>(`eventhub/memory-album-pages/${id}/`)
      console.log("Delete page response:", response)
      return response
    } catch (error) {
      console.error("Error deleting page:", error)
      return { 
        success: false, 
        status: 500,
        data: undefined, 
        error: "Failed to delete page" 
      }
    }
  }
}
