export interface FeatureDetail {
  id: number
  name: string,
  feature: number,
  // hexColor?: string // For color attributes
}

export interface Feature {
  id: number
  name: string,
  description: string,
}

export interface FeatureResponse {
  id: number,
  name: string,
  description: string,
  feature_detail: FeatureDetail[]
}