import { apiClient, type ApiResponse } from "@/lib/api"
import type {
  EventProfile,
  EventProfileListResponse,
  CreateEventProfileRequest,
  UpdateEventProfileRequest,
  PatchEventProfileRequest,
} from "@/types/eventhub/eventhub"

export class EventHubService {
  /**
   * Listar todos los perfiles de eventos
   * GET /api/eventhub/profiles/
   */
  static async getProfiles(): Promise<ApiResponse<EventProfileListResponse>> {
    return apiClient.get<EventProfileListResponse>("eventhub/profiles/")
  }

  /**
   * Crear un nuevo perfil de evento
   * POST /api/eventhub/profiles/
   */
  static async createProfile(
    profile: CreateEventProfileRequest
  ): Promise<ApiResponse<EventProfile>> {
    return apiClient.post<EventProfile>("eventhub/profiles/", profile)
  }

  /**
   * Obtener un perfil de evento por ID
   * GET /api/eventhub/profiles/{id}/
   */
  static async getProfileById(id: number): Promise<ApiResponse<EventProfile>> {
    return apiClient.get<EventProfile>(`eventhub/profiles/${id}/`)
  }

  /**
   * Actualizar completamente un perfil de evento
   * PUT /api/eventhub/profiles/{id}/
   */
  static async updateProfile(
    id: number,
    profile: UpdateEventProfileRequest
  ): Promise<ApiResponse<EventProfile>> {
    return apiClient.put<EventProfile>(`eventhub/profiles/${id}/`, profile)
  }

  /**
   * Actualización parcial de un perfil de evento
   * PATCH /api/eventhub/profiles/{id}/
   */
  static async patchProfile(
    id: number,
    profile: PatchEventProfileRequest
  ): Promise<ApiResponse<EventProfile>> {
    return apiClient.patch<EventProfile>(`eventhub/profiles/${id}/`, profile)
  }
}
