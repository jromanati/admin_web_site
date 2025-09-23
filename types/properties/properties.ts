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
  property_type: PropertyTypeEnum
  bedrooms?: number
  bathrooms?: number
  region: string
  commune: string
  address: string
  parking?: number
  storage: boolean
  images?: PropertyImage[]
  deleted_images?: []
  video: null,
}

export enum PropertyTypeEnum {
  CASA = "Casa",
  DEPARTAMENTO = "Departamento",
  LOCAL = "Local",
  OFICINA = "Oficina",
  TERRENO = "Terreno",
  BODEGA = "Bodega",
  PARCELA = "Parcela",
}

export enum OperationEnum {
  VENTA = "Venta",
  ARRIENDO = "Arriendo",
  VENTA_ARRIENDO = "Venta y Arriendo",
}

export enum StateEnum {
  NUEVA = "Nueva",
  USADA = "Usada",
  EN_CONSTRUCCION = "En Construcción",
  PROYECTO = "Proyecto",
}

export enum PriceTypeEnum {
  FIJO = "Fijo",
  NEGOCIABLE = "Negociable",
  DESDE = "Desde",
  CONSULTAR = "Consultar",
}
