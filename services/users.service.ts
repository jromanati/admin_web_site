import { apiClient, type ApiResponse } from "@/lib/api"
import type { User, UserResponse } from "@/types/users"

export class UsersService {
  static async getUsers(): Promise<ApiResponse<UserResponse>> {
    const usersStored = localStorage.getItem("users")
    // if (usersStored) {
    //   try {
    //     const parsed = JSON.parse(usersStored)
    //     return parsed
    //   } catch (e) {
    //     console.error("Error parsing users from localStorage", e)
    //   }
    // }
    const response = await apiClient.get<UserResponse>("users")
    localStorage.setItem("users", JSON.stringify(response.data))
    return response.data
  }

  static async createUser(user:User): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.post<UserResponse>("users/create/", user)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }

    return response
  }

  static async updateUser(user:User, id:number): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.put<UserResponse>(`users/${id}/`, user)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }

  static async activeUser(id:number): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.get<UserResponse>(`users/${id}/active/`)
    if (response.success) {
      return response
    }
    else if (response.error) {
      console.error("Error creating:", response.error)
      return response
    }
    return response
  }

  static async deleteUser(id:number): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.delete<UserResponse>(`users/${id}/delete/`)
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
