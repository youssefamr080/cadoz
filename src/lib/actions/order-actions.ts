"use server"

import { prisma } from "@/lib/prisma"
import type { 
  Order, 
  OrderItem, 
  OrderStatus, 
  OrderSource,
  PaymentMethod,
  PaymentStatus,
  ShippingInfo,
  PaymentInfo,
  OrderTotals,
  PromoCode,
  Customer
} from "../../../prisma/generated/client"
import type { CustomGiftData } from "@/types/inspiration"

// نوع الطلب مع العناصر
export type FullOrder = Order & {
  items: OrderItem[]
  shipping?: ShippingInfo
  payment?: PaymentInfo
  totals?: OrderTotals
  promoCode?: PromoCode
  customer?: Customer
}

// إنشاء عنصر طلب (منتج عادي)
export interface CreateProductOrderItem {
  type: "product"
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  variant?: string
  discount?: number
  originalPrice?: number
}

// إنشاء عنصر طلب (هدية جاهزة)
export interface CreateInspirationOrderItem {
  type: "inspiration"
  inspirationId: string
  name: string
  image: string
  price: number
  quantity: number
  giftMessage?: string
  giftRecipient?: string
  discount?: number
  originalPrice?: number
}

// إنشاء عنصر طلب (هدية مخصصة)
export interface CreateCustomGiftOrderItem {
  type: "custom_gift"
  name: string
  image: string
  price: number
  quantity: number
  customGiftData: CustomGiftData
  giftMessage?: string
  giftRecipient?: string
  discount?: number
  originalPrice?: number
}

export type CreateOrderItemInput = CreateProductOrderItem | CreateInspirationOrderItem | CreateCustomGiftOrderItem

// إنشاء طلب جديد
export async function createOrder(data: {
  customerId?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  items: CreateOrderItemInput[]
  shippingInfo?: {
    governorate: string
    address?: string
    phone?: string
    notes?: string
  }
  paymentMethod?: PaymentMethod
  source?: OrderSource
  notes?: string
}) {
  try {
    // إنشاء الطلب الأساسي
    const order = await prisma.order.create({
      data: {
        customerId: data.customerId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        status: "PENDING",
        source: data.source || "WEBSITE",
        notes: data.notes
      }
    })

    // إنشاء عناصر الطلب
    const orderItems = await Promise.all(
      data.items.map(item => 
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            variant: "variant" in item ? item.variant : undefined,
            discount: item.discount,
            originalPrice: item.originalPrice,
            itemType: item.type,
            productId: item.type === "product" ? item.productId : null,
            inspirationId: item.type === "inspiration" ? item.inspirationId : null,
            customGiftData: item.type === "custom_gift" ? (item.customGiftData ? JSON.parse(JSON.stringify(item.customGiftData)) : null) : null,
            giftMessage: item.type !== "product" ? item.giftMessage : null,
            giftRecipient: item.type !== "product" ? item.giftRecipient : null
          }
        })
      )
    )

    // إنشاء معلومات الشحن إذا توفرت
    if (data.shippingInfo) {
      await prisma.shippingInfo.create({
        data: {
          ...data.shippingInfo,
          order: {
            connect: { id: order.id }
          }
        }
      })
    }

    // إنشاء معلومات الدفع إذا توفرت
    if (data.paymentMethod) {
      await prisma.paymentInfo.create({
        data: {
          method: data.paymentMethod,
          status: "PENDING",
          order: {
            connect: { id: order.id }
          }
        }
      })
    }

    // حساب الإجماليات
    const subtotal = orderItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    )
    const totalDiscount = orderItems.reduce((sum, item) => 
      sum + ((item.discount || 0) * item.quantity), 0
    )
    const shippingFees = 50 // رسوم شحن ثابتة - يمكن تخصيصها
    const tax = 0 // ضرائب - يمكن تخصيصها
    const total = subtotal - totalDiscount + shippingFees + tax

    await prisma.orderTotals.create({
      data: {
        subtotal,
        shippingFees,
        discount: totalDiscount,
        tax,
        total,
        order: {
          connect: { id: order.id }
        }
      }
    })

    return order
  } catch (error) {
    console.error("Error creating order:", error)
    throw new Error("فشل في إنشاء الطلب")
  }
}

// جلب جميع الطلبات
export async function getAllOrders(): Promise<FullOrder[]> {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        shipping: true,
        payment: true,
        totals: true,
        promoCode: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return orders as FullOrder[]
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw new Error("فشل في جلب الطلبات")
  }
}

// جلب طلب واحد حسب المعرف
export async function getOrderById(id: string): Promise<FullOrder | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        shipping: true,
        payment: true,
        totals: true,
        promoCode: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    })
    return order as FullOrder | null
  } catch (error) {
    console.error("Error fetching order by id:", error)
    throw new Error("فشل في جلب الطلب")
  }
}

// جلب طلبات عميل معين
export async function getCustomerOrders(customerId: string): Promise<FullOrder[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        items: true,
        shipping: true,
        payment: true,
        totals: true,
        promoCode: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return orders as FullOrder[]
  } catch (error) {
    console.error("Error fetching customer orders:", error)
    throw new Error("فشل في جلب طلبات العميل")
  }
}

// تحديث حالة الطلب
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        ...(status === "SHIPPED" && { shippedAt: new Date() }),
        ...(status === "DELIVERED" && { deliveredAt: new Date() }),
        ...(status === "CANCELLED" && { cancelledAt: new Date() })
      }
    })
    return order
  } catch (error) {
    console.error("Error updating order status:", error)
    throw new Error("فشل في تحديث حالة الطلب")
  }
}

// إضافة رقم تتبع للطلب
export async function addTrackingNumber(orderId: string, trackingNumber: string) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { trackingNumber }
    })
    return order
  } catch (error) {
    console.error("Error adding tracking number:", error)
    throw new Error("فشل في إضافة رقم التتبع")
  }
}

// تحديث حالة الدفع
export async function updatePaymentStatus(orderId: string, status: PaymentStatus, transactionId?: string) {
  try {
    const payment = await prisma.paymentInfo.updateMany({
      where: { 
        order: { id: orderId }
      },
      data: { 
        status,
        ...(transactionId && { transactionId })
      }
    })
    return payment
  } catch (error) {
    console.error("Error updating payment status:", error)
    throw new Error("فشل في تحديث حالة الدفع")
  }
}
