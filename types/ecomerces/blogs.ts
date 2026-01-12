export type BlogType = "evento" | "bandas" | "entrevista" | "resenas" | "historia" | "tutoriales"

export interface BlogSection {
  id: number
  blog: number
  titulo: string
  detalle?: string | null
  image_url?: string | null
  image_public_id?: string | null
}

export interface Blog {
  id: number
  titulo: string
  descripcion?: string | null
  autor: string
  fecha: string
  tipo_blog: BlogType
  image_public_id?: string | null
  image_url?: string | null
  sections: BlogSection[]
}

export interface BlogFormInput {
  id?: number
  titulo: string
  descripcion?: string
  autor: string
  fecha: string
  tipo_blog: BlogType
  main_image?: File | null
}

export interface BlogSectionFormInput {
  id?: number
  blogId: number
  titulo: string
  detalle?: string
  main_image?: File | null
}
