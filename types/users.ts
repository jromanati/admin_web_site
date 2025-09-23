export interface User {
  id: number
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
  is_superuser: boolean
}

export interface UserResponse extends User {
  is_superuser: boolean
  date_joined: string
  last_login: string
}