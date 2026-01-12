import { apiClient, type ApiResponse } from "@/lib/api"
import type { Blog, BlogFormInput, BlogSection, BlogSectionFormInput } from "@/types/ecomerces/blogs"

export class BlogsService {
  static async getBlogs(): Promise<ApiResponse<Blog[]>> {
    const response = await apiClient.get<Blog[]>("blogs/")
    return response
  }

	static async getBlog(id: number): Promise<ApiResponse<Blog>> {
		const response = await apiClient.get<Blog>(`blogs/${id}/`)
		return response
	}

  static buildFormData(input: BlogFormInput): FormData {
    const formData = new FormData()
    formData.append("titulo", input.titulo)
    formData.append("autor", input.autor)
    formData.append("fecha", input.fecha)
    formData.append("tipo_blog", input.tipo_blog)
    if (input.descripcion) {
      formData.append("descripcion", input.descripcion)
    }
    if (input.main_image instanceof File) {
      formData.append("main_image", input.main_image)
    }
    return formData
  }

  static async createBlog(input: BlogFormInput): Promise<ApiResponse<Blog>> {
    const formData = this.buildFormData(input)
    const response = await apiClient.post<Blog>("blogs/", formData)
    return response
  }

  static async updateBlog(id: number, input: BlogFormInput): Promise<ApiResponse<Blog>> {
    const formData = this.buildFormData(input)
    const response = await apiClient.put<Blog>(`blogs/${id}/`, formData)
    return response
  }

  static async deleteBlog(id: number): Promise<ApiResponse<{}>> {
    const response = await apiClient.delete<{}>(`blogs/${id}/`)
    return response
  }

	static async getSections(blogId: number): Promise<ApiResponse<BlogSection[]>> {
		const response = await apiClient.get<BlogSection[]>(`blogs/${blogId}/sections/`)
		return response
	}

	static async createSection(input: BlogSectionFormInput): Promise<ApiResponse<BlogSection>> {
		const formData = new FormData()
		formData.append("titulo", input.titulo)
		if (input.detalle) {
			formData.append("detalle", input.detalle)
		}
		if (input.main_image instanceof File) {
			formData.append("main_image", input.main_image)
		}
		formData.append("blog", input.blogId)
		const response = await apiClient.post<BlogSection>(`blogs/${input.blogId}/sections/`, formData)
		return response
	}

	static async updateSection(input: BlogSectionFormInput): Promise<ApiResponse<BlogSection>> {
		if (!input.id) {
			throw new Error("Section id requerido para actualizar")
		}
		const formData = new FormData()
		if (input.titulo) {
			formData.append("titulo", input.titulo)
		}
		if (input.detalle) {
			formData.append("detalle", input.detalle)
		}
		if (input.main_image instanceof File) {
			formData.append("main_image", input.main_image)
		}
		formData.append("blog", input.blogId)
		const response = await apiClient.put<BlogSection>(`blogs/sections/${input.id}/`, formData)
		return response
	}

	static async deleteSection(id: number): Promise<ApiResponse<{}>> {
		const response = await apiClient.delete<{}>(`blogs/sections/${id}/`)
		return response
	}
}
