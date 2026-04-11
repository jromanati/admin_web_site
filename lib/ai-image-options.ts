export type RoomType =
  | "living_room"
  | "dining_room"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "office"

export type Operation =
  | "empty_room"
  | "remove_decor"
  | "paint_walls"
  | "add_furniture"
  | "improve_lighting"
  | "add_plants"
  | "redecorate"
  | "decorate_room"

export type Style =
  | "modern"
  | "scandinavian"
  | "minimalist"
  | "industrial"
  | "luxury"
  | "classic"

export type WallColor = "warm_white" | "off_white" | "light_gray" | "beige" | "taupe"

export type AIImagePayload = {
  image_url?: string | null
  operation?: Operation
  room_type?: RoomType
  style?: Style
  furniture_style?: Style
  wall_color?: WallColor

  preserve_architecture?: boolean
  improve_lighting?: boolean
  declutter?: boolean
  clean_background?: boolean
  remove_personal_items?: boolean
  remove_furniture?: boolean
  remove_decor?: boolean
  staging?: boolean
  make_empty_clean?: boolean
  extra_instructions?: string | null
}

export const AI_IMAGE_OPTIONS = {
  roomTypes: [
    { value: "living_room", label: "Living" },
    { value: "dining_room", label: "Comedor" },
    { value: "bedroom", label: "Dormitorio" },
    { value: "kitchen", label: "Cocina" },
    { value: "bathroom", label: "Baño" },
    { value: "office", label: "Oficina" },
  ] as const,
  operations: [
    { value: "improve_lighting", label: "Mejorar iluminación" },
    { value: "empty_room", label: "Vaciar / limpiar" },
    { value: "add_furniture", label: "Agregar muebles" },
    { value: "decorate_room", label: "Decorar" },
    { value: "paint_walls", label: "Pintar muros" },
    { value: "add_plants", label: "Agregar plantas" },
    { value: "remove_decor", label: "Quitar decoración" },
    { value: "redecorate", label: "Redecorar" },
  ] as const,
  styles: [
    { value: "modern", label: "Moderno" },
    { value: "scandinavian", label: "Escandinavo" },
    { value: "minimalist", label: "Minimalista" },
    { value: "industrial", label: "Industrial" },
    { value: "luxury", label: "Lujo" },
    { value: "classic", label: "Clásico" },
  ] as const,
  wallColors: [
    { value: "warm_white", label: "Blanco cálido" },
    { value: "off_white", label: "Blanco roto" },
    { value: "light_gray", label: "Gris claro" },
    { value: "beige", label: "Beige" },
    { value: "taupe", label: "Taupe" },
  ] as const,
} as const

export const getOperationOptions = (operation: Operation) => {
  return {
    showStyle: true,
    showWallColor: operation === "paint_walls",
  }
}
