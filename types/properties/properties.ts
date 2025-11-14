// Property management types
export interface PropertyImage {
  id?: number
  url: string
  public_id?: string
  created_at?: string
}
export interface Property {
  title: string
  code: string
  published: boolean
  featured: boolean
  show_map: boolean
  map_src: string
  built_area?: number
  land_area?: number
  electricity: boolean
  water: string
  description: string
  amenities: string
  characteristics: string
  price?: number
  currency: string
  price_type: PriceTypeEnum
  operation: OperationEnum
  state: StateEnum
  property_state: PropertyStateEnum
  property_type: PropertyTypeEnum
  bedrooms?: number
  bathrooms?: number
  region: string
  commune: string
  address: string
  parking?: number
  storage: boolean
  mainImage: null
  mainImageDelete: boolean
  images?: PropertyImage[]
  deleted_images?: []
  video: null,
  videoDelete: boolean
}

export enum PropertyTypeEnum {
  CASA = "Casa",
  DEPARTAMENTO = "Departamento",
  DEPARTAMENTO_AMOBLADO = "Departamento amoblado",
  COMERCIAL = "Comercial",              // 👈 value del back
  NEGOCIO = "Negocio",
  OFICINA = "Oficina",
  PARCELA = "Parcela",
  RESIDENCIAL = "Residencial",          // 👈 igual que el back (si fue typo, así lo reflejamos)
  PROPIEDAD = "Propiedad",
  BODEGA = "Bodega",
  ESTACIONAMIENTO = "Estacionamiento",
  TERRENO = "Terreno",
}

export enum OperationEnum {
  VENTA = "Venta",
  ARRIENDO = "Arriendo",
  // VENTA_ARRIENDO = "Venta y Arriendo",
}

export enum StateEnum {
  NUEVA = "Nueva",
  USADA = "Usada",
}

export enum PriceTypeEnum {
  FIJO = "Fijo",
  NEGOCIABLE = "Negociable",
  DESDE = "Desde",
  CONSULTAR = "Consultar",
}

export enum PropertyStateEnum {
  DISPONIBLE = "Disponible",
  VENDIDA = "Vendida",
  ARRENDADA = "Arrendada",
  RESERVADA = "Reservada",
  NO_DISPONIBLE = "No disponible"
}