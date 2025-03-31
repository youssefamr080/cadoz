export interface OrderItem {
  id: number
  name: string
  image: string
  price: number
  quantity: number
  variant?: string
  discount?: number
  originalPrice?: number
  giftDetails?: string
  giftData?: {
    items: Array<{
      name: string
      quantity: number
      image: string
      price: number
    }>
    box: {
      name: string
      image: string
      price: number
    } | null
    wrap: {
      name: string
      image: string
      price: number
    } | null
    message?: string
    recipient?: string
  }
}

export interface Order {
  id: string
  customerId?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  items: OrderItem[]
  shipping: {
    governorate: string
    address?: string
    phone?: string
    notes?: string
  }
  payment: {
    method: "cash_on_delivery" | "credit_card" | "bank_transfer"
    status: "pending" | "paid" | "failed" | "refunded"
    transactionId?: string
  }
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  totals: {
    subtotal: number
    shippingFees: number
    discount: number
    tax: number
    total: number
  }
  promoCode?: {
    code: string
    discountPercentage: number
  }
  createdAt: Date
  updatedAt: Date
  shippedAt?: Date
  deliveredAt?: Date
  cancelledAt?: Date
  trackingNumber?: string
  notes?: string
  source: "website" | "whatsapp" | "phone" | "instagram"
}

