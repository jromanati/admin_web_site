import { apiClient } from "@/lib/api"
import type {
  GuestGroup,
  CreateGuestGroupRequest,
  UpdateGuestGroupRequest,
  GuestGroupsResponse,
  GuestGroupResponse,
  EventTable,
  CreateEventTableRequest,
  UpdateEventTableRequest,
  EventTablesResponse,
  EventTableResponse,
  Guest,
  CreateGuestRequest,
  UpdateGuestRequest,
  GuestsResponse,
  GuestResponse,
  GuestCompanion,
  CreateGuestCompanionRequest,
  UpdateGuestCompanionRequest,
  GuestCompanionsResponse,
  GuestCompanionResponse
} from "@/types/eventhub/guests"

// Guest Groups Service
export class GuestGroupsService {
  static async getGuestGroups(): Promise<GuestGroupsResponse> {
    try {
      console.log("Fetching guest groups from eventhub/guest-groups/")
      const response = await apiClient.get<GuestGroupsResponse>("eventhub/guest-groups/")
      console.log("API response:", response)
      
      // Handle different response formats
      if (response.success && response.data) {
        // If response has data array directly, convert to paginated format
        if (Array.isArray(response.data)) {
          return {
            count: response.data.length,
            next: null,
            previous: null,
            results: response.data
          }
        }
        // If response.data is already paginated
        return response.data as GuestGroupsResponse
      }
      
      // Fallback for error or unexpected format
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    } catch (error) {
      console.error("Error fetching guest groups:", error)
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    }
  }

  static async getGuestGroupById(id: number): Promise<GuestGroupResponse> {
    try {
      const response = await apiClient.get<GuestGroup>(`eventhub/guest-groups/${id}/`)
      return response
    } catch (error) {
      console.error("Error fetching guest group:", error)
      return { success: false, error: "Failed to fetch guest group" }
    }
  }

  static async createGuestGroup(guestGroup: CreateGuestGroupRequest): Promise<GuestGroupResponse> {
    try {
      const response = await apiClient.post<GuestGroup>("eventhub/guest-groups/", guestGroup)
      return response
    } catch (error) {
      console.error("Error creating guest group:", error)
      return { success: false, error: "Failed to create guest group" }
    }
  }

  static async updateGuestGroup(id: number, guestGroup: UpdateGuestGroupRequest): Promise<GuestGroupResponse> {
    try {
      console.log(`Updating guest group ${id} with PUT method`)
      const response = await apiClient.put<GuestGroup>(`eventhub/guest-groups/${id}/`, guestGroup)
      console.log("Update response:", response)
      return response
    } catch (error) {
      console.error("Error updating guest group:", error)
      return { success: false, error: "Failed to update guest group" }
    }
  }

  static async deleteGuestGroup(id: number): Promise<GuestGroupResponse> {
    try {
      const response = await apiClient.delete<GuestGroup>(`eventhub/guest-groups/${id}/`)
      return response
    } catch (error) {
      console.error("Error deleting guest group:", error)
      return { success: false, error: "Failed to delete guest group" }
    }
  }
}

// Event Tables Service
export class EventTablesService {
  static async getTables(): Promise<EventTablesResponse> {
    try {
      console.log("Fetching tables from eventhub/tables/")
      const response = await apiClient.get<EventTablesResponse>("eventhub/tables/")
      console.log("API response:", response)
      
      // Handle different response formats
      if (response.success && response.data) {
        // If response has data array directly, convert to paginated format
        if (Array.isArray(response.data)) {
          return {
            count: response.data.length,
            next: null,
            previous: null,
            results: response.data
          }
        }
        // If response.data is already paginated
        return response.data as EventTablesResponse
      }
      
      // Fallback for error or unexpected format
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    } catch (error) {
      console.error("Error fetching tables:", error)
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    }
  }

  static async getTableById(id: number): Promise<EventTableResponse> {
    try {
      const response = await apiClient.get<EventTable>(`eventhub/tables/${id}/`)
      return response
    } catch (error) {
      console.error("Error fetching table:", error)
      return { success: false, error: "Failed to fetch table" }
    }
  }

  static async createTable(table: CreateEventTableRequest): Promise<EventTableResponse> {
    try {
      const response = await apiClient.post<EventTable>("eventhub/tables/", table)
      return response
    } catch (error) {
      console.error("Error creating table:", error)
      return { success: false, error: "Failed to create table" }
    }
  }

  static async updateTable(id: number, table: UpdateEventTableRequest): Promise<EventTableResponse> {
    try {
      console.log(`Updating table ${id} with PUT method`)
      const response = await apiClient.put<EventTable>(`eventhub/tables/${id}/`, table)
      console.log("Update response:", response)
      return response
    } catch (error) {
      console.error("Error updating table:", error)
      return { success: false, error: "Failed to update table" }
    }
  }

  static async deleteTable(id: number): Promise<EventTableResponse> {
    try {
      const response = await apiClient.delete<EventTable>(`eventhub/tables/${id}/`)
      return response
    } catch (error) {
      console.error("Error deleting table:", error)
      return { success: false, error: "Failed to delete table" }
    }
  }
}

// Guests Service
export class GuestsService {
  static async getGuests(): Promise<GuestsResponse> {
    try {
      console.log("Fetching guests from eventhub/guests/")
      const response = await apiClient.get<GuestsResponse>("eventhub/guests/")
      console.log("API response:", response)
      
      // Handle different response formats
      if (response.success && response.data) {
        // If response has data array directly, convert to paginated format
        if (Array.isArray(response.data)) {
          return {
            count: response.data.length,
            next: null,
            previous: null,
            results: response.data
          }
        }
        // If response.data is already paginated
        return response.data as GuestsResponse
      }
      
      // Fallback for error or unexpected format
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    } catch (error) {
      console.error("Error fetching guests:", error)
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    }
  }

  static async getGuestById(id: number): Promise<GuestResponse> {
    try {
      console.log(`Fetching guest ${id} from eventhub/guests/${id}/`)
      const response = await apiClient.get<Guest>(`eventhub/guests/${id}/`)
      console.log("API response:", response)
      
      // Handle different response formats
      if (response.success && response.data) {
        // Return the actual guest data in the expected format
        return {
          success: true,
          data: response.data
        }
      }
      
      // If response is already the guest object (success case)
      if (!('success' in response) && (response as any).id) {
        return {
          success: true,
          data: response as Guest
        }
      }
      
      // Error case
      return {
        success: false,
        error: "Guest not found"
      }
    } catch (error) {
      console.error("Error fetching guest:", error)
      return { success: false, error: "Failed to fetch guest" }
    }
  }

  static async createGuest(guest: CreateGuestRequest): Promise<GuestResponse> {
    try {
      const response = await apiClient.post<Guest>("eventhub/guests/", guest)
      return response
    } catch (error) {
      console.error("Error creating guest:", error)
      return { success: false, error: "Failed to create guest" }
    }
  }

  static async updateGuest(id: number, guest: UpdateGuestRequest): Promise<GuestResponse> {
    try {
      console.log(`Updating guest ${id} with PUT method`)
      const response = await apiClient.put<Guest>(`eventhub/guests/${id}/`, guest)
      console.log("Update response:", response)
      return response
    } catch (error) {
      console.error("Error updating guest:", error)
      return { success: false, error: "Failed to update guest" }
    }
  }

  static async deleteGuest(id: number): Promise<GuestResponse> {
    try {
      const response = await apiClient.delete<Guest>(`eventhub/guests/${id}/`)
      return response
    } catch (error) {
      console.error("Error deleting guest:", error)
      return { success: false, error: "Failed to delete guest" }
    }
  }

  static async checkInGuest(id: number): Promise<GuestResponse> {
    try {
      const response = await apiClient.patch<Guest>(`eventhub/guests/${id}/`, {
        checked_in_at: new Date().toISOString()
      })
      return response
    } catch (error) {
      console.error("Error checking in guest:", error)
      return { success: false, error: "Failed to check in guest" }
    }
  }
}

// Guest Companions Service
export class GuestCompanionsService {
  static async getCompanions(): Promise<GuestCompanionsResponse> {
    try {
      console.log("Fetching companions from eventhub/companions/")
      const response = await apiClient.get<GuestCompanionsResponse>("eventhub/companions/")
      console.log("API response:", response)
      
      // Handle different response formats
      if (response.success && response.data) {
        // If response has data array directly, convert to paginated format
        if (Array.isArray(response.data)) {
          return {
            count: response.data.length,
            next: null,
            previous: null,
            results: response.data
          }
        }
        // If response.data is already paginated
        return response.data as GuestCompanionsResponse
      }
      
      // Fallback for error or unexpected format
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    } catch (error) {
      console.error("Error fetching companions:", error)
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    }
  }

  static async getCompanionById(id: number): Promise<GuestCompanionResponse> {
    try {
      const response = await apiClient.get<GuestCompanion>(`eventhub/companions/${id}/`)
      return response
    } catch (error) {
      console.error("Error fetching companion:", error)
      return { success: false, error: "Failed to fetch companion" }
    }
  }

  static async getCompanionsByGuest(guestId: number): Promise<GuestCompanionsResponse> {
    try {
      console.log(`Fetching companions for guest ${guestId} from eventhub/companions/?guest=${guestId}`)
      const response = await apiClient.get<GuestCompanionsResponse>(`eventhub/companions/?guest=${guestId}`)
      console.log("API response:", response)
      
      // Handle different response formats
      if (response.success && response.data) {
        // If response has data array directly, convert to paginated format
        if (Array.isArray(response.data)) {
          return {
            count: response.data.length,
            next: null,
            previous: null,
            results: response.data
          }
        }
        // If response.data is already paginated
        return response.data as GuestCompanionsResponse
      }
      
      // Fallback for error or unexpected format
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    } catch (error) {
      console.error("Error fetching companions for guest:", error)
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      }
    }
  }

  static async createCompanion(companion: CreateGuestCompanionRequest): Promise<GuestCompanionResponse> {
    try {
      const response = await apiClient.post<GuestCompanion>("eventhub/companions/", companion)
      return response
    } catch (error) {
      console.error("Error creating companion:", error)
      return { success: false, error: "Failed to create companion" }
    }
  }

  static async updateCompanion(id: number, companion: UpdateGuestCompanionRequest): Promise<GuestCompanionResponse> {
    try {
      console.log(`Updating companion ${id} with PUT method`)
      const response = await apiClient.put<GuestCompanion>(`eventhub/companions/${id}/`, companion)
      console.log("Update response:", response)
      return response
    } catch (error) {
      console.error("Error updating companion:", error)
      return { success: false, error: "Failed to update companion" }
    }
  }

  static async deleteCompanion(id: number): Promise<GuestCompanionResponse> {
    try {
      const response = await apiClient.delete<GuestCompanion>(`eventhub/companions/${id}/`)
      return response
    } catch (error) {
      console.error("Error deleting companion:", error)
      return { success: false, error: "Failed to delete companion" }
    }
  }

  static async checkInCompanion(id: number): Promise<GuestCompanionResponse> {
    try {
      const response = await apiClient.patch<GuestCompanion>(`eventhub/companions/${id}/`, {
        checked_in_at: new Date().toISOString()
      })
      return response
    } catch (error) {
      console.error("Error checking in companion:", error)
      return { success: false, error: "Failed to check in companion" }
    }
  }
}
