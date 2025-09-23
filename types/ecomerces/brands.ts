// types/brand.ts

// Valores válidos según BrandSocialLink.Platform en tu modelo
export type BrandPlatform =
  | "website"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "x"
  | "youtube"
  | "linkedin"
  | "other";

export interface BrandSocialLink {
  id?: number;              // presente al leer desde el API
  brand?: number;           // al crear/editar puedes enviar el id de la marca (si tu API lo usa así)
  platform: BrandPlatform;  // enum según tu modelo
  url: string;
  is_primary?: boolean;
  created_at?: string;      // ISO string (respuesta del API)
  updated_at?: string;      // ISO string (respuesta del API)
}

export interface Brand {
  id?: number;              // presente al leer desde el API
  name: string;
  slug?: string;            // si no lo envías, el back lo genera desde name
  description?: string;
  country?: string;         // código/país libre según tu modelo
  website?: string;
  email?: string;
  logo_url?: string;        // URL (ej. Cloudinary)
  cover_url?: string;       // URL (ej. Cloudinary)
  is_active?: boolean;
  created_at?: string;      // ISO string
  updated_at?: string;      // ISO string

  // Si tu serializer incluye relaciones (related_name="social_links"):
  social_links?: BrandSocialLink[];

  // Si usaste el Serializer con products_count que te dejé antes:
  products_count?: number;
  logo_image?: File;        // URL (ej. Cloudinary)
  deleted_logo_image: boolean;
}

/** Payloads típicos para el cliente */
export type BrandCreatePayload = Omit<
  Brand,
  "id" | "created_at" | "updated_at" | "products_count"
>;

export type BrandUpdatePayload = Partial<BrandCreatePayload>;

/** (Opcional) filtros que usas en tu vista ListCreate */
export interface BrandQuery {
  q?: string;
  is_active?: boolean;        // tu API acepta "true"/"false"; desde UI lo puedes mapear
  ordering?: string;          // ej. "name", "-created_at"
}

/** (Opcional) respuesta paginada si usas DRF pagination */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
