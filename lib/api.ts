const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null
  

  constructor() {
    this.baseUrl = this.getDynamicBaseUrl()
  }

  private getDynamicBaseUrl(): string {
    if (typeof window === "undefined") {
      return DEFAULT_API_BASE // ⚠️ Estamos en el servidor, usa el base por defecto
    }
    const schema = localStorage.getItem("schema_name")
    // local
    // const host = window.location.hostname.includes("localhost") ? "localhost:8000" : "api.autopartes.cl"
    // return schema ? `http://${schema}.${host}/api/` : DEFAULT_API_BASE
    const host = "sitios.softwarelabs.cl"
    console.log(schema ? `https://${schema}.${host}/api/` : DEFAULT_API_BASE)
    return schema ? `https://${schema}.${host}/api/` : DEFAULT_API_BASE
    // const host2 = "192.168.1.81.nip.io:8000"
    // const DEFAULT_API_BASE2 = "http://base.192.168.1.81.nip.io:8000/api/"
    // console.log("Using API Base URL:", schema ? `http://${schema}.${host2}/api/` : DEFAULT_API_BASE2)
    return schema ? `http://${schema}.${host2}/api/` : DEFAULT_API_BASE2
  }

  setToken(token: string | null) {
    localStorage.setItem("token", token || "")
    this.token = token
  }

  setRefresh(token_refresh: string | null) {
    localStorage.setItem("token_refresh", token_refresh || "")
  }

  setTokenExpiry(token_expiry: string | null) {
    const now = Math.floor(Date.now() / 1000)
    const accessExpiryTimestamp = now + token_expiry 
    localStorage.setItem("token_expiry", String(accessExpiryTimestamp))
  }

  setRefreshExpiry(refresh_expires: string | null) {
    const now = Math.floor(Date.now() / 1000)
    const refreshExpiryTimestamp = now + refresh_expires
    localStorage.setItem("refresh_expiry", String(refreshExpiryTimestamp))
  }

  setTenant(schema_name: string) {
    localStorage.setItem("schema_name", schema_name)
    this.baseUrl = this.getDynamicBaseUrl()
  }

  setUser(user_data: string) {
    localStorage.setItem("user_data", user_data)
  }

  setTenantData(tenant_data: string) {
    localStorage.setItem("tenant_data", tenant_data)
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const token = localStorage.getItem("token")

      const mergedHeaders: HeadersInit = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }

      const response = await fetch(url, {
        ...options,
        headers: mergedHeaders,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP Error: ${response.status}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }


  get<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "GET", headers })
  }

  post<T>(endpoint: string, body?: any, headers?: Record<string, string>) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData

    return this.request<T>(endpoint, {
      method: "POST",
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      headers: {
        ...(isFormData
          ? {} // No ponemos Content-Type si es FormData
          : { "Content-Type": "application/json" }),
        Accept: "application/json",
        ...(headers || {}),
      },
    })
  }


  put<T>(endpoint: string, body?: any, headers?: Record<string, string>) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData

    return this.request<T>(endpoint, {
      method: "PUT",
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      headers: {
        ...(isFormData
          ? {} // No ponemos Content-Type si es FormData
          : { "Content-Type": "application/json" }),
        Accept: "application/json",
        ...(headers || {}),
      },
    })
  }

  delete<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "DELETE", headers })
  }
}

export const apiClient = new ApiClient()
