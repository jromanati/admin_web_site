const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/"

export interface ApiResponse<T> {
  success: boolean
  status?: number
  data?: T
  message?: string
  error?: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null
  private refreshPromise: Promise<boolean> | null = null
  private isRedirectingToLogin = false
  

  constructor() {
    this.baseUrl = this.getDynamicBaseUrl()
  }

  private redirectToLogin(): void {
    if (typeof window === "undefined") return
    if (this.isRedirectingToLogin) return
    this.isRedirectingToLogin = true

    try {
      // Limpiar lo mínimo necesario para forzar re-login
      this.setToken(null)
      this.setRefresh(null)
      localStorage.removeItem("token_expiry")
      localStorage.removeItem("refresh_expiry")
      localStorage.removeItem("schema_name")
      localStorage.removeItem("user_data")
      localStorage.removeItem("tenant_data")
      localStorage.removeItem("userType")
      localStorage.removeItem("userEmail")
    } finally {
      window.location.href = "/"
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise

    this.refreshPromise = (async () => {
      try {
        const refresh = localStorage.getItem("token_refresh")
        if (!refresh) return false

        const url = `${this.baseUrl}token/refresh/`
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ refresh }),
        })

        const rawText = await response.text()
        let data: any = null
        try {
          data = rawText ? JSON.parse(rawText) : null
        } catch {
          data = rawText
        }

        if (!response.ok || !data?.access) {
          return false
        }

        // Mantener comportamiento equivalente a AuthService.setTokens,
        // pero sin importar AuthService para evitar dependencias circulares.
        this.setToken(data.access)
        if (data.refresh) this.setRefresh(data.refresh)
        if (data?.tenant?.schema_name) this.setTenant(data.tenant.schema_name)
        if (data?.user) this.setUser(JSON.stringify(data.user))
        if (data?.tenant) this.setTenantData(JSON.stringify(data.tenant))
        if (typeof data?.expires_in !== "undefined" && data.expires_in !== null) {
          this.setTokenExpiry(String(data.expires_in))
        }
        if (
          typeof data?.refresh_expires_in !== "undefined" &&
          data.refresh_expires_in !== null
        ) {
          this.setRefreshExpiry(String(data.refresh_expires_in))
        }

        return true
      } catch {
        return false
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  private getDynamicBaseUrl(): string {
    // NEXT_PUBLIC_API_URL=https://base.sitios.softwarelabs.cl/api/
    if (typeof window === "undefined") {
      return DEFAULT_API_BASE // ⚠️ Estamos en el servidor, usa el base por defecto
    }
    const schema = localStorage.getItem("schema_name")
    // local
    // const host = window.location.hostname.includes("localhost") ? "localhost:8000" : "api.autopartes.cl"
    // return schema ? `http://${schema}.${host}/api/` : DEFAULT_API_BASE
    // Produccion
    const DEFAULT_API_BASE_PROD = "https://base.sitios.softwarelabs.cl/api/"
    const host = "sitios.softwarelabs.cl"
    return schema ? `https://${schema}.${host}/api/` : DEFAULT_API_BASE_PROD

    // TELEFONO
    // const host2 = "192.168.1.81.nip.io:8000"
    // const DEFAULT_API_BASE2 = "http://base.192.168.1.81.nip.io:8000/api/"
    // console.log("Using API Base URL:", schema ? `http://${schema}.${host2}/api/` : DEFAULT_API_BASE2)
    // return schema ? `http://${schema}.${host2}/api/` : DEFAULT_API_BASE2
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

      if (response.status === 401 && !(options as any)?.__retry) {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          return this.request<T>(endpoint, { ...(options as any), __retry: true })
        }

        this.redirectToLogin()
      }

      const rawText = await response.text()
      let data: any = null
      try {
        data = rawText ? JSON.parse(rawText) : null
      } catch {
        data = rawText
      }

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          error:
            (data && (data.message || data.error)) ||
            (typeof data === "string" && data.trim().length > 0 ? data : null) ||
            `HTTP Error: ${response.status}`,
          data: data
        }
      }

      return {
        success: true,
        status: response.status,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }


  get<T>(endpoint: string, headers?: Record<string, string>, options?: RequestInit) {
    return this.request<T>(endpoint, { ...(options || {}), method: "GET", headers })
  }

  post<T>(endpoint: string, body?: any, headers?: Record<string, string>, options?: RequestInit) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData

    return this.request<T>(endpoint, {
      ...(options || {}),
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


  put<T>(endpoint: string, body?: any, headers?: Record<string, string>, options?: RequestInit) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData

    return this.request<T>(endpoint, {
      ...(options || {}),
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

  delete<T>(endpoint: string, headers?: Record<string, string>, options?: RequestInit) {
    return this.request<T>(endpoint, { ...(options || {}), method: "DELETE", headers })
  }
}

export const apiClient = new ApiClient()
