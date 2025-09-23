export interface Review {
  id: string
  productId: string
  productName: string
  customerName: string
  customerEmail: string
  rating: number
  comment: string
  date: string
  status: "pending" | "approved" | "rejected"
  orderId: string
  helpful: number
  reported: number
}