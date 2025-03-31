import type { Document } from "mongodb"

export interface ICustomer extends Document {
  id: string
  name: string
  phone: string
  email?: string
  password: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  lastIp?: string
  lastUserAgent?: string
  isActive: boolean
  currentSessionId?: string
  loginCount: number
  devices: Array<{
    deviceId: string
    userAgent: string
    ip: string
    lastUsedAt: Date
  }>
  lastProductViewed?: number
  lastActiveAt?: Date
  totalProductViews?: number
  totalViewDuration?: number
  viewCount?: number
  averageViewDuration?: number
  preferences?: {
    categories?: string[]
    favoriteColors?: string[]
    priceRange?: {
      min: number
      max: number
    }
    notificationPreferences?: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }
  addresses?: Array<{
    id: string
    title: string
    governorate: string
    city: string
    street: string
    building: string
    apartment?: string
    landmark?: string
    isDefault: boolean
  }>
}

export interface CustomerSession {
  userId: string
  sessionId: string
  startedAt: Date
  endedAt?: Date
  device: {
    userAgent: string
    ip: string
    type: string
    browser: string
    os: string
  }
  isActive: boolean
  lastActiveAt?: Date
  totalDuration?: number
}

export interface LoginAttempt {
  userId?: string
  phone: string
  success: boolean
  reason?: string
  timestamp: Date
  ip: string
  userAgent: string
  sessionId?: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  password: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  orders: string[] // Definido explícitamente como un array de strings
  orderCount: number
  lastOrderAt?: Date
  preferences?: {
    categories?: string[]
    favoriteProducts?: number[]
    recentlyViewed?: number[]
  }
  addresses?: {
    governorate: string
    address: string
    notes?: string
    isDefault?: boolean
  }[]
  notifications?: {
    email: boolean
    sms: boolean
    whatsapp: boolean
  }
}

