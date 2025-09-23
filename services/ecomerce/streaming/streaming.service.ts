import { apiClient, type ApiResponse } from "@/lib/api"
import type { StreamConfig, ScheduledStream } from "@/types/ecomerces/streaming"

export class StreamConfigService {
  private static token: string | null = null
  private static tokenExpiry: number | null = null

  static async getStreamConfig(): Promise<ApiResponse<StreamConfig>> {
    const response = await apiClient.get<StreamConfig>("stream_config")
    const stream_config = response.data
    return stream_config
  }

  static async postStreamConfig(stream_config:StreamConfig): Promise<ApiResponse<StreamConfig>> {
    const formData = new FormData()
    formData.append("name", stream_config.name)
    formData.append("stream_url", stream_config.stream_url)
    formData.append("stream_key", stream_config.stream_key)
    let response = {
      success: false,
      error: '',
    }
    if (stream_config.id) {
      response = await apiClient.put<StreamConfig>(
        `stream_config/${stream_config.id}/update/`, formData)
    }
    else{
      response = await apiClient.post<StreamConfig>("stream_config/create/", formData)
    }
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }

  static async postScheduledStream(scheduled_stream:ScheduledStream): Promise<ApiResponse<StreamConfig>> {
    const formData = new FormData()
    formData.append("title", scheduled_stream.title)
    formData.append("description", scheduled_stream.description)
    formData.append("scheduled_date", scheduled_stream.scheduled_date)
    formData.append("duration", scheduled_stream.duration)
    formData.append("main_image", scheduled_stream.main_image)
    if (scheduled_stream.stream_url){
      formData.append("stream_url", scheduled_stream.stream_url)
    }
    if (scheduled_stream.viewers){
      formData.append("viewers", scheduled_stream.viewers)
    }
    if (scheduled_stream.status){
      formData.append("status", scheduled_stream.status)
    }
    let response = {
      success: false,
      error: '',
    }
    if (scheduled_stream.id) {
      response = await apiClient.put<StreamConfig>(
        `scheduled_stream/${scheduled_stream.id}/update/`, formData)
    }
    else{
      response = await apiClient.post<StreamConfig>("scheduled_stream/create/", formData)
    }
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }

  static async deleteScheduledStream(id:number): Promise<ApiResponse<ScheduledStream>> {
    const response = await apiClient.delete<ScheduledStream>(`scheduled_stream/${id}/delete/`)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
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

}
