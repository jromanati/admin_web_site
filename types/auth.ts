export interface AuthCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  access: string
  refresh: string
  expires_in: number
  refresh_expires_in: number
  user: {
    email: string
    first_name: string
    last_name: string
  }
  tenant: {
    schema_name: string
    client_type: "ecommerce" | "properties" | "excursions"
  }
}